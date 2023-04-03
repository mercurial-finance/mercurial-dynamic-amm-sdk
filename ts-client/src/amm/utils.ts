import {
  getAmountByShare,
  calculateWithdrawableAmount,
  VaultState,
  getUnmintAmount,
  IDL as VaultIDL,
  VaultIdl,
  PROGRAM_ID as VAULT_PROGRAM_ID,
} from '@mercurial-finance/vault-sdk';
import { AnchorProvider, BN, Program } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  AccountInfo as AccountInfoInt,
  AccountLayout,
  u64,
} from '@solana/spl-token';
import {
  AccountInfo,
  Cluster,
  Connection,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import invariant from 'invariant';
import {
  CURVE_TYPE_ACCOUNTS,
  ERROR,
  WRAPPED_SOL_MINT,
  PROGRAM_ID,
  VIRTUAL_PRICE_PRECISION,
  PERMISSIONLESS_AMP,
} from './constants';
import { ConstantProductSwap, StableSwap, SwapCurve, TradeDirection } from './curve';
import {
  ConstantProductCurve,
  DepegLido,
  DepegMarinade,
  DepegNone,
  ParsedClockState,
  PoolInformation,
  PoolState,
  StableSwapCurve,
  SwapQuoteParam,
  SwapResult,
  TokenMultiplier,
} from './types';
import { Amm as AmmIdl, IDL as AmmIDL } from './idl';
import { TokenInfo } from '@solana/spl-token-registry';

export const createProgram = (connection: Connection, programId?: string) => {
  const provider = new AnchorProvider(connection, {} as any, AnchorProvider.defaultOptions());
  const ammProgram = new Program<AmmIdl>(AmmIDL, programId ?? PROGRAM_ID, provider);
  const vaultProgram = new Program<VaultIdl>(VaultIDL, VAULT_PROGRAM_ID, provider);

  return { provider, ammProgram, vaultProgram };
};

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

export const getAssociatedTokenAccount = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve: boolean = false,
) => {
  return await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenMint,
    owner,
    allowOwnerOffCurve,
  );
};

export const getOrCreateATAInstruction = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  connection: Connection,
  allowOwnerOffCurve?: boolean,
): Promise<[PublicKey, TransactionInstruction?]> => {
  let toAccount;
  try {
    toAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      tokenMint,
      owner,
      allowOwnerOffCurve ?? false,
    );
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

export const wrapSOLInstruction = (from: PublicKey, to: PublicKey, amount: bigint): TransactionInstruction[] => {
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

export const unwrapSOLInstruction = async (owner: PublicKey, allowOwnerOffCurve?: boolean) => {
  const wSolATAAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    WRAPPED_SOL_MINT,
    owner,
    allowOwnerOffCurve ?? false,
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

export const deserializeAccount = (data: Buffer | undefined): AccountInfoInt | undefined => {
  if (data == undefined || data.length == 0) {
    return undefined;
  }

  const accountInfo = AccountLayout.decode(data);
  accountInfo.mint = new PublicKey(accountInfo.mint);
  accountInfo.owner = new PublicKey(accountInfo.owner);
  accountInfo.amount = u64.fromBuffer(accountInfo.amount);

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null;
    accountInfo.delegatedAmount = new u64(0);
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate);
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
  }

  accountInfo.isInitialized = accountInfo.state !== 0;
  accountInfo.isFrozen = accountInfo.state === 2;

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
    accountInfo.isNative = true;
  } else {
    accountInfo.rentExemptReserve = null;
    accountInfo.isNative = false;
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null;
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
  }

  return accountInfo;
};

export const getOnchainTime = async (connection: Connection) => {
  const parsedClock = await connection.getParsedAccountInfo(SYSVAR_CLOCK_PUBKEY);

  const parsedClockAccount = (parsedClock.value!.data as ParsedAccountData).parsed as ParsedClockState;

  const currentTime = parsedClockAccount.info.unixTimestamp;
  return currentTime;
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
 * @param {SwapCurve} swapCurve - SwapCurve - the swap curve used to calculate the virtual price
 * @param {VaultState} vaultA - VaultState of vault A
 * @param {VaultState} vaultB - VaultState of Vault B
 * @returns an object of type PoolInformation.
 */
export const calculatePoolInfo = (
  currentTimestamp: BN,
  poolVaultALp: BN,
  poolVaultBLp: BN,
  vaultALpSupply: BN,
  vaultBLpSupply: BN,
  poolLpSupply: BN,
  swapCurve: SwapCurve,
  vaultA: VaultState,
  vaultB: VaultState,
) => {
  const vaultAWithdrawableAmount = calculateWithdrawableAmount(currentTimestamp.toNumber(), vaultA);
  const vaultBWithdrawableAmount = calculateWithdrawableAmount(currentTimestamp.toNumber(), vaultB);

  const tokenAAmount = getAmountByShare(poolVaultALp, vaultAWithdrawableAmount, vaultALpSupply);
  const tokenBAmount = getAmountByShare(poolVaultBLp, vaultBWithdrawableAmount, vaultBLpSupply);

  const d = swapCurve.computeD(tokenAAmount, tokenBAmount);
  const virtualPriceBigNum = poolLpSupply.isZero() ? new BN(0) : d.mul(VIRTUAL_PRICE_PRECISION).div(poolLpSupply);
  const virtualPrice = virtualPriceBigNum.toNumber() / VIRTUAL_PRICE_PRECISION.toNumber();

  const poolInformation: PoolInformation = {
    tokenAAmount,
    tokenBAmount,
    virtualPrice,
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
export const calculateSwapQuote = (inTokenMint: PublicKey, inAmountLamport: BN, params: SwapQuoteParam): SwapResult => {
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

  let swapCurve: SwapCurve;
  if ('stable' in poolState.curveType) {
    const { amp, depeg, tokenMultiplier } = poolState.curveType['stable'] as any;
    swapCurve = new StableSwap(amp.toNumber(), tokenMultiplier, depeg, depegAccounts, new BN(currentTime));
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

  const { outAmount: destinationAmount, priceImpact } = swapCurve.computeOutAmount(
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

  return {
    amountOut: actualDestinationAmount,
    fee: adminFee.add(tradeFee),
    priceImpact,
  };
};

/**
 * It takes two numbers, and returns three numbers
 * @param {number} decimalA - The number of decimal places for token A.
 * @param {number} decimalB - The number of decimal places for token B.
 * @returns A TokenMultiplier object with the following properties:
 * - tokenAMultiplier
 * - tokenBMultiplier
 * - precisionFactor
 */
export const computeTokenMultiplier = (decimalA: number, decimalB: number): TokenMultiplier => {
  const precisionFactor = Math.max(decimalA, decimalB);
  const tokenAMultiplier = new BN(10 ** (precisionFactor - decimalA));
  const tokenBMultiplier = new BN(10 ** (precisionFactor - decimalB));
  return {
    tokenAMultiplier,
    tokenBMultiplier,
    precisionFactor,
  };
};

/**
 * It fetches the pool account from the AMM program, and returns the mint addresses for the two tokens
 * @param {Connection} connection - Connection - The connection to the Solana cluster
 * @param {string} poolAddress - The address of the pool account.
 * @returns The tokenAMint and tokenBMint addresses for the pool.
 */
export async function getTokensMintFromPoolAddress(
  connection: Connection,
  poolAddress: string,
  opt?: {
    programId?: string;
  },
) {
  const { ammProgram } = createProgram(connection, opt?.programId);

  const poolAccount = await ammProgram.account.pool.fetchNullable(new PublicKey(poolAddress));

  if (!poolAccount) return;

  return {
    tokenAMint: poolAccount.tokenAMint,
    tokenBMint: poolAccount.tokenBMint,
  };
}

export function derivePoolAddress(
  connection: Connection,
  tokenInfoA: TokenInfo,
  tokenInfoB: TokenInfo,
  isStable: boolean,
  opt?: {
    programId?: string;
  },
) {
  const { ammProgram } = createProgram(connection);
  const curveType = generateCurveType(tokenInfoA, tokenInfoB, isStable);
  const tokenAMint = new PublicKey(tokenInfoA.address);
  const tokenBMint = new PublicKey(tokenInfoB.address);

  const [poolPubkey] = PublicKey.findProgramAddressSync(
    [
      Buffer.from([encodeCurveType(curveType)]),
      getFirstKey(tokenAMint, tokenBMint),
      getSecondKey(tokenAMint, tokenBMint),
    ],
    ammProgram.programId,
  );

  return poolPubkey;
}

/**
 * It checks if a pool exists by checking if the pool account exists
 * @param {Connection} connection - Connection - the connection to the Solana cluster
 * @param {TokenInfo} tokenInfoA - TokenInfo
 * @param {TokenInfo} tokenInfoB - TokenInfo
 * @param {boolean} isStable - boolean - whether the pool is stable or not
 * @returns A boolean value.
 */
export async function checkPoolExists(
  connection: Connection,
  tokenInfoA: TokenInfo,
  tokenInfoB: TokenInfo,
  isStable: boolean,
  opt?: {
    programId: string;
  },
): Promise<PublicKey | undefined> {
  const { ammProgram } = createProgram(connection, opt?.programId);

  const curveType = generateCurveType(tokenInfoA, tokenInfoB, isStable);

  const tokenAMint = new PublicKey(tokenInfoA.address);
  const tokenBMint = new PublicKey(tokenInfoB.address);
  const [poolPubkey] = PublicKey.findProgramAddressSync(
    [
      Buffer.from([encodeCurveType(curveType)]),
      getFirstKey(tokenAMint, tokenBMint),
      getSecondKey(tokenAMint, tokenBMint),
    ],
    ammProgram.programId,
  );

  const poolAccount = await ammProgram.account.pool.fetchNullable(poolPubkey);

  if (!poolAccount) return;

  return poolPubkey;
}

export function chunks<T>(array: T[], size: number): T[][] {
  return Array.apply<number, T[], T[][]>(0, new Array(Math.ceil(array.length / size))).map((_, index) =>
    array.slice(index * size, (index + 1) * size),
  );
}

export async function chunkedGetMultipleAccountInfos(
  connection: Connection,
  pks: PublicKey[],
  chunkSize: number = 100,
) {
  const accountInfoMap = new Map<string, AccountInfo<Buffer> | null>();
  const accountInfos = (
    await Promise.all(chunks(pks, chunkSize).map((chunk) => connection.getMultipleAccountsInfo(chunk)))
  ).flat();

  return accountInfos;
}

export function encodeCurveType(curve: StableSwapCurve | ConstantProductCurve) {
  if (curve['constantProduct']) {
    return 0;
  } else if (curve['stable']) {
    return 1;
  } else {
    throw new Error('Unknown curve type');
  }
}

export function getSecondKey(key1: PublicKey, key2: PublicKey) {
  const buf1 = key1.toBuffer();
  const buf2 = key2.toBuffer();
  // Buf1 > buf2
  if (Buffer.compare(buf1, buf2) == 1) {
    return buf2;
  }
  return buf1;
}

export function getFirstKey(key1: PublicKey, key2: PublicKey) {
  const buf1 = key1.toBuffer();
  const buf2 = key2.toBuffer();
  // Buf1 > buf2
  if (Buffer.compare(buf1, buf2) == 1) {
    return buf1;
  }
  return buf2;
}

export const DepegType = {
  none: (): DepegNone => {
    return {
      none: {},
    };
  },
  marinade: (): DepegMarinade => {
    return {
      marinade: {},
    };
  },
  lido: (): DepegLido => {
    return {
      lido: {},
    };
  },
};

export function generateCurveType(tokenInfoA: TokenInfo, tokenInfoB: TokenInfo, isStable: boolean) {
  return isStable
    ? {
        stable: {
          amp: PERMISSIONLESS_AMP,
          tokenMultiplier: computeTokenMultiplier(tokenInfoA.decimals, tokenInfoB.decimals),
          depeg: { baseVirtualPrice: new BN(0), baseCacheUpdated: new BN(0), depegType: DepegType.none() },
        },
      }
    : { constantProduct: {} };
}
