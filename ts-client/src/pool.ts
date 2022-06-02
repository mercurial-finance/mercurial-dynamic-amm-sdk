import { AnchorProvider, BN, Program, Wallet } from "@project-serum/anchor";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import invariant from "invariant";
// import Vault from "sdk-ts/src/vault"; // Wait for vault SDK being released
import { ERROR, POOL_BASE_KEY, PROGRAM_ID } from "./constants";
import { StableSwap, SwapCurve } from "./curve";
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
import Vault from "./vault-deps/vault";

export type AmmProgram = Program<Amm>;

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

class Pool {
  private program: AmmProgram;

  private vaultA: Vault;
  private vaultB: Vault;

  private vaultASpl: VaultSpl;
  private vaultBSpl: VaultSpl;

  private poolSpl: PoolSpl;
  private onChainTime: number = 0;

  public state: PoolState | undefined;
  private swapCurve: SwapCurve | undefined;

  constructor(wallet: Wallet, connection: Connection) {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "processed",
    });
    this.program = new Program<Amm>(AmmIDL, PROGRAM_ID, provider);
    this.vaultA = new Vault(wallet, connection);
    this.vaultB = new Vault(wallet, connection);
    this.poolSpl = new PoolSpl();
    this.vaultASpl = new VaultSpl();
    this.vaultBSpl = new VaultSpl();
  }

  /**
   *
   * @param pool
   * Load the pool state
   */
  async load(pool: PublicKey) {
    const poolAccount = (await this.program.account.pool.fetchNullable(
      pool
    )) as PoolState;
    invariant(poolAccount, `Pool ${pool.toBase58()} not found`);

    if ("stable" in poolAccount.curveType) {
      this.swapCurve = new StableSwap(
        poolAccount.curveType.stable.amp.toNumber()
      );
    } else {
      this.swapCurve = new ConstantProductSwap();
    }

    await Promise.all([
      this.vaultA.getVaultStateByMint(poolAccount.tokenAMint),
      this.vaultB.getVaultStateByMint(poolAccount.tokenBMint),
    ]);

    this.state = poolAccount;

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
      this.program.provider.connection.getParsedAccountInfo(
        SYSVAR_CLOCK_PUBKEY
      ),
      this.program.provider.connection.getMultipleAccountsInfo([
        this.vaultA.state!.tokenVault,
        this.vaultB.state!.tokenVault,
        this.vaultA.state!.lpMint,
        this.vaultB.state!.lpMint,
        this.state.aVaultLp,
        this.state.bVaultLp,
        this.state.lpMint,
      ]),
    ]);

    const parsedClockAccount = (parsedClock.value!.data as ParsedAccountData)
      .parsed as ParsedClockState;

    this.vaultASpl.fromAccountsInfo(vaultATokenVault!, vaultALpMint!);
    this.vaultBSpl.fromAccountsInfo(vaultBTokenVault!, vaultBLpMint!);
    this.poolSpl.fromAccountsInfo(aVaultLp!, bVaultLp!, lpMint!);
    this.onChainTime = parsedClockAccount.info.unixTimestamp;
  }

  /**
   * Get the total token A, and B amount in the pool
   * @returns [totalTokenA, totalTokenB]
   */
  getTokensBalance() {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    const totalAAmount = this.vaultA.getAmountByShare(
      this.onChainTime,
      this.poolSpl.vaultALpBalance.toNumber(),
      this.vaultASpl.totalLpSupply.toNumber()
    );
    const totalBAmount = this.vaultB.getAmountByShare(
      this.onChainTime,
      this.poolSpl.vaultBLpBalance.toNumber(),
      this.vaultBSpl.totalLpSupply.toNumber()
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
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    invariant(
      tokenMint.equals(this.state.tokenAMint) ||
      tokenMint.equals(this.state.tokenBMint),
      ERROR.INVALID_MINT
    );
    let [tokenAAmount, tokenBAmount] = this.getTokensBalance();
    const [outTokenMint, swapSourceAmount, swapDestAmount] = tokenMint.equals(this.state.tokenAMint)
      ? [this.state.tokenBMint, this.normalizeTokenA(tokenAAmount), this.normalizeTokenB(tokenBAmount)]
      : [this.state.tokenAMint, this.normalizeTokenB(tokenBAmount), this.normalizeTokenA(tokenAAmount)];

    let maxOutAmount = this.getMaxSwappableOutAmount(outTokenMint);
    maxOutAmount = tokenMint.equals(this.state.tokenAMint)
      ? this.normalizeTokenB(maxOutAmount)
      : this.normalizeTokenA(maxOutAmount);

    let maxInAmount = this.swapCurve!.computeInAmount(maxOutAmount, swapSourceAmount, swapDestAmount);
    const adminFee = this.calculateAdminTradingFee(maxInAmount);
    const tradeFee = this.calculateTradingFee(maxInAmount);
    maxInAmount = maxInAmount.sub(adminFee);
    maxInAmount = maxInAmount.sub(tradeFee);
    maxInAmount = tokenMint.equals(this.state.tokenAMint)
      ? this.denormalizeTokenA(maxInAmount)
      : this.denormalizeTokenB(maxInAmount);
    return maxInAmount;
  }

  /**
   *
   * @param tokenMint
   * Get the maximum available amount to be swap out. This take consideration into the vault reserve
   */
  getMaxSwappableOutAmount(tokenMint: PublicKey) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
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

  private normalizeTokenA(tokenAAmount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    if (this.state.precisionFactor.tokenMultiplier) {
      const { tokenAMultiplier } = this.state.precisionFactor.tokenMultiplier;
      return tokenAAmount.mul(tokenAMultiplier);
    }
    return tokenAAmount;
  }

  private normalizeTokenB(tokenBAmount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    if (this.state.precisionFactor.tokenMultiplier) {
      const { tokenBMultiplier } = this.state.precisionFactor.tokenMultiplier;
      return tokenBAmount.mul(tokenBMultiplier);
    }
    return tokenBAmount;
  }

  private denormalizeTokenA(tokenAAmount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    if (this.state.precisionFactor.tokenMultiplier) {
      const { tokenAMultiplier } = this.state.precisionFactor.tokenMultiplier;
      return tokenAAmount.div(tokenAMultiplier);
    }
    return tokenAAmount;
  }

  private denormalizeTokenB(tokenBAmount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    if (this.state.precisionFactor.tokenMultiplier) {
      const { tokenBMultiplier } = this.state.precisionFactor.tokenMultiplier;
      return tokenBAmount.div(tokenBMultiplier);
    }
    return tokenBAmount;
  }

  private calculateAdminTradingFee(amount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    const { ownerTradeFeeDenominator, ownerTradeFeeNumerator } =
      this.state.fees;
    return amount.mul(ownerTradeFeeNumerator).div(ownerTradeFeeDenominator);
  }

  private calculateTradingFee(amount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    const { tradeFeeDenominator, tradeFeeNumerator } = this.state.fees;
    return amount.mul(tradeFeeNumerator).div(tradeFeeDenominator);
  }

  /**
   * Calculate the virtual price of the LP
   * @returns
   */
  getVirtualPrice() {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
    let [tokenAAmount, tokenBAmount] = this.getTokensBalance();
    tokenAAmount = this.normalizeTokenA(tokenAAmount);
    tokenBAmount = this.normalizeTokenB(tokenBAmount);
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
  getOutAmount(inTokenMint: PublicKey, inAmount: BN) {
    invariant(this.state, ERROR.POOL_NOT_LOAD);
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
    ] = inTokenMint.equals(this.state.tokenAMint)
        ? [
          this.normalizeTokenA(inAmount),
          this.normalizeTokenA(tokenAAmount),
          this.normalizeTokenB(tokenBAmount),
          this.vaultA,
          this.vaultB,
          this.vaultASpl,
          this.vaultBSpl,
        ]
        : [
          this.normalizeTokenB(inAmount),
          this.normalizeTokenB(tokenBAmount),
          this.normalizeTokenA(tokenAAmount),
          this.vaultB,
          this.vaultA,
          this.vaultBSpl,
          this.vaultASpl,
        ];

    const adminFee = this.calculateAdminTradingFee(sourceAmount);
    const tradeFee = this.calculateTradingFee(sourceAmount);

    // Get vault lp minted when deposit to the vault
    const sourceVaultLp = swapSourceVault.getUnmintAmount(
      this.onChainTime,
      sourceAmount.sub(adminFee).toNumber(),
      swapSourceVaultSpl.totalLpSupply.toNumber()
    );

    const actualSourceAmount = new BN(
      swapSourceVault.getAmountByShare(
        this.onChainTime,
        sourceVaultLp,
        swapSourceVaultSpl.totalLpSupply.toNumber()
      )
    );

    let sourceAmountWithFee = actualSourceAmount.sub(tradeFee);

    const destinationAmount = this.swapCurve!.computeOutAmount(
      sourceAmountWithFee,
      swapSourceAmount,
      swapDestinationAmount
    );

    // Get vault lp to burn when withdraw from the vault
    const destinationVaultLp = new BN(
      swapDestinationVault.getUnmintAmount(
        this.onChainTime,
        destinationAmount.toNumber(),
        swapDestinationVaultSpl.totalLpSupply.toNumber()
      )
    );

    let actualDestinationAmount = new BN(
      swapDestinationVault.getAmountByShare(
        this.onChainTime,
        destinationVaultLp.toNumber(),
        swapDestinationVaultSpl.totalLpSupply.toNumber()
      )
    );

    return inTokenMint.equals(this.state.tokenAMint)
      ? this.denormalizeTokenB(actualDestinationAmount)
      : this.denormalizeTokenA(actualDestinationAmount);
  }

  /**
   * Deterministically derive the pool PDA
   * @param tokenAMint
   * @param tokenBMint
   * @param curveType
   * @returns
   */
  static async computePoolAccount(
    tokenAMint: PublicKey,
    tokenBMint: PublicKey,
    curveType: CurveType
  ) {
    const [poolPda, _] = await PublicKey.findProgramAddress(
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

export default Pool;
