import { vault } from "@mercurial-finance/vault-sdk";
import { BN, Program, Provider } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  AccountInfo,
  ParsedAccountData,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import invariant from "invariant";
import { ERROR, EXTRA_ACCOUNTS, POOL_BASE_KEY, PROGRAM_ID } from "./constants";
import { StableSwap, SwapCurve, TradeDirection } from "./curve";
import { ConstantProductSwap } from "./curve/constant-product";
import { Amm, IDL as AmmIDL } from "./idl/amm";
import { PoolSpl } from "./types/pool_spl";
import {
  CurveType,
  encodeCurveType,
  ParsedClockState,
  PoolState,
} from "./types/pool_state";
import { VaultSpl } from "./types/vault_spl";

export type AmmProgram = Program<Amm>;
const { default: Vault } = vault;
type Vault = vault.default;

const PRECISION = 100_000_000;

function fromTokenMintsToCompositeKey(
  tokenAMint: PublicKey,
  tokenBMint: PublicKey
) {
  const tokenAMintBuffer = tokenAMint.toBuffer();
  const tokenBMinBuffer = tokenBMint.toBuffer();
  const compositeKeyBuffer: number[] = [];
  for (let i = 0; i < tokenAMintBuffer.length; i++) {
    compositeKeyBuffer[i] = tokenAMintBuffer[i] | tokenBMinBuffer[i];
  }
  return new PublicKey(compositeKeyBuffer);
}

/**
 * Compute "actual" amount deposited to vault (precision loss)
 * @param depositAmount
 * @param beforeAmount
 * @param vaultLpBalance
 * @param vaultLpSupply
 * @param vaultTotalAmount
 * @returns
 */
function computeActualDepositAmount(
  depositAmount: BN,
  beforeAmount: BN,
  vaultLpBalance: BN,
  vaultLpSupply: BN,
  vaultTotalAmount: BN
): BN {
  const vaultLpMinted = depositAmount.mul(vaultLpSupply).div(vaultTotalAmount);
  vaultLpSupply = vaultLpSupply.add(vaultLpMinted);
  vaultTotalAmount = vaultTotalAmount.add(depositAmount);
  vaultLpBalance = vaultLpBalance.add(vaultLpMinted);

  const afterAmount = vaultLpBalance.mul(vaultTotalAmount).div(vaultLpSupply);

  return afterAmount.sub(beforeAmount);
}

export class Pool {
  swapCurve: SwapCurve;

  constructor(
    private program: AmmProgram,
    private vaultA: Vault,
    private vaultB: Vault,
    public state: PoolState,
    private vaultASpl: VaultSpl,
    private vaultBSpl: VaultSpl,
    private poolSpl: PoolSpl,
    private onChainTime: number = 0,
    private extraAccounts: Map<String, AccountInfo<Buffer>>
  ) {
    if ("stable" in this.state.curveType) {
      const { amp, depeg, tokenMultiplier } = this.state.curveType.stable;
      this.swapCurve = new StableSwap(
        amp.toNumber(),
        tokenMultiplier,
        depeg,
        this.onChainTime,
        this.extraAccounts
      );
    } else {
      this.swapCurve = new ConstantProductSwap();
    }
  }

  static createProgram(provider: Provider): AmmProgram {
    return new Program<Amm>(AmmIDL, PROGRAM_ID, provider);
  }

  /**
   *
   * @param pool
   * Load the pool state
   */
  static async load(
    walletPublicKey: PublicKey,
    program: AmmProgram,
    pool: PublicKey
  ) {
    const poolState = (await program.account.pool.fetchNullable(
      pool
    )) as unknown as PoolState;
    invariant(poolState, `Pool ${pool.toBase58()} not found`);

    // TODO: Fix underlying Vault to be loaded and not default to invalid state Vault
    const vaultA = new Vault(program.provider, walletPublicKey);
    const vaultB = new Vault(program.provider, walletPublicKey);
    await Promise.all([
      vaultA.init(poolState.tokenAMint),
      vaultB.init(poolState.tokenBMint),
    ]);

    const [
      parsedClock,
      [
        vaultATokenVault,
        vaultBTokenVault,
        vaultALpMint,
        vaultBLpMint,
        aVaultLp,
        bVaultLp,
        lpMint,
      ],
    ] = await Promise.all([
      program.provider.connection.getParsedAccountInfo(SYSVAR_CLOCK_PUBKEY),
      program.provider.connection.getMultipleAccountsInfo([
        vaultA.state!.tokenVault,
        vaultB.state!.tokenVault,
        vaultA.state!.lpMint,
        vaultB.state!.lpMint,
        poolState.aVaultLp,
        poolState.bVaultLp,
        poolState.lpMint,
      ]),
    ]);

    const parsedClockAccount = (parsedClock.value!.data as ParsedAccountData)
      .parsed as ParsedClockState;

    // What is the meaning of those default objects?
    const poolSpl = new PoolSpl();
    const vaultASpl = new VaultSpl();
    const vaultBSpl = new VaultSpl();

    vaultASpl.fromAccountsInfo(vaultATokenVault!, vaultALpMint!);
    vaultBSpl.fromAccountsInfo(vaultBTokenVault!, vaultBLpMint!);
    poolSpl.fromAccountsInfo(aVaultLp!, bVaultLp!, lpMint!);
    const onChainTime = parsedClockAccount.info.unixTimestamp;
    const extraAccounts = new Map<String, AccountInfo<Buffer>>();

    if (
      poolState.curveType["stable"] &&
      !poolState.curveType["stable"]["depeg"]["depegType"]["none"]
    ) {
      let extraAddresses: PublicKey[] = [];
      for (const [_, addresses] of Object.entries(EXTRA_ACCOUNTS)) {
        extraAddresses = extraAddresses.concat(addresses);
      }
      const accounts =
        await program.provider.connection.getMultipleAccountsInfo(
          extraAddresses
        );
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const address = extraAddresses[i].toBase58();
        if (account) {
          extraAccounts.set(address, account);
        }
      }
    }

    return new Pool(
      program,
      vaultA,
      vaultB,
      poolState,
      vaultASpl,
      vaultBSpl,
      poolSpl,
      onChainTime,
      extraAccounts
    );
  }

  /**
   * Get the total token A, and B amount in the pool
   * @returns [totalTokenA, totalTokenB]
   */
  getTokensBalance(): [BN, BN] {
    const totalAAmount = this.vaultA.getAmountByShare(
      this.onChainTime,
      this.poolSpl.vaultALpBalance,
      this.vaultASpl.totalLpSupply
    );
    const totalBAmount = this.vaultB.getAmountByShare(
      this.onChainTime,
      this.poolSpl.vaultBLpBalance,
      this.vaultBSpl.totalLpSupply
    );
    return [new BN(totalAAmount), new BN(totalBAmount)];
  }

  /**
   * Get maximum in amount (source amount) for swap
   * !!! NOTE it is just estimation
   * @param tokenMint
   */
  getMaxSwappableInAmount(tokenMint: PublicKey) {
    // Get maximum in amount by swapping maximum withdrawable amount of tokenMint in the pool
    invariant(
      tokenMint.equals(this.state.tokenAMint) ||
        tokenMint.equals(this.state.tokenBMint),
      ERROR.INVALID_MINT
    );
    let [tokenAAmount, tokenBAmount] = this.getTokensBalance();
    const [outTokenMint, swapSourceAmount, swapDestAmount, tradeDirection] =
      tokenMint.equals(this.state.tokenAMint)
        ? [
            this.state.tokenBMint,
            tokenAAmount,
            tokenBAmount,
            TradeDirection.AToB,
          ]
        : [
            this.state.tokenAMint,
            tokenBAmount,
            tokenAAmount,
            TradeDirection.BToA,
          ];
    let maxOutAmount = this.getMaxSwappableOutAmount(outTokenMint);
    // Impossible to deplete the pool, therefore if maxOutAmount is equals to tokenAmount in pool, subtract it by 1
    if (maxOutAmount.eq(swapDestAmount)) {
      maxOutAmount = maxOutAmount.sub(new BN(1)); // Left 1 token in pool
    }
    let maxInAmount = this.swapCurve!.computeInAmount(
      maxOutAmount,
      swapSourceAmount,
      swapDestAmount,
      tradeDirection
    );
    const adminFee = this.calculateAdminTradingFee(maxInAmount);
    const tradeFee = this.calculateTradingFee(maxInAmount);
    maxInAmount = maxInAmount.sub(adminFee);
    maxInAmount = maxInAmount.sub(tradeFee);
    return maxInAmount;
  }

  /**
   *
   * @param tokenMint
   * Get the maximum available amount to be swap out. This take consideration into the vault reserve
   */
  getMaxSwappableOutAmount(tokenMint: PublicKey) {
    invariant(
      tokenMint.equals(this.state.tokenAMint) ||
        tokenMint.equals(this.state.tokenBMint),
      ERROR.INVALID_MINT
    );

    const [totalAAmount, totalBAmount] = this.getTokensBalance();
    const [outTotalAmount, outReserveBalance] = tokenMint.equals(
      this.state.tokenAMint
    )
      ? [totalAAmount, this.vaultASpl.reserveBalance]
      : [totalBAmount, this.vaultBSpl.reserveBalance];

    return outTotalAmount.gt(outReserveBalance)
      ? outReserveBalance
      : outTotalAmount;
  }

  private calculateAdminTradingFee(amount: BN) {
    const { ownerTradeFeeDenominator, ownerTradeFeeNumerator } =
      this.state.fees;
    return amount.mul(ownerTradeFeeNumerator).div(ownerTradeFeeDenominator);
  }

  private calculateTradingFee(amount: BN) {
    const { tradeFeeDenominator, tradeFeeNumerator } = this.state.fees;
    return amount.mul(tradeFeeNumerator).div(tradeFeeDenominator);
  }

  /**
   * Calculate the token amount to receive by unstaking lp token
   * @param lpAmount
   * @param tokenMint
   */
  computeWithdrawOne(lpAmount: BN, tokenMint: PublicKey): BN {
    const [tokenAAmount, tokenBAmount] = this.getTokensBalance();
    const tradeDirection = tokenMint.equals(this.state.tokenAMint)
      ? TradeDirection.BToA
      : TradeDirection.AToB;

    const outAmount = this.swapCurve!.computeWithdrawOne(
      lpAmount,
      this.poolSpl.totalLpSupply,
      tokenAAmount,
      tokenBAmount,
      this.state.fees,
      tradeDirection
    );

    const [vaultLpSupply, vaultTotalAmount] =
      tradeDirection == TradeDirection.AToB
        ? [
            this.vaultBSpl.totalLpSupply,
            this.vaultB.getUnlockedAmount(this.onChainTime),
          ]
        : [
            this.vaultASpl.totalLpSupply,
            this.vaultA.getUnlockedAmount(this.onChainTime),
          ];

    const vaultLpToBurn = outAmount.mul(vaultLpSupply).div(vaultTotalAmount);
    // "Actual" out amount (precision loss)
    return vaultLpToBurn.mul(vaultTotalAmount).div(vaultLpSupply);
  }

  /**
   * Calculate the LP amount to receive when deposit imbalance balance
   * @param depositAAmount
   * @param depositBAmount
   */
  computeImbalanceDeposit(depositAAmount: BN, depositBAmount: BN): BN {
    const [tokenAAmount, tokenBAmount] = this.getTokensBalance();

    const actualDepositAAmount = computeActualDepositAmount(
      depositAAmount,
      tokenAAmount,
      this.poolSpl.vaultALpBalance,
      this.vaultASpl.totalLpSupply,
      this.vaultA.getUnlockedAmount(this.onChainTime)
    );

    const actualDepositBAmount = computeActualDepositAmount(
      depositBAmount,
      tokenBAmount,
      this.poolSpl.vaultBLpBalance,
      this.vaultBSpl.totalLpSupply,
      this.vaultB.getUnlockedAmount(this.onChainTime)
    );

    return this.swapCurve!.computeImbalanceDeposit(
      actualDepositAAmount,
      actualDepositBAmount,
      tokenAAmount,
      tokenBAmount,
      this.poolSpl.totalLpSupply,
      this.state.fees
    );
  }

  /**
   * Calculate the virtual price of the LP
   * @returns
   */
  getVirtualPrice() {
    let [tokenAAmount, tokenBAmount] = this.getTokensBalance();
    let invariantD = this.swapCurve!.computeD(tokenAAmount, tokenBAmount);
    let virtualPrice = invariantD
      .mul(new BN(PRECISION))
      .div(this.poolSpl.totalLpSupply);
    return virtualPrice.toNumber() / PRECISION; // return float, make life easier
  }

  /**
   * Calculate out amount for the swap
   * @param inTokenMint
   * @param inAmount
   * @returns
   */
  getOutAmount(inTokenMint: PublicKey, inAmount: BN): BN {
    invariant(
      inTokenMint.equals(this.state.tokenAMint) ||
        inTokenMint.equals(this.state.tokenBMint),
      ERROR.INVALID_MINT
    );

    let [tokenAAmount, tokenBAmount] = this.getTokensBalance();

    const [
      sourceAmount,
      swapSourceAmount,
      swapDestinationAmount,
      swapSourceVault,
      swapDestinationVault,
      swapSourceVaultSpl,
      swapDestinationVaultSpl,
      tradeDirection,
    ] = inTokenMint.equals(this.state.tokenAMint)
      ? [
          inAmount,
          tokenAAmount,
          tokenBAmount,
          this.vaultA,
          this.vaultB,
          this.vaultASpl,
          this.vaultBSpl,
          TradeDirection.AToB,
        ]
      : [
          inAmount,
          tokenBAmount,
          tokenAAmount,
          this.vaultB,
          this.vaultA,
          this.vaultBSpl,
          this.vaultASpl,
          TradeDirection.BToA,
        ];
    const adminFee = this.calculateAdminTradingFee(sourceAmount);
    const tradeFee = this.calculateTradingFee(sourceAmount);

    // Get vault lp minted when deposit to the vault
    const sourceVaultLp = swapSourceVault.getUnmintAmount(
      this.onChainTime,
      sourceAmount.sub(adminFee),
      swapSourceVaultSpl.totalLpSupply
    );

    const actualSourceAmount = swapSourceVault.getAmountByShare(
      this.onChainTime,
      sourceVaultLp,
      swapSourceVaultSpl.totalLpSupply
    );

    let sourceAmountWithFee = actualSourceAmount.sub(tradeFee);

    const destinationAmount = this.swapCurve!.computeOutAmount(
      sourceAmountWithFee,
      swapSourceAmount,
      swapDestinationAmount,
      tradeDirection
    );

    // Get vault lp to burn when withdraw from the vault
    const destinationVaultLp = swapDestinationVault.getUnmintAmount(
      this.onChainTime,
      destinationAmount,
      swapDestinationVaultSpl.totalLpSupply
    );

    let actualDestinationAmount = swapDestinationVault.getAmountByShare(
      this.onChainTime,
      destinationVaultLp,
      swapDestinationVaultSpl.totalLpSupply
    );

    return actualDestinationAmount;
  }

  /**
   * Deterministically derive the pool PDA
   * @param tokenAMint
   * @param tokenBMint
   * @param curveType
   * @returns
   */
  static computePoolAddress(
    tokenAMint: PublicKey,
    tokenBMint: PublicKey,
    curveType: CurveType
  ) {
    const [poolPda, _] = findProgramAddressSync(
      [
        Buffer.from("pool"),
        fromTokenMintsToCompositeKey(tokenAMint, tokenBMint).toBuffer(),
        Buffer.from([encodeCurveType(curveType)]),
        POOL_BASE_KEY.toBuffer(),
      ],
      new PublicKey(PROGRAM_ID)
    );
    return poolPda;
  }
}
