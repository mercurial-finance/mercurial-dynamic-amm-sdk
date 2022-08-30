import {
  getAmountByShare,
  calculateWithdrawableAmount,
  VaultState,
  getUnmintAmount,
} from '@mercurial-finance/vault-sdk';
import { BN, EventParser } from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  AccountInfo,
  Connection,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import invariant from 'invariant';
import { CURVE_TYPE_ACCOUNTS, ERROR, VIRTUAL_PRICE_PRECISION, WRAPPED_SOL_MINT } from './constants';
import { ConstantProductSwap, StableSwap, SwapCurve, TradeDirection } from './curve';
import {
  AccountsInfo,
  ApyState,
  ParsedClockState,
  PoolInformation,
  PoolState,
  SwapQuoteParam,
  VirtualPrice,
} from './types';

/**
 * It takes an amount and a slippage rate, and returns the maximum amount that can be received with
 * that slippage rate
 * @param {BN} amount - The amount of tokens you want to buy.
 * @param {number} slippageRate - The maximum percentage of slippage you're willing to accept. (Max to 2 decimal place)
 * @returns The maximum amount of tokens that can be bought with the given amount of ETH, given the
 * slippage rate.
 */
export const getMaxAmountWithSlippage = (amount: BN, slippageRate: number) => {
  const slippage = ((100 + slippageRate) / 100) * 10000;
  return amount.mul(new BN(slippage)).div(new BN(10000));
};

/**
 * It takes an amount and a slippage rate, and returns the minimum amount that will be received after
 * slippage
 * @param {BN} amount - The amount of tokens you want to sell.
 * @param {number} slippageRate - The percentage of slippage you're willing to accept. (Max to 2 decimal place)
 * @returns The minimum amount that can be received after slippage is applied.
 */
export const getMinAmountWithSlippage = (amount: BN, slippageRate: number) => {
  const slippage = ((100 - slippageRate) / 100) * 10000;
  return amount.mul(new BN(slippage)).div(new BN(10000));
};

export const getOrCreateATAInstruction = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  connection: Connection,
): Promise<[PublicKey, TransactionInstruction?]> => {
  let toAccount;
  try {
    toAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenMint, owner);
    const account = await connection.getAccountInfo(toAccount);
    if (!account) {
      const ix = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        toAccount,
        owner,
        owner,
      );
      return [toAccount, ix];
    }
    return [toAccount, undefined];
  } catch (e) {
    /* handle error */
    console.error('Error::getOrCreateATAInstruction', e);
    throw e;
  }
};

export const wrapSOLInstruction = (from: PublicKey, to: PublicKey, amount: number): TransactionInstruction[] => {
  return [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount,
    }),
    new TransactionInstruction({
      keys: [
        {
          pubkey: to,
          isSigner: false,
          isWritable: true,
        },
      ],
      data: Buffer.from(new Uint8Array([17])),
      programId: TOKEN_PROGRAM_ID,
    }),
  ];
};

export const unwrapSOLInstruction = async (owner: PublicKey) => {
  const wSolATAAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    WRAPPED_SOL_MINT,
    owner,
  );

  if (wSolATAAccount) {
    const closedWrappedSolInstruction = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wSolATAAccount,
      owner,
      owner,
      [],
    );
    return closedWrappedSolInstruction;
  }
  return null;
};

export const getOnchainTime = async (connection: Connection) => {
  const parsedClock = await connection.getParsedAccountInfo(SYSVAR_CLOCK_PUBKEY);

  const parsedClockAccount = (parsedClock.value!.data as ParsedAccountData).parsed as ParsedClockState;

  const currentTime = parsedClockAccount.info.unixTimestamp;
  return currentTime;
};

// Typescript implementation of https://github.com/mercurial-finance/mercurial-dynamic-amm/blob/main/programs/amm/src/state.rs#L87
const getLastVirtualPrice = (apyState: ApyState): VirtualPrice | null => {
  const { snapshot } = apyState;
  const virtualPrices = snapshot.virtualPrices as VirtualPrice[];

  let prev = ((_) => {
    if (snapshot.pointer.eq(new BN(0))) {
      return virtualPrices.length - 1;
    } else {
      return snapshot.pointer.toNumber() - 1;
    }
  })();

  const virtualPrice = virtualPrices[prev];
  if (virtualPrice.price.eq(new BN(0))) {
    return null;
  }
  return virtualPrice;
};

// Typescript implementation of https://github.com/mercurial-finance/mercurial-dynamic-amm/blob/main/programs/amm/src/state.rs#L101
const getFirstVirtualPrice = (apyState: ApyState): VirtualPrice | null => {
  const { snapshot } = apyState;
  let initial = snapshot.pointer.toNumber();
  let current = initial;

  const virtualPrices = snapshot.virtualPrices as VirtualPrice[];

  while ((current + 1) % virtualPrices.length != initial) {
    if (virtualPrices[current].price.eq(new BN(0))) {
      current = (current + 1) % virtualPrices.length;
    } else {
      break;
    }
  }

  let virtualPrice = virtualPrices[current];
  if (virtualPrice.price.eq(new BN(0))) {
    return null;
  }
  return virtualPrice;
};

/**
 * Compute "actual" amount deposited to vault (precision loss)
 * @param depositAmount
 * @param beforeAmount
 * @param vaultLpBalance
 * @param vaultLpSupply
 * @param vaultTotalAmount
 * @returns
 */
export const computeActualDepositAmount = (
  depositAmount: BN,
  beforeAmount: BN,
  vaultLpBalance: BN,
  vaultLpSupply: BN,
  vaultTotalAmount: BN,
): BN => {
  if (depositAmount.eq(new BN(0))) return depositAmount;

  const vaultLpMinted = depositAmount.mul(vaultLpSupply).div(vaultTotalAmount);
  vaultLpSupply = vaultLpSupply.add(vaultLpMinted);
  vaultTotalAmount = vaultTotalAmount.add(depositAmount);
  vaultLpBalance = vaultLpBalance.add(vaultLpMinted);

  const afterAmount = vaultLpBalance.mul(vaultTotalAmount).div(vaultLpSupply);

  return afterAmount.sub(beforeAmount);
};

/**
 * Compute pool information, Typescript implementation of https://github.com/mercurial-finance/mercurial-dynamic-amm/blob/main/programs/amm/src/lib.rs#L960
 * @param {number} currentTime - the on solana chain time in seconds (SYSVAR_CLOCK_PUBKEY)
 * @param {BN} poolVaultALp - The amount of LP tokens in the pool for token A
 * @param {BN} poolVaultBLp - The amount of Lp tokens in the pool for token B,
 * @param {BN} vaultALpSupply - The total amount of Vault A LP tokens in the pool.
 * @param {BN} vaultBLpSupply - The total amount of Vault B LP token in the pool.
 * @param {BN} poolLpSupply - The total amount of LP tokens in the pool.
 * @param {ApyState} apyState - ApyState
 * @param {SwapCurve} swapCurve - SwapCurve - the swap curve used to calculate the virtual price
 * @param {VaultState} vaultA - VaultState of vault A
 * @param {VaultState} vaultB - VaultState of Vault B
 * @returns an object of type PoolInformation.
 */
export const calculatePoolInfo = (
  currentTime: number,
  poolVaultALp: BN,
  poolVaultBLp: BN,
  vaultALpSupply: BN,
  vaultBLpSupply: BN,
  poolLpSupply: BN,
  apyState: ApyState,
  swapCurve: SwapCurve,
  vaultA: VaultState,
  vaultB: VaultState,
) => {
  const currentTimestamp = new BN(currentTime);

  const vaultAWithdrawableAmount = calculateWithdrawableAmount(currentTime, vaultA);
  const vaultBWithdrawableAmount = calculateWithdrawableAmount(currentTime, vaultB);

  const tokenAAmount = getAmountByShare(poolVaultALp, vaultAWithdrawableAmount, vaultALpSupply);
  const tokenBAmount = getAmountByShare(poolVaultBLp, vaultBWithdrawableAmount, vaultBLpSupply);

  let firstTimestamp = new BN(0);
  let apy,
    virtualPriceNumber,
    firstVirtualPriceNumber = 0;

  const d = swapCurve.computeD(tokenAAmount, tokenBAmount);
  let latestVirtualPrice = d.mul(VIRTUAL_PRICE_PRECISION).div(poolLpSupply);

  if (latestVirtualPrice.eq(new BN(0))) {
    const lastVirtualPrice = getLastVirtualPrice(apyState);
    if (lastVirtualPrice) {
      latestVirtualPrice = lastVirtualPrice.price;
    }
  }

  const firstVirtualPrice = getFirstVirtualPrice(apyState);

  if (firstVirtualPrice && latestVirtualPrice.gt(new BN(0))) {
    // Compute APY
    const second = latestVirtualPrice.toNumber() / VIRTUAL_PRICE_PRECISION.toNumber();
    const first = firstVirtualPrice.price.toNumber() / VIRTUAL_PRICE_PRECISION.toNumber();
    const timeElapsed = currentTimestamp.sub(firstVirtualPrice.timestamp).toNumber();
    const rate = second / first;
    const frequency = (365 * 24 * 3600) / timeElapsed;
    const compoundRate = rate ** frequency;
    apy = (compoundRate - 1) * 100;

    virtualPriceNumber = second;
    firstVirtualPriceNumber = first;
    firstTimestamp = firstVirtualPrice.timestamp;
  }

  const poolInformation: PoolInformation = {
    tokenAAmount,
    tokenBAmount,
    currentTimestamp,
    apy,
    firstTimestamp,
    firstVirtualPrice: firstVirtualPriceNumber,
    virtualPrice: virtualPriceNumber,
  };

  return poolInformation;
};

export const calculateAdminTradingFee = (amount: BN, poolState: PoolState) => {
  const { ownerTradeFeeDenominator, ownerTradeFeeNumerator } = poolState.fees;
  return amount.mul(ownerTradeFeeNumerator).div(ownerTradeFeeDenominator);
};

export const calculateTradingFee = (amount: BN, poolState: PoolState) => {
  const { tradeFeeDenominator, tradeFeeNumerator } = poolState.fees;
  return amount.mul(tradeFeeNumerator).div(tradeFeeDenominator);
};

/**
 * "Calculate the maximum amount of tokens that can be swapped out of a pool."
 *
 * @param {PublicKey} tokenMint - The mint that want to swap out
 * @param {PublicKey} tokenAMint - The public key of the token A mint.
 * @param {PublicKey} tokenBMint - The public key of the token B mint.
 * @param {BN} tokenAAmount - The amount of token A that the user wants to swap out.
 * @param {BN} tokenBAmount - The amount of token B that the user wants to swap out.
 * @param {BN} vaultAReserve - The amount of tokenA that the vault has in reserve.
 * @param {BN} vaultBReserve - The amount of tokenB that the vault has in reserve.
 * @returns The max amount of tokens that can be swapped out.
 */
export const calculateMaxSwapOutAmount = (
  tokenMint: PublicKey,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  tokenAAmount: BN,
  tokenBAmount: BN,
  vaultAReserve: BN,
  vaultBReserve: BN,
) => {
  invariant(tokenMint.equals(tokenAMint) || tokenMint.equals(tokenBMint), ERROR.INVALID_MINT);

  const [outTotalAmount, outReserveBalance] = tokenMint.equals(tokenAMint)
    ? [tokenAAmount, vaultAReserve]
    : [tokenBAmount, vaultBReserve];

  return outTotalAmount.gt(outReserveBalance) ? outReserveBalance : outTotalAmount;
};

/**
 * It gets the account info for the two accounts that are used in depeg Pool
 * @param {Connection} connection - Connection - The connection to the Solana cluster
 * @returns A map of the depeg accounts.
 */
export const getDepegAccounts = async (connection: Connection): Promise<Map<String, AccountInfo<Buffer>>> => {
  const depegAccounts = new Map<String, AccountInfo<Buffer>>();
  const [marinadeBuffer, solidoBuffer] = await connection.getMultipleAccountsInfo([
    CURVE_TYPE_ACCOUNTS.marinade,
    CURVE_TYPE_ACCOUNTS.lido,
  ]);
  depegAccounts.set(CURVE_TYPE_ACCOUNTS.marinade.toBase58(), marinadeBuffer!);
  depegAccounts.set(CURVE_TYPE_ACCOUNTS.lido.toBase58(), solidoBuffer!);

  return depegAccounts;
};

/**
 * It calculates the amount of tokens you will receive after swapping your tokens
 * @param {PublicKey} inTokenMint - The mint of the token you're swapping in.
 * @param {BN} inAmountLamport - The amount of the input token you want to swap.
 * @param {SwapQuoteParam} params - SwapQuoteParam
 * @param {PoolState} params.poolState - pool state that fetch from program
 * @param {VaultState} params.vaultA - vault A state that fetch from vault program
 * @param {VaultState} params.vaultB - vault B state that fetch from vault program
 * @param {BN} params.poolVaultALp - The amount of LP tokens in the pool for token A (`PoolState.aVaultLp` accountInfo)
 * @param {BN} params.poolVaultBLp - The amount of LP tokens in the pool for token B (`PoolState.bVaultLp` accountInfo)
 * @param {BN} params.vaultALpSupply - vault A lp supply (`VaultState.lpMint` accountInfo)
 * @param {BN} params.vaultBLpSupply - vault B lp supply (`VaultState.lpMint` accountInfo)
 * @param {BN} params.vaultAReserve - vault A reserve (`VaultState.tokenVault` accountInfo)
 * @param {BN} params.vaultBReserve - vault B reserve (`VaultState.tokenVault` accountInfo)
 * @param {BN} params.currentTime - on chain time (use `SYSVAR_CLOCK_PUBKEY`)
 * @param {BN} params.depegAccounts - A map of the depeg accounts. (get from `getDepegAccounts` util)
 * @returns The amount of tokens that will be received after the swap.
 */
export const calculateSwapQuote = (inTokenMint: PublicKey, inAmountLamport: BN, params: SwapQuoteParam) => {
  const {
    vaultA,
    vaultB,
    vaultALpSupply,
    vaultBLpSupply,
    poolState,
    poolVaultALp,
    poolVaultBLp,
    currentTime,
    depegAccounts,
    vaultAReserve,
    vaultBReserve,
  } = params;
  const { tokenAMint, tokenBMint } = poolState;
  invariant(inTokenMint.equals(tokenAMint) || inTokenMint.equals(tokenBMint), ERROR.INVALID_MINT);

  let swapCurve;
  if ('stable' in poolState.curveType) {
    const { amp, depeg, tokenMultiplier } = poolState.curveType['stable'];
    swapCurve = new StableSwap(amp.toNumber(), tokenMultiplier, depeg, depegAccounts, currentTime);
  } else {
    swapCurve = new ConstantProductSwap();
  }

  const vaultAWithdrawableAmount = calculateWithdrawableAmount(currentTime, vaultA);
  const vaultBWithdrawableAmount = calculateWithdrawableAmount(currentTime, vaultB);

  const tokenAAmount = getAmountByShare(poolVaultALp, vaultAWithdrawableAmount, vaultALpSupply);
  const tokenBAmount = getAmountByShare(poolVaultBLp, vaultBWithdrawableAmount, vaultBLpSupply);

  const isFromAToB = inTokenMint.equals(tokenAMint);
  const [
    sourceAmount,
    swapSourceAmount,
    swapDestinationAmount,
    swapSourceVault,
    swapDestinationVault,
    swapSourceVaultLpSupply,
    swapDestinationVaultLpSupply,
    tradeDirection,
  ] = isFromAToB
    ? [inAmountLamport, tokenAAmount, tokenBAmount, vaultA, vaultB, vaultALpSupply, vaultBLpSupply, TradeDirection.AToB]
    : [
        inAmountLamport,
        tokenBAmount,
        tokenAAmount,
        vaultB,
        vaultA,
        vaultBLpSupply,
        vaultALpSupply,
        TradeDirection.BToA,
      ];
  const adminFee = calculateAdminTradingFee(sourceAmount, poolState);
  const tradeFee = calculateTradingFee(sourceAmount, poolState);

  const sourceVaultWithdrawableAmount = calculateWithdrawableAmount(currentTime, swapSourceVault);
  // Get vault lp minted when deposit to the vault
  const sourceVaultLp = getUnmintAmount(
    sourceAmount.sub(adminFee),
    sourceVaultWithdrawableAmount,
    swapSourceVaultLpSupply,
  );

  const actualSourceAmount = getAmountByShare(sourceVaultLp, sourceVaultWithdrawableAmount, swapSourceVaultLpSupply);

  let sourceAmountWithFee = actualSourceAmount.sub(tradeFee);

  const destinationAmount = swapCurve.computeOutAmount(
    sourceAmountWithFee,
    swapSourceAmount,
    swapDestinationAmount,
    tradeDirection,
  );

  const destinationVaultWithdrawableAmount = calculateWithdrawableAmount(currentTime, swapDestinationVault);
  // Get vault lp to burn when withdraw from the vault
  const destinationVaultLp = getUnmintAmount(
    destinationAmount,
    destinationVaultWithdrawableAmount,
    swapDestinationVaultLpSupply,
  );

  let actualDestinationAmount = getAmountByShare(
    destinationVaultLp,
    destinationVaultWithdrawableAmount,
    swapDestinationVaultLpSupply,
  );

  const maxSwapOutAmount = calculateMaxSwapOutAmount(
    tradeDirection == TradeDirection.AToB ? tokenBMint : tokenAMint,
    tokenAMint,
    tokenBMint,
    tokenAAmount,
    tokenBAmount,
    vaultAReserve,
    vaultBReserve,
  );

  invariant(actualDestinationAmount.lt(maxSwapOutAmount), 'Out amount > vault reserve');

  return actualDestinationAmount;
};
