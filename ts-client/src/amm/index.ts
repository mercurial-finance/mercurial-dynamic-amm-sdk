import { AnchorProvider, Program, BN, BorshCoder, Idl } from '@project-serum/anchor';
import {
  PublicKey,
  Connection,
  Cluster,
  Transaction,
  TransactionInstruction,
  AccountInfo,
  ParsedAccountData,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import VaultImpl, { calculateWithdrawableAmount, VaultState } from '@mercurial-finance/vault-sdk';
import invariant from 'invariant';
import { AccountsInfo, AmmImplementation, DepositQuote, PoolInformation, PoolState, WithdrawQuote } from './types';
import { Amm, IDL as AmmIdl } from './idl';
import { Vault, IDL as VaultIdl } from './vault-idl';
import {
  DEVNET_COIN,
  ERROR,
  CURVE_TYPE_ACCOUNTS,
  PROGRAM_ID,
  SEEDS,
  VAULT_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  UNLOCK_AMOUNT_BUFFER,
} from './constants';
import { StableSwap, SwapCurve, TradeDirection } from './curve';
import { ConstantProductSwap } from './curve/constant-product';
import {
  calculateMaxSwapOutAmount,
  calculateSwapQuote,
  computeActualDepositAmount,
  calculatePoolInfo,
  getMaxAmountWithSlippage,
  getMinAmountWithSlippage,
  getOrCreateATAInstruction,
  unwrapSOLInstruction,
  wrapSOLInstruction,
  getDepegAccounts,
} from './utils';

type AmmProgram = Program<Amm>;
type VaultProgram = Program<Vault>;

type Opt = {
  cluster: Cluster;
};

const getPoolState = async (poolMint: PublicKey, program: AmmProgram) => {
  const poolState = (await program.account.pool.fetchNullable(poolMint)) as PoolState;
  invariant(poolState, `Pool ${poolMint.toBase58()} not found`);

  const account = await program.provider.connection.getTokenSupply(poolState.lpMint);
  invariant(account.value.amount, ERROR.INVALID_ACCOUNT);

  return { ...poolState, lpSupply: new BN(account.value.amount) };
};

const getRemainingAccounts = (poolState: PoolState) => {
  let accounts: Array<{
    pubkey: PublicKey;
    isWritable: boolean;
    isSigner: boolean;
  }> = [];
  if ('stable' in poolState.curveType) {
    if ('marinade' in poolState.curveType['stable'].depeg.depegType) {
      accounts.push({
        pubkey: CURVE_TYPE_ACCOUNTS.marinade,
        isWritable: false,
        isSigner: false,
      });
    }

    if ('lido' in poolState.curveType['stable'].depeg.depegType) {
      accounts.push({
        pubkey: CURVE_TYPE_ACCOUNTS.lido,
        isWritable: false,
        isSigner: false,
      });
    }
  }

  return accounts;
};

const getAccountsBuffer = async ({
  connection,
  vaultA,
  vaultB,
  apyPda,
  poolState,
}: {
  connection: Connection;
  vaultA: VaultState;
  vaultB: VaultState;
  apyPda: PublicKey;
  poolState: PoolState;
}) => {
  return connection.getMultipleAccountsInfo([
    apyPda,
    vaultA.tokenVault,
    vaultB.tokenVault,
    vaultA.lpMint,
    vaultB.lpMint,
    poolState.aVaultLp,
    poolState.bVaultLp,
    poolState.lpMint,
    SYSVAR_CLOCK_PUBKEY,
  ]);
};

// param order need to be the same from `getAccountsBuffer`
const deserializeAccountsBuffer = ([
  apyPdaBuffer,
  vaultAReserveBuffer,
  vaultBReserveBuffer,
  vaultALpMintBuffer,
  vaultBLpMintBuffer,
  poolVaultALpBuffer,
  poolVaultBLpBuffer,
  poolLpMintBuffer,
  clockAccountBuffer,
]: Array<AccountInfo<Buffer> | null>): AccountsInfo => {
  const poolCoder = new BorshCoder(AmmIdl as Idl);

  const apy = poolCoder.accounts.decode('apy', apyPdaBuffer!.data);
  const vaultAReserveInfo = AccountLayout.decode(vaultAReserveBuffer!.data);
  const vaultBReserveInfo = AccountLayout.decode(vaultBReserveBuffer!.data);
  const vaultALpMintInfo = MintLayout.decode(vaultALpMintBuffer!.data);
  const vaultBLpMintInfo = MintLayout.decode(vaultBLpMintBuffer!.data);
  const poolVaultALpInfo = AccountLayout.decode(poolVaultALpBuffer!.data);
  const poolVaultBLpInfo = AccountLayout.decode(poolVaultBLpBuffer!.data);
  const poolLpMintInfo = MintLayout.decode(poolLpMintBuffer!.data);

  return {
    apy,
    vaultAReserve: new BN(u64.fromBuffer(vaultAReserveInfo.amount)),
    vaultBReserve: new BN(u64.fromBuffer(vaultBReserveInfo.amount)),
    vaultALpSupply: new BN(u64.fromBuffer(vaultALpMintInfo.supply)),
    vaultBLpSupply: new BN(u64.fromBuffer(vaultBLpMintInfo.supply)),
    poolVaultALp: new BN(u64.fromBuffer(poolVaultALpInfo.amount)),
    poolVaultBLp: new BN(u64.fromBuffer(poolVaultBLpInfo.amount)),
    poolLpSupply: new BN(u64.fromBuffer(poolLpMintInfo.supply)),
    currentTime: new BN(clockAccountBuffer!.data.readBigInt64LE(32).toString()).toNumber(),
  };
};

export default class AmmImpl implements AmmImplementation {
  private opt: Opt = {
    cluster: 'mainnet-beta',
  };

  private constructor(
    public address: PublicKey,
    private program: AmmProgram,
    private vaultProgram: VaultProgram,
    private apyPda: PublicKey,
    private tokenInfos: Array<TokenInfo>,
    public poolState: PoolState & { lpSupply: BN },
    public poolInfo: PoolInformation,
    public vaultA: VaultImpl,
    public vaultB: VaultImpl,
    private accountsInfo: AccountsInfo,
    private swapCurve: SwapCurve,
    private depegAccounts: Map<String, AccountInfo<Buffer>>,
    opt: Opt,
  ) {
    this.opt = {
      ...this.opt,
      ...opt,
    };
  }

  public static async create(
    connection: Connection,
    pool: PublicKey,
    opt?: {
      cluster?: Cluster;
    },
  ): Promise<AmmImpl> {
    const provider = new AnchorProvider(connection, {} as any, AnchorProvider.defaultOptions());
    const cluster = opt?.cluster ?? 'mainnet-beta';
    const ammProgram = new Program<Amm>(AmmIdl, PROGRAM_ID, provider);
    const vaultProgram = new Program<Vault>(VaultIdl, VAULT_PROGRAM_ID, provider);

    const [apyPda] = await PublicKey.findProgramAddress(
      [Buffer.from(SEEDS.APY), pool.toBuffer()],
      ammProgram.programId,
    );

    const tokenListContainer = await new TokenListProvider().resolve();
    const tokenMap = cluster === 'devnet' ? DEVNET_COIN : tokenListContainer.filterByClusterSlug(cluster).getList();

    const poolState = await getPoolState(pool, ammProgram);

    const tokenInfoA = tokenMap.find((token) => token.address === poolState.tokenAMint.toBase58());
    const tokenInfoB = tokenMap.find((token) => token.address === poolState.tokenBMint.toBase58());
    invariant(tokenInfoA, `TokenInfo ${poolState.tokenAMint.toBase58()} A not found`);
    invariant(tokenInfoB, `TokenInfo ${poolState.tokenBMint.toBase58()} A not found`);

    const [vaultA, vaultB] = await Promise.all([
      VaultImpl.create(provider.connection, tokenInfoA, { cluster }),
      VaultImpl.create(provider.connection, tokenInfoB, { cluster }),
    ]);

    const accountsBuffer = await getAccountsBuffer({
      connection: provider.connection,
      vaultA: vaultA.vaultState,
      vaultB: vaultB.vaultState,
      apyPda,
      poolState,
    });
    const accountsInfo = deserializeAccountsBuffer(accountsBuffer);

    const depegAccounts = await getDepegAccounts(ammProgram.provider.connection);

    let swapCurve;
    if ('stable' in poolState.curveType) {
      const { amp, depeg, tokenMultiplier } = poolState.curveType['stable'];
      swapCurve = new StableSwap(amp.toNumber(), tokenMultiplier, depeg, depegAccounts, accountsInfo.currentTime);
    } else {
      swapCurve = new ConstantProductSwap();
    }

    const poolInfo = calculatePoolInfo(
      accountsInfo.currentTime,
      accountsInfo.poolVaultALp,
      accountsInfo.poolVaultBLp,
      accountsInfo.vaultALpSupply,
      accountsInfo.vaultBLpSupply,
      accountsInfo.poolLpSupply,
      accountsInfo.apy,
      swapCurve,
      vaultA.vaultState,
      vaultB.vaultState,
    );

    return new AmmImpl(
      pool,
      ammProgram,
      vaultProgram,
      apyPda,
      [tokenInfoA, tokenInfoB],
      poolState,
      poolInfo,
      vaultA,
      vaultB,
      accountsInfo,
      swapCurve,
      depegAccounts,
      {
        cluster,
      },
    );
  }

  get tokenA(): TokenInfo {
    return this.tokenInfos[0];
  }

  get tokenB(): TokenInfo {
    return this.tokenInfos[1];
  }

  get decimals(): number {
    return Math.max(this.tokenA.decimals, this.tokenB.decimals);
  }

  get isStablePool(): boolean {
    return 'stable' in this.poolState.curveType;
  }

  /**
   * It updates the state of the pool
   */
  public async updateState() {
    const [poolState] = await Promise.all([
      getPoolState(this.address, this.program),
      this.vaultA.refreshVaultState(),
      this.vaultB.refreshVaultState(),
    ]);

    // update spl info
    const accountsBuffer = await getAccountsBuffer({
      poolState,
      connection: this.program.provider.connection,
      vaultA: this.vaultA.vaultState,
      vaultB: this.vaultB.vaultState,
      apyPda: this.apyPda,
    });
    this.accountsInfo = deserializeAccountsBuffer(accountsBuffer);

    if (this.isStablePool) {
      // update swap curve
      const { amp, depeg, tokenMultiplier } = poolState.curveType['stable'];
      this.swapCurve = new StableSwap(
        amp.toNumber(),
        tokenMultiplier,
        depeg,
        this.depegAccounts,
        this.accountsInfo.currentTime,
      );
    }

    const poolInfo = calculatePoolInfo(
      this.accountsInfo.currentTime,
      this.accountsInfo.poolVaultALp,
      this.accountsInfo.poolVaultBLp,
      this.accountsInfo.vaultALpSupply,
      this.accountsInfo.vaultBLpSupply,
      this.accountsInfo.poolLpSupply,
      this.accountsInfo.apy,
      this.swapCurve,
      this.vaultA.vaultState,
      this.vaultB.vaultState,
    );
    this.poolState = { ...poolState, ...poolInfo };
  }

  /**
   * It returns the pool token mint.
   * @returns The poolState.lpMint
   */
  public getPoolTokenMint() {
    return this.poolState.lpMint;
  }

  /**
   * It gets the total supply of the LP token
   * @returns The total supply of the LP token.
   */
  public async getLpSupply() {
    const account = await this.program.provider.connection.getTokenSupply(this.poolState.lpMint);
    invariant(account.value.amount, ERROR.INVALID_ACCOUNT);

    return new BN(account.value.amount);
  }

  /**
   * Get the user's balance by looking up the account associated with the user's public key
   * @param {PublicKey} owner - PublicKey - The public key of the user you want to get the balance of
   * @returns The amount of tokens the user has.
   */
  public async getUserBalance(owner: PublicKey) {
    const account = await Token.getAssociatedTokenAddress(
      ASSOCIATED_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      this.poolState.lpMint,
      owner,
    );
    if (!account) return new BN(0);

    const parsedAccountInfo = await this.program.provider.connection.getParsedAccountInfo(account);
    if (!parsedAccountInfo.value) return new BN(0);

    const accountInfoData = (parsedAccountInfo.value!.data as ParsedAccountData).parsed;

    return new BN(accountInfoData.info.tokenAmount.amount);
  }

  /**
   * `getSwapQuote` returns the amount of `outToken` that you will receive if you swap
   * `inAmountLamport` of `inToken` into the pool
   * @param {PublicKey} inTokenMint - The mint you want to swap from.
   * @param {BN} inAmountLamport - The amount of lamports you want to swap.
   * @param {number} [slippage] - The maximum amount of slippage you're willing to accept. (Max to 2 decimal place)
   * @returns The amount of the destination token that will be received after the swap.
   */
  public getSwapQuote(inTokenMint: PublicKey, inAmountLamport: BN, slippage: number) {
    const swapQuote = calculateSwapQuote(inTokenMint, inAmountLamport, {
      currentTime: this.accountsInfo.currentTime,
      poolState: this.poolState,
      depegAccounts: this.depegAccounts,
      poolVaultALp: this.accountsInfo.poolVaultALp,
      poolVaultBLp: this.accountsInfo.poolVaultBLp,
      vaultA: this.vaultA.vaultState,
      vaultB: this.vaultB.vaultState,
      vaultALpSupply: this.accountsInfo.vaultALpSupply,
      vaultBLpSupply: this.accountsInfo.vaultBLpSupply,
      vaultAReserve: this.accountsInfo.vaultAReserve,
      vaultBReserve: this.accountsInfo.vaultBReserve,
    });

    return getMinAmountWithSlippage(swapQuote, slippage);
  }

  /**
   * Get maximum in amount (source amount) for swap
   * !!! NOTE it is just estimation
   * @param tokenMint
   */
  public getMaxSwapInAmount(tokenMint: PublicKey) {
    // Get maximum in amount by swapping maximum withdrawable amount of tokenMint in the pool
    invariant(
      tokenMint.equals(this.poolState.tokenAMint) || tokenMint.equals(this.poolState.tokenBMint),
      ERROR.INVALID_MINT,
    );

    const [outTokenMint, swapSourceAmount, swapDestAmount, tradeDirection] = tokenMint.equals(this.poolState.tokenAMint)
      ? [this.poolState.tokenBMint, this.poolInfo.tokenAAmount, this.poolInfo.tokenBAmount, TradeDirection.AToB]
      : [this.poolState.tokenAMint, this.poolInfo.tokenBAmount, this.poolInfo.tokenAAmount, TradeDirection.BToA];
    let maxOutAmount = this.getMaxSwapOutAmount(outTokenMint);
    // Impossible to deplete the pool, therefore if maxOutAmount is equals to tokenAmount in pool, subtract it by 1
    if (maxOutAmount.eq(swapDestAmount)) {
      maxOutAmount = maxOutAmount.sub(new BN(1)); // Left 1 token in pool
    }
    let maxInAmount = this.swapCurve!.computeInAmount(maxOutAmount, swapSourceAmount, swapDestAmount, tradeDirection);
    const adminFee = this.calculateAdminTradingFee(maxInAmount);
    const tradeFee = this.calculateTradingFee(maxInAmount);
    maxInAmount = maxInAmount.sub(adminFee);
    maxInAmount = maxInAmount.sub(tradeFee);
    return maxInAmount;
  }

  /**
   * `getMaxSwapOutAmount` returns the maximum amount of tokens that can be swapped out of the pool
   * @param {PublicKey} tokenMint - The mint of the token you want to swap out.
   * @returns The maximum amount of tokens that can be swapped out of the pool.
   */
  public getMaxSwapOutAmount(tokenMint: PublicKey) {
    return calculateMaxSwapOutAmount(
      tokenMint,
      this.poolState.tokenAMint,
      this.poolState.tokenBMint,
      this.poolInfo.tokenAAmount,
      this.poolInfo.tokenBAmount,
      this.accountsInfo.vaultAReserve,
      this.accountsInfo.vaultBReserve,
    );
  }

  /**
   * `swap` is a function that takes in a `PublicKey` of the owner, a `PublicKey` of the input token
   * mint, an `BN` of the input amount of lamports, and an `BN` of the output amount of lamports. It
   * returns a `Promise<Transaction>` of the swap transaction
   * @param {PublicKey} owner - The public key of the user who is swapping
   * @param {PublicKey} inTokenMint - The mint of the token you're swapping from.
   * @param {BN} inAmountLamport - The amount of the input token you want to swap.
   * @param {BN} outAmountLamport - The minimum amount of the output token you want to receive.
   * @returns A transaction object
   */
  public async swap(owner: PublicKey, inTokenMint: PublicKey, inAmountLamport: BN, outAmountLamport: BN) {
    const [sourceToken, destinationToken] =
      this.tokenA.address === inTokenMint.toBase58()
        ? [this.poolState.tokenAMint, this.poolState.tokenBMint]
        : [this.poolState.tokenBMint, this.poolState.tokenAMint];

    const adminTokenFee =
      this.tokenA.address === inTokenMint.toBase58() ? this.poolState.adminTokenAFee : this.poolState.adminTokenBFee;

    let preInstructions: Array<TransactionInstruction> = [];
    const [[userSourceToken, createUserSourceIx], [userDestinationToken, createUserDestinationIx]] =
      await this.createATAPreInstructions(owner, [sourceToken, destinationToken]);

    createUserSourceIx && preInstructions.push(createUserSourceIx);
    createUserDestinationIx && preInstructions.push(createUserDestinationIx);

    if (sourceToken.equals(WRAPPED_SOL_MINT)) {
      preInstructions = preInstructions.concat(wrapSOLInstruction(owner, userSourceToken, inAmountLamport.toNumber()));
    }

    preInstructions.push(await this.getApySyncInstructions());

    const postInstructions: Array<TransactionInstruction> = [];
    if (WRAPPED_SOL_MINT.equals(destinationToken)) {
      const unwrapSOLIx = await unwrapSOLInstruction(owner);
      unwrapSOLIx && postInstructions.push(unwrapSOLIx);
    }

    const swapTx = await this.program.methods
      .swap(inAmountLamport, outAmountLamport)
      .accounts({
        aTokenVault: this.vaultA.vaultState.tokenVault,
        bTokenVault: this.vaultB.vaultState.tokenVault,
        aVault: this.poolState.aVault,
        bVault: this.poolState.bVault,
        aVaultLp: this.poolState.aVaultLp,
        bVaultLp: this.poolState.bVaultLp,
        aVaultLpMint: this.vaultA.vaultState.lpMint,
        bVaultLpMint: this.vaultB.vaultState.lpMint,
        userSourceToken,
        userDestinationToken,
        user: owner,
        adminTokenFee,
        pool: this.address,
        tokenProgram: TOKEN_PROGRAM_ID,
        vaultProgram: this.vaultProgram.programId,
      })
      .remainingAccounts(getRemainingAccounts(this.poolState))
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return new Transaction({
      feePayer: owner,
      ...(await this.program.provider.connection.getLatestBlockhash('finalized')),
    }).add(swapTx);
  }

  /**
   * `getDepositQuote` is a function that takes in a tokenAInAmount, tokenBInAmount, balance, and
   * slippage, and returns a poolTokenAmountOut, tokenAInAmount, and tokenBInAmount. `tokenAInAmount` or `tokenBAmount`
   * can be zero for balance deposit quote.
   * @param {BN} tokenAInAmount - The amount of token A to be deposit,
   * @param {BN} tokenBInAmount - The amount of token B to be deposit,
   * @param {boolean} [balance] - return false if the deposit is imbalance
   * @param {number} [slippage] - The amount of slippage you're willing to accept. (Max to 2 decimal place)
   * @returns The return value is a tuple of the poolTokenAmountOut, tokenAInAmount, and
   * tokenBInAmount.
   */
  public getDepositQuote(tokenAInAmount: BN, tokenBInAmount: BN, balance: boolean, slippage: number): DepositQuote {
    invariant(
      !(!this.isStablePool && !tokenAInAmount.isZero() && !tokenBInAmount.isZero()),
      'Constant product only supports balanced deposit',
    );
    invariant(
      !(!tokenAInAmount.isZero() && !tokenBInAmount.isZero() && balance),
      'Deposit balance is not possible when both token in amount is non-zero',
    );

    const vaultAWithdrawableAmount = calculateWithdrawableAmount(this.accountsInfo.currentTime, this.vaultA.vaultState);
    const vaultBWithdrawableAmount = calculateWithdrawableAmount(this.accountsInfo.currentTime, this.vaultB.vaultState);

    if (tokenAInAmount.isZero() && balance) {
      const poolTokenAmountOut = this.getShareByAmount(
        tokenBInAmount,
        this.poolInfo.tokenBAmount,
        this.accountsInfo.poolLpSupply,
      );

      // Calculate for stable pool balance deposit but used `addImbalanceLiquidity`
      if (this.isStablePool) {
        return {
          poolTokenAmountOut: getMinAmountWithSlippage(poolTokenAmountOut, slippage),
          tokenAInAmount: tokenBInAmount.mul(this.poolInfo.tokenAAmount).div(this.poolInfo.tokenBAmount),
          tokenBInAmount,
        };
      }

      // Constant product pool balance deposit
      const [actualTokenAInAmount, actualTokenBInAmount] = this.computeActualInAmount(
        poolTokenAmountOut,
        this.accountsInfo.poolLpSupply,
        this.accountsInfo.poolVaultALp,
        this.accountsInfo.poolVaultBLp,
        this.accountsInfo.vaultALpSupply,
        this.accountsInfo.vaultBLpSupply,
        vaultAWithdrawableAmount,
        vaultBWithdrawableAmount,
      );

      return {
        poolTokenAmountOut: getMinAmountWithSlippage(poolTokenAmountOut, UNLOCK_AMOUNT_BUFFER),
        tokenAInAmount: getMaxAmountWithSlippage(actualTokenAInAmount, slippage),
        tokenBInAmount: getMaxAmountWithSlippage(actualTokenBInAmount, slippage),
      };
    }

    if (tokenBInAmount.isZero() && balance) {
      const poolTokenAmountOut = this.getShareByAmount(
        tokenAInAmount,
        this.poolInfo.tokenAAmount,
        this.accountsInfo.poolLpSupply,
      );

      // Calculate for stable pool balance deposit but used `addImbalanceLiquidity`
      if (this.isStablePool) {
        return {
          poolTokenAmountOut: getMinAmountWithSlippage(poolTokenAmountOut, slippage),
          tokenAInAmount,
          tokenBInAmount: tokenAInAmount.mul(this.poolInfo.tokenBAmount).div(this.poolInfo.tokenAAmount),
        };
      }

      // Constant product pool
      const [actualTokenAInAmount, actualTokenBInAmount] = this.computeActualInAmount(
        poolTokenAmountOut,
        this.accountsInfo.poolLpSupply,
        this.accountsInfo.poolVaultALp,
        this.accountsInfo.poolVaultBLp,
        this.accountsInfo.vaultALpSupply,
        this.accountsInfo.vaultBLpSupply,
        vaultAWithdrawableAmount,
        vaultBWithdrawableAmount,
      );

      return {
        poolTokenAmountOut: getMinAmountWithSlippage(poolTokenAmountOut, UNLOCK_AMOUNT_BUFFER),
        tokenAInAmount: getMaxAmountWithSlippage(actualTokenAInAmount, slippage),
        tokenBInAmount: getMaxAmountWithSlippage(actualTokenBInAmount, slippage),
      };
    }

    // Imbalance deposit
    const actualDepositAAmount = computeActualDepositAmount(
      tokenAInAmount,
      this.poolInfo.tokenAAmount,
      this.accountsInfo.poolVaultALp,
      this.accountsInfo.vaultALpSupply,
      vaultAWithdrawableAmount,
    );

    const actualDepositBAmount = computeActualDepositAmount(
      tokenBInAmount,
      this.poolInfo.tokenBAmount,
      this.accountsInfo.poolVaultBLp,
      this.accountsInfo.vaultBLpSupply,
      vaultBWithdrawableAmount,
    );
    const poolTokenAmountOut = this.swapCurve.computeImbalanceDeposit(
      actualDepositAAmount,
      actualDepositBAmount,
      this.poolInfo.tokenAAmount,
      this.poolInfo.tokenBAmount,
      this.accountsInfo.poolLpSupply,
      this.poolState.fees,
    );

    return {
      poolTokenAmountOut: getMinAmountWithSlippage(poolTokenAmountOut, slippage),
      tokenAInAmount,
      tokenBInAmount,
    };
  }

  /**
   * `deposit` creates a transaction that deposits `tokenAInAmount` and `tokenBInAmount` into the pool,
   * and mints `poolTokenAmount` of the pool's liquidity token
   * @param {PublicKey} owner - PublicKey - The public key of the user who is depositing liquidity
   * @param {BN} tokenAInAmount - The amount of token A you want to deposit
   * @param {BN} tokenBInAmount - The amount of token B you want to deposit
   * @param {BN} poolTokenAmount - The amount of pool tokens you want to mint.
   * @returns A transaction object
   */
  public async deposit(
    owner: PublicKey,
    tokenAInAmount: BN,
    tokenBInAmount: BN,
    poolTokenAmount: BN,
  ): Promise<Transaction> {
    const { tokenAMint, tokenBMint, lpMint } = this.poolState;

    const [[userAToken, createTokenAIx], [userBToken, createTokenBIx], [userPoolLp, createLpMintIx]] =
      await this.createATAPreInstructions(owner, [tokenAMint, tokenBMint, lpMint]);

    let preInstructions: Array<TransactionInstruction> = [];
    createTokenAIx && preInstructions.push(createTokenAIx);
    createTokenBIx && preInstructions.push(createTokenBIx);
    createLpMintIx && preInstructions.push(createLpMintIx);

    if (WRAPPED_SOL_MINT.equals(new PublicKey(this.tokenA.address))) {
      preInstructions = preInstructions.concat(wrapSOLInstruction(owner, userAToken, tokenAInAmount.toNumber()));
    }
    if (WRAPPED_SOL_MINT.equals(new PublicKey(this.tokenB.address))) {
      preInstructions = preInstructions.concat(wrapSOLInstruction(owner, userBToken, tokenBInAmount.toNumber()));
    }

    preInstructions.push(await this.getApySyncInstructions());

    const postInstructions: Array<TransactionInstruction> = [];
    if ([this.tokenA.address, this.tokenB.address].includes(WRAPPED_SOL_MINT.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(owner);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }

    const programMethod = this.isStablePool
      ? this.program.methods.addImbalanceLiquidity
      : this.program.methods.addBalanceLiquidity;

    const depositTx = await programMethod(poolTokenAmount, tokenAInAmount, tokenBInAmount)
      .accounts({
        aTokenVault: this.vaultA.vaultState.tokenVault,
        bTokenVault: this.vaultB.vaultState.tokenVault,
        aVault: this.poolState.aVault,
        bVault: this.poolState.bVault,
        pool: this.address,
        user: owner,
        userAToken,
        userBToken,
        aVaultLp: this.poolState.aVaultLp,
        bVaultLp: this.poolState.bVaultLp,
        aVaultLpMint: this.vaultA.vaultState.lpMint,
        bVaultLpMint: this.vaultB.vaultState.lpMint,
        lpMint: this.poolState.lpMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        vaultProgram: this.vaultProgram.programId,
        userPoolLp,
      })
      .remainingAccounts(getRemainingAccounts(this.poolState))
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return new Transaction({
      feePayer: owner,
      ...(await this.program.provider.connection.getLatestBlockhash('finalized')),
    }).add(depositTx);
  }

  /**
   * `getWithdrawQuote` is a function that takes in a withdraw amount and returns the amount of tokens
   * that will be withdrawn from the pool
   * @param {BN} withdrawTokenAmount - The amount of tokens you want to withdraw from the pool.
   * @param {PublicKey} [tokenMint] - The token you want to withdraw. If you want balanced withdraw, leave this blank.
   * @param {number} [slippage] - The amount of slippage you're willing to accept. (Max to 2 decimal place)
   * @returns The return value is a tuple of the poolTokenAmountIn, tokenAOutAmount, and
   * tokenBOutAmount.
   */
  public getWithdrawQuote(withdrawTokenAmount: BN, slippage: number, tokenMint?: PublicKey): WithdrawQuote {
    const vaultAWithdrawableAmount = calculateWithdrawableAmount(this.accountsInfo.currentTime, this.vaultA.vaultState);
    const vaultBWithdrawableAmount = calculateWithdrawableAmount(this.accountsInfo.currentTime, this.vaultB.vaultState);

    // balance withdraw
    if (!tokenMint) {
      const vaultALpBurn = this.getShareByAmount(
        withdrawTokenAmount,
        this.accountsInfo.poolLpSupply,
        this.accountsInfo.poolVaultALp,
      );
      const vaultBLpBurn = this.getShareByAmount(
        withdrawTokenAmount,
        this.accountsInfo.poolLpSupply,
        this.accountsInfo.poolVaultBLp,
      );

      const tokenAOutAmount = this.getAmountByShare(
        vaultALpBurn,
        vaultAWithdrawableAmount,
        this.accountsInfo.vaultALpSupply,
      );
      const tokenBOutAmount = this.getAmountByShare(
        vaultBLpBurn,
        vaultBWithdrawableAmount,
        this.accountsInfo.vaultBLpSupply,
      );

      return {
        poolTokenAmountIn: withdrawTokenAmount,
        tokenAOutAmount: getMinAmountWithSlippage(tokenAOutAmount, slippage),
        tokenBOutAmount: getMinAmountWithSlippage(tokenBOutAmount, slippage),
      };
    }

    // Imbalance withdraw
    const isWithdrawingTokenA = tokenMint.equals(new PublicKey(this.tokenA.address));
    const isWithdrawingTokenB = tokenMint.equals(new PublicKey(this.tokenB.address));
    invariant(isWithdrawingTokenA || isWithdrawingTokenB, ERROR.INVALID_MINT);

    const tradeDirection = tokenMint.equals(this.poolState.tokenAMint) ? TradeDirection.BToA : TradeDirection.AToB;

    const outAmount = this.swapCurve.computeWithdrawOne(
      withdrawTokenAmount,
      this.accountsInfo.poolLpSupply,
      this.poolInfo.tokenAAmount,
      this.poolInfo.tokenBAmount,
      this.poolState.fees,
      tradeDirection,
    );

    const [vaultLpSupply, vaultTotalAmount] =
      tradeDirection == TradeDirection.AToB
        ? [this.accountsInfo.vaultBLpSupply, vaultBWithdrawableAmount]
        : [this.accountsInfo.vaultALpSupply, vaultAWithdrawableAmount];

    const vaultLpToBurn = outAmount.mul(vaultLpSupply).div(vaultTotalAmount);
    // "Actual" out amount (precision loss)
    const realOutAmount = getMinAmountWithSlippage(vaultLpToBurn.mul(vaultTotalAmount).div(vaultLpSupply), slippage);

    return {
      poolTokenAmountIn: withdrawTokenAmount,
      tokenAOutAmount: isWithdrawingTokenA ? realOutAmount : new BN(0),
      tokenBOutAmount: isWithdrawingTokenB ? realOutAmount : new BN(0),
    };
  }

  /**
   * `withdraw` is a function that takes in the owner's public key, the amount of tokens to withdraw,
   * and the amount of tokens to withdraw from each pool, and returns a transaction that withdraws the
   * specified amount of tokens from the pool
   * @param {PublicKey} owner - PublicKey - The public key of the user who is withdrawing liquidity
   * @param {BN} lpTokenAmount - The amount of LP tokens to withdraw.
   * @param {BN} tokenAOutAmount - The amount of token A you want to withdraw.
   * @param {BN} tokenBOutAmount - The amount of token B you want to withdraw,
   * @returns A transaction object
   */
  public async withdraw(owner: PublicKey, lpTokenAmount: BN, tokenAOutAmount: BN, tokenBOutAmount: BN) {
    const preInstructions: Array<TransactionInstruction> = [];
    const [[userAToken, createUserAIx], [userBToken, createUserBIx], [userPoolLp, createLpTokenIx]] = await Promise.all(
      [this.poolState.tokenAMint, this.poolState.tokenBMint, this.poolState.lpMint].map((key) =>
        getOrCreateATAInstruction(key, owner, this.program.provider.connection),
      ),
    );

    createUserAIx && preInstructions.push(createUserAIx);
    createUserBIx && preInstructions.push(createUserBIx);
    createLpTokenIx && preInstructions.push(createLpTokenIx);

    preInstructions.push(await this.getApySyncInstructions());

    const postInstructions: Array<TransactionInstruction> = [];
    if ([this.tokenA.address, this.tokenB.address].includes(WRAPPED_SOL_MINT.toBase58())) {
      const closeWrappedSOLIx = await unwrapSOLInstruction(owner);
      closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
    }

    const programMethod =
      this.isStablePool && (tokenAOutAmount.isZero() || tokenBOutAmount.isZero())
        ? this.program.methods.removeLiquiditySingleSide(lpTokenAmount, new BN(0)).accounts({
            aTokenVault: this.vaultA.vaultState.tokenVault,
            aVault: this.poolState.aVault,
            aVaultLp: this.poolState.aVaultLp,
            aVaultLpMint: this.vaultA.vaultState.lpMint,
            bTokenVault: this.vaultB.vaultState.tokenVault,
            bVault: this.poolState.bVault,
            bVaultLp: this.poolState.bVaultLp,
            bVaultLpMint: this.vaultB.vaultState.lpMint,
            lpMint: this.poolState.lpMint,
            pool: this.address,
            userDestinationToken: tokenBOutAmount.isZero() ? userAToken : userBToken,
            userPoolLp,
            user: owner,
            tokenProgram: TOKEN_PROGRAM_ID,
            vaultProgram: this.vaultProgram.programId,
          })
        : this.program.methods.removeBalanceLiquidity(lpTokenAmount, tokenAOutAmount, tokenBOutAmount).accounts({
            pool: this.address,
            lpMint: this.poolState.lpMint,
            aVault: this.poolState.aVault,
            aTokenVault: this.vaultA.vaultState.tokenVault,
            aVaultLp: this.poolState.aVaultLp,
            aVaultLpMint: this.vaultA.vaultState.lpMint,
            bVault: this.poolState.bVault,
            bTokenVault: this.vaultB.vaultState.tokenVault,
            bVaultLp: this.poolState.bVaultLp,
            bVaultLpMint: this.vaultB.vaultState.lpMint,
            userAToken,
            userBToken,
            user: owner,
            userPoolLp,
            tokenProgram: TOKEN_PROGRAM_ID,
            vaultProgram: this.vaultProgram.programId,
          });

    const withdrawTx = await programMethod
      .remainingAccounts(getRemainingAccounts(this.poolState))
      .preInstructions(preInstructions)
      .postInstructions(postInstructions)
      .transaction();

    return new Transaction({
      feePayer: owner,
      ...(await this.program.provider.connection.getLatestBlockhash('finalized')),
    }).add(withdrawTx);
  }

  private async getApySyncInstructions() {
    return this.program.methods
      .syncApy()
      .accounts({
        aVault: this.poolState.aVault,
        bVault: this.poolState.bVault,
        aVaultLp: this.poolState.aVaultLp,
        bVaultLp: this.poolState.bVaultLp,
        pool: this.address,
        lpMint: this.poolState.lpMint,
        aVaultLpMint: this.vaultA.vaultState.lpMint,
        bVaultLpMint: this.vaultB.vaultState.lpMint,
        apy: this.apyPda,
      })
      .remainingAccounts(getRemainingAccounts(this.poolState))
      .instruction();
  }

  private async createATAPreInstructions(owner: PublicKey, mintList: Array<PublicKey>) {
    return Promise.all(
      mintList.map((mint) => {
        return getOrCreateATAInstruction(mint, owner, this.program.provider.connection);
      }),
    );
  }

  private calculateAdminTradingFee(amount: BN): BN {
    const { ownerTradeFeeDenominator, ownerTradeFeeNumerator } = this.poolState.fees;
    return amount.mul(ownerTradeFeeNumerator).div(ownerTradeFeeDenominator);
  }

  private calculateTradingFee(amount: BN): BN {
    const { tradeFeeDenominator, tradeFeeNumerator } = this.poolState.fees;
    return amount.mul(tradeFeeNumerator).div(tradeFeeDenominator);
  }

  private computeActualInAmount(
    poolTokenAmount: BN,
    poolLpSupply: BN,
    poolVaultALp: BN,
    poolVaultBLp: BN,
    vaultALpSupply: BN,
    vaultBLpSupply: BN,
    vaultAWithdrawableAmount: BN,
    vaultBWithdrawableAmount: BN,
  ): [BN, BN] {
    const aVaultLpMinted = this.getShareByAmount(poolTokenAmount, poolLpSupply, poolVaultALp, true);
    const bVaultLpMinted = this.getShareByAmount(poolTokenAmount, poolLpSupply, poolVaultBLp, true);

    const actualTokenAInAmount = this.getAmountByShare(aVaultLpMinted, vaultAWithdrawableAmount, vaultALpSupply, true);
    const actualTokenBInAmount = this.getAmountByShare(bVaultLpMinted, vaultBWithdrawableAmount, vaultBLpSupply, true);

    return [actualTokenAInAmount, actualTokenBInAmount];
  }

  private getShareByAmount(amount: BN, tokenAmount: BN, lpSupply: BN, roundUp?: boolean): BN {
    return roundUp ? amount.mul(lpSupply).divRound(tokenAmount) : amount.mul(lpSupply).div(tokenAmount);
  }

  private getAmountByShare(amount: BN, tokenAmount: BN, lpSupply: BN, roundUp?: boolean): BN {
    return roundUp ? amount.mul(tokenAmount).divRound(lpSupply) : amount.mul(tokenAmount).div(lpSupply);
  }
}
