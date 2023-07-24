import { Cluster, PublicKey } from '@solana/web3.js';
import AmmImpl from '../index';
import { DEFAULT_SLIPPAGE, MAINNET_POOL, DEVNET_POOL, DEVNET_COIN } from '../constants';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import { calculateSwapQuote, getOnchainTime } from '../utils';
import { DEVNET, MAINNET, airDropSol, mockWallet } from './utils';

describe('Interact with Devnet pool', () => {
  const provider = new AnchorProvider(DEVNET.connection, mockWallet, {
    commitment: 'confirmed',
  });
  let cpPool: AmmImpl;
  let depegPool: AmmImpl;
  let stablePool: AmmImpl;
  let currentCpPoolBalance: BN;
  let currentDepegPoolBalance: BN;
  let currentStablePoolBalance: BN;

  beforeAll(async () => {
    await airDropSol(DEVNET.connection, mockWallet.publicKey);

    const USDT = DEVNET_COIN.find((token) => token.address === '9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9');
    const USDC = DEVNET_COIN.find((token) => token.address === 'zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA');
    const SOL = DEVNET_COIN.find((token) => token.address === 'So11111111111111111111111111111111111111112');
    const MSOL = DEVNET_COIN.find((token) => token.address === 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So');

    const pools = [
      { pool: new PublicKey(DEVNET_POOL.USDT_SOL), tokenInfoA: USDT!, tokenInfoB: SOL! },
      { pool: new PublicKey(DEVNET_POOL.SOL_MSOL), tokenInfoA: SOL!, tokenInfoB: MSOL! },
      { pool: new PublicKey(DEVNET_POOL.USDT_USDC), tokenInfoA: USDT!, tokenInfoB: USDC! },
    ];

    const [pool1, pool2, pool3] = await AmmImpl.createMultiple(DEVNET.connection, pools, {
      cluster: DEVNET.cluster as Cluster,
    });
    cpPool = pool1;
    depegPool = pool2;
    stablePool = pool3;
  });

  test('Get Pool Token Mint', () => {
    expect(cpPool.getPoolTokenMint()).toBeDefined();
    expect(stablePool.getPoolTokenMint()).toBeDefined();
    expect(depegPool.getPoolTokenMint()).toBeDefined();
  });

  test('Get Pool Lp Supply', async () => {
    const cpLpSupply = await cpPool.getLpSupply();
    const stableSupply = await stablePool.getLpSupply();
    const depegSupply = await depegPool.getLpSupply();

    expect(cpLpSupply).toBeDefined();
    expect(stableSupply).toBeDefined();
    expect(depegSupply).toBeDefined();
  });

  test('Get Pool Balance', async () => {
    currentCpPoolBalance = await cpPool.getUserBalance(mockWallet.publicKey);
    currentDepegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
    currentStablePoolBalance = await stablePool.getUserBalance(mockWallet.publicKey);
  });

  test('Swap SOL → USDT', async () => {
    const inAmountLamport = new BN(0.1 * 10 ** cpPool.tokenB.decimals);

    const { swapOutAmount, minSwapOutAmount } = cpPool.getSwapQuote(
      new PublicKey(cpPool.tokenB.address),
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await cpPool.swap(
      mockWallet.publicKey,
      new PublicKey(cpPool.tokenB.address),
      inAmountLamport,
      minSwapOutAmount,
    );

    try {
      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result of SOL → USDT', swapResult);
      expect(typeof swapResult).toBe('string');
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Swap USDT → SOL', async () => {
    const inAmountLamport = new BN(0.1 * 10 ** cpPool.tokenA.decimals);

    const { swapOutAmount, minSwapOutAmount } = cpPool.getSwapQuote(
      new PublicKey(cpPool.tokenA.address),
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await cpPool.swap(
      mockWallet.publicKey,
      new PublicKey(cpPool.tokenA.address),
      inAmountLamport,
      minSwapOutAmount,
    );

    try {
      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result of USDT → SOL', swapResult);
      expect(typeof swapResult).toBe('string');
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('SWAP USDT -> USDC', async () => {
    const inAmountLamport = new BN(0.1 * 10 ** stablePool.tokenA.decimals);
    const { swapOutAmount, minSwapOutAmount } = stablePool.getSwapQuote(
      new PublicKey(stablePool.tokenA.address),
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await stablePool.swap(
      mockWallet.publicKey,
      new PublicKey(stablePool.tokenA.address),
      inAmountLamport,
      minSwapOutAmount,
    );

    try {
      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result USDT → USDC', swapResult);
      expect(typeof swapResult).toBe('string');
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('SWAP USDC -> USDT', async () => {
    const inAmountLamport = new BN(0.1 * 10 ** stablePool.tokenB.decimals);
    const { swapOutAmount, minSwapOutAmount } = stablePool.getSwapQuote(
      new PublicKey(stablePool.tokenB.address),
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await stablePool.swap(
      mockWallet.publicKey,
      new PublicKey(stablePool.tokenB.address),
      inAmountLamport,
      minSwapOutAmount,
    );

    try {
      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result USDC → USDT', swapResult);
      expect(typeof swapResult).toBe('string');
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Swap SOL → mSOL', async () => {
    const inAmountLamport = new BN(0.01 * 10 ** depegPool.tokenA.decimals);

    const { swapOutAmount, minSwapOutAmount } = depegPool.getSwapQuote(
      new PublicKey(depegPool.tokenA.address),
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await depegPool.swap(
      mockWallet.publicKey,
      new PublicKey(depegPool.tokenA.address),
      inAmountLamport,
      minSwapOutAmount,
    );

    try {
      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result of SOL → mSOL', swapResult);
      expect(typeof swapResult).toBe('string');
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Swap mSOL → SOL', async () => {
    const inAmountLamport = new BN(0.01 * 10 ** depegPool.tokenB.decimals);

    const { swapOutAmount, minSwapOutAmount } = depegPool.getSwapQuote(
      new PublicKey(depegPool.tokenB.address),
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await depegPool.swap(
      mockWallet.publicKey,
      new PublicKey(depegPool.tokenB.address),
      inAmountLamport,
      minSwapOutAmount,
    );

    try {
      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result of mSOL → SOL', swapResult);
      expect(typeof swapResult).toBe('string');
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Balance deposit in constant product
  test('Deposit SOL in USDT-SOL pool', async () => {
    const inAmountBLamport = new BN(0.1 * 10 ** cpPool.tokenB.decimals);

    const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } = cpPool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
      true,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await cpPool.deposit(mockWallet.publicKey, tokenAInAmount, tokenBInAmount, poolTokenAmountOut);

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of depositing SOL into USDT-SOL pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const cpPoolBalance = await cpPool.getUserBalance(mockWallet.publicKey);
      expect(cpPoolBalance.toNumber()).toBeGreaterThan(currentCpPoolBalance.toNumber());
      currentCpPoolBalance = cpPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Balance deposit in constant product
  test('Deposit USDT in USDT-SOL pool', async () => {
    const inAmountALamport = new BN(1 * 10 ** cpPool.tokenA.decimals);

    const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } = cpPool.getDepositQuote(
      inAmountALamport,
      new BN(0),
      true,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await cpPool.deposit(mockWallet.publicKey, tokenAInAmount, tokenBInAmount, poolTokenAmountOut);

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of USDT deposit into USDT-SOL pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const cpPoolBalance = await cpPool.getUserBalance(mockWallet.publicKey);
      expect(cpPoolBalance.toNumber()).toBeGreaterThan(currentCpPoolBalance.toNumber());
      currentCpPoolBalance = cpPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Imbalance deposit in stable pool
  test('Deposit USDC and USDT in USDT-USDC', async () => {
    const inAmountALamport = new BN(0.1 * 10 ** stablePool.tokenA.decimals);
    const inAmountBLamport = new BN(0.1 * 10 ** stablePool.tokenB.decimals);

    const { minPoolTokenAmountOut, tokenAInAmount, tokenBInAmount } = stablePool.getDepositQuote(
      inAmountALamport,
      inAmountBLamport,
      false,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await stablePool.deposit(
      mockWallet.publicKey,
      tokenAInAmount,
      tokenBInAmount,
      minPoolTokenAmountOut,
    );

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of deposit USDT and USDC into USDT-USDC pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const stablePoolBalance = await stablePool.getUserBalance(mockWallet.publicKey);
      expect(stablePoolBalance.toNumber()).toBeGreaterThan(currentStablePoolBalance.toNumber());
      currentStablePoolBalance = stablePoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Single balance deposit in stable pool
  test('Deposit USDT in USDT-USDC (balance)', async () => {
    const inAmountALamport = new BN(0.1 * 10 ** stablePool.tokenA.decimals);

    const { minPoolTokenAmountOut, tokenBInAmount } = stablePool.getDepositQuote(
      inAmountALamport,
      new BN(0),
      true,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await stablePool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      tokenBInAmount,
      minPoolTokenAmountOut,
    );

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of deposit USDT into USDT-USDC pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const stablePoolBalance = await stablePool.getUserBalance(mockWallet.publicKey);
      expect(stablePoolBalance.toNumber()).toBeGreaterThan(currentStablePoolBalance.toNumber());
      currentStablePoolBalance = stablePoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Imbalance deposit in depeg pool
  test('Deposit SOL and mSOL in SOL-mSOL', async () => {
    const inAmountALamport = new BN(0.1 * 10 ** depegPool.tokenA.decimals);
    const inAmountBLamport = new BN(0.1 * 10 ** depegPool.tokenB.decimals);

    const { minPoolTokenAmountOut, tokenAInAmount, tokenBInAmount } = depegPool.getDepositQuote(
      inAmountALamport,
      inAmountBLamport,
      false,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await depegPool.deposit(
      mockWallet.publicKey,
      tokenAInAmount,
      tokenBInAmount,
      minPoolTokenAmountOut,
    );

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of deposit SOL and mSOL into SOL-mSOL pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const depegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
      expect(depegPoolBalance.toNumber()).toBeGreaterThan(currentDepegPoolBalance.toNumber());
      currentDepegPoolBalance = depegPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Single imbalance deposit in depeg pool
  test('Deposit SOL in SOL-mSOL (imbalance)', async () => {
    const inAmountALamport = new BN(0.1 * 10 ** depegPool.tokenA.decimals);

    const { minPoolTokenAmountOut, tokenBInAmount } = depegPool.getDepositQuote(
      inAmountALamport,
      new BN(0),
      false,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await depegPool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      tokenBInAmount,
      minPoolTokenAmountOut,
    );

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of deposit SOL into SOL-mSOL pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const depegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
      expect(depegPoolBalance.toNumber()).toBeGreaterThan(currentDepegPoolBalance.toNumber());
      currentDepegPoolBalance = depegPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Single balance deposit in depeg pool
  test('Deposit SOL in SOL-mSOL (balance)', async () => {
    const inAmountALamport = new BN(0.1 * 10 ** depegPool.tokenA.decimals);

    const { minPoolTokenAmountOut, tokenBInAmount } = depegPool.getDepositQuote(
      inAmountALamport,
      new BN(0),
      true,
      DEFAULT_SLIPPAGE,
    );

    const depositTx = await depegPool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      tokenBInAmount,
      minPoolTokenAmountOut,
    );

    try {
      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Result of deposit SOL into SOL-mSOL pool', depositResult);
      expect(typeof depositResult).toBe('string');

      const depegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
      expect(depegPoolBalance.toNumber()).toBeGreaterThan(currentDepegPoolBalance.toNumber());
      currentDepegPoolBalance = depegPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Balance withdraw from constant product
  test('Withdraw from USDT-SOL pool', async () => {
    const outTokenAmountLamport = new BN(0.1 * 10 ** cpPool.decimals);

    const { minTokenAOutAmount, minTokenBOutAmount } = cpPool.getWithdrawQuote(outTokenAmountLamport, DEFAULT_SLIPPAGE);

    const withdrawTx = await cpPool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      minTokenAOutAmount,
      minTokenBOutAmount,
    );

    try {
      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Result of withdrawal from USDT-SOL', withdrawResult);
      expect(typeof withdrawResult).toBe('string');

      const cpPoolBalance = await cpPool.getUserBalance(mockWallet.publicKey);
      expect(cpPoolBalance.toNumber()).toBeLessThan(currentCpPoolBalance.toNumber());
      currentCpPoolBalance = cpPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Single withdraw from stable pool
  test('Withdraw USDT from USDT-USDC', async () => {
    const outTokenAmountLamport = new BN(0.1 * 10 ** stablePool.decimals);

    const { minTokenAOutAmount, minTokenBOutAmount } = stablePool.getWithdrawQuote(
      outTokenAmountLamport,
      DEFAULT_SLIPPAGE,
      new PublicKey(stablePool.tokenA.address),
    );

    const withdrawTx = await stablePool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      minTokenAOutAmount,
      minTokenBOutAmount,
    );

    try {
      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Result of USDT withdrawal from USDT-USDC', withdrawResult);
      expect(typeof withdrawResult).toBe('string');

      const stablePoolBalance = await stablePool.getUserBalance(mockWallet.publicKey);
      expect(stablePoolBalance.toNumber()).toBeLessThan(currentStablePoolBalance.toNumber());
      currentStablePoolBalance = stablePoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Single withdraw from stable pool
  test('Withdraw USDC and USDT from USDT-USDC', async () => {
    const outTokenAmountLamport = new BN(0.1 * 10 ** stablePool.decimals);

    const { minTokenAOutAmount, minTokenBOutAmount } = stablePool.getWithdrawQuote(
      outTokenAmountLamport,
      DEFAULT_SLIPPAGE,
    );

    const withdrawTx = await stablePool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      minTokenAOutAmount,
      minTokenBOutAmount,
    );

    try {
      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Result of USDC withdrawal from USDT-USDC', withdrawResult);
      expect(typeof withdrawResult).toBe('string');

      const stablePoolBalance = await stablePool.getUserBalance(mockWallet.publicKey);
      expect(stablePoolBalance.toNumber()).toBeLessThan(currentStablePoolBalance.toNumber());
      currentStablePoolBalance = stablePoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // Single withdraw from depeg pool
  test('Withdraw SOL from SOL-mSOL', async () => {
    const outTokenAmountLamport = new BN(0.1 * 10 ** depegPool.decimals);

    const { minTokenAOutAmount, minTokenBOutAmount } = depegPool.getWithdrawQuote(
      outTokenAmountLamport,
      DEFAULT_SLIPPAGE,
      new PublicKey(depegPool.tokenB.address),
    );

    const withdrawTx = await depegPool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      minTokenAOutAmount,
      minTokenBOutAmount,
    );

    try {
      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Result of SOL withdrawal from SOL-mSOL', withdrawResult);
      expect(typeof withdrawResult).toBe('string');

      const depegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
      expect(depegPoolBalance.toNumber()).toBeLessThan(currentDepegPoolBalance.toNumber());
      currentDepegPoolBalance = depegPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // single withdraw from depeg pool
  test('Withdraw mSOL from SOL-mSOL', async () => {
    const outTokenAmountLamport = new BN(0.1 * 10 ** depegPool.decimals);

    const { minTokenAOutAmount, minTokenBOutAmount } = depegPool.getWithdrawQuote(
      outTokenAmountLamport,
      DEFAULT_SLIPPAGE,
      new PublicKey(depegPool.tokenB.address),
    );

    const withdrawTx = await depegPool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      minTokenAOutAmount,
      minTokenBOutAmount,
    );

    try {
      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Result of mSOL withdrawal from SOL-mSOL', withdrawResult);
      expect(typeof withdrawResult).toBe('string');

      const depegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
      expect(depegPoolBalance.toNumber()).toBeLessThan(currentDepegPoolBalance.toNumber());
      currentStablePoolBalance = depegPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });
});

describe('Staging pool', () => {
  let splBasedDepegPool: AmmImpl;
  const jitoSolDepegPool = new PublicKey('HcHN59j1xArjLuqfCMJ96yJ2CKatxHMFABEZWvcfPrYZ');

  beforeAll(async () => {
    const tokenMap = await new TokenListProvider().resolve().then((tokens) => {
      return tokens.filterByClusterSlug('mainnet-beta').getList();
    });
    const SOL = tokenMap.find((token) => token.address === 'So11111111111111111111111111111111111111112');
    const jitoSOL: TokenInfo = {
      chainId: SOL!.chainId,
      address: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      symbol: 'JitoSol',
      name: 'Jito Sol',
      decimals: SOL!.decimals,
    };

    splBasedDepegPool = await AmmImpl.create(MAINNET.connection, jitoSolDepegPool, SOL!, jitoSOL);
  });

  test('SOL → JitoSOL swap quote', async () => {
    const solInAmount = new BN('10000');
    const { swapOutAmount } = splBasedDepegPool.getSwapQuote(
      new PublicKey(splBasedDepegPool.tokenA.address),
      solInAmount,
      DEFAULT_SLIPPAGE,
    );

    // SOL → JitoSOL get less
    console.log(`${solInAmount.toString()} SOL → ${swapOutAmount.toString()} JitoSOL`);
    expect(swapOutAmount.toNumber()).toBeLessThan(solInAmount.toNumber());
  });

  test('JitoSOL → SOL swap quote', async () => {
    const jitoSolInAmount = new BN('10000');
    const { swapOutAmount } = splBasedDepegPool.getSwapQuote(
      new PublicKey(splBasedDepegPool.tokenB.address),
      jitoSolInAmount,
      DEFAULT_SLIPPAGE,
    );

    // JitoSOL → SOL get more
    console.log(`${jitoSolInAmount.toString()} JitoSOL → ${swapOutAmount.toString()} SOL`);
    expect(swapOutAmount.toNumber()).toBeGreaterThan(jitoSolInAmount.toNumber());
  });
});

describe('Interact with Mainnet pool', () => {
  let stablePool: AmmImpl;
  let cpPool: AmmImpl;
  let depegPool: AmmImpl;

  beforeAll(async () => {
    const tokenListContainer = await new TokenListProvider().resolve();
    const tokenMap = tokenListContainer.filterByClusterSlug(MAINNET.cluster).getList();

    const USDT = tokenMap.find((token) => token.address === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
    const USDC = tokenMap.find((token) => token.address === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const SOL = tokenMap.find((token) => token.address === 'So11111111111111111111111111111111111111112');
    const STSOL = tokenMap.find((token) => token.address === '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj');

    const pools = [
      { pool: new PublicKey(MAINNET_POOL.USDC_SOL), tokenInfoA: USDC!, tokenInfoB: SOL! },
      { pool: new PublicKey(MAINNET_POOL.SOL_STSOL), tokenInfoA: SOL!, tokenInfoB: STSOL! },
      { pool: new PublicKey(MAINNET_POOL.USDT_USDC), tokenInfoA: USDC!, tokenInfoB: USDT! },
    ];
    const [pool1, pool2, pool3] = await AmmImpl.createMultiple(MAINNET.connection, pools, {
      cluster: MAINNET.cluster as Cluster,
    });
    cpPool = pool1;
    depegPool = pool2;
    stablePool = pool3;
  });

  test('Get Pool Token Mint', () => {
    expect(cpPool.getPoolTokenMint()).toBeDefined();
    expect(depegPool.getPoolTokenMint()).toBeDefined();
    expect(stablePool.getPoolTokenMint()).toBeDefined();
  });

  test('LST Flag', () => {
    expect(cpPool.isLST).toBe(false);
    expect(depegPool.isLST).toBe(true);
    expect(stablePool.isLST).toBe(false);
  });

  test('Cpamm price impact', async () => {
    const inTokenMint = new PublicKey(cpPool.tokenA.address);
    const onePercentAmount = cpPool.poolInfo.tokenAAmount.div(new BN(100));
    const fiftyPercentAmount = cpPool.poolInfo.tokenAAmount.mul(new BN(50)).div(new BN(100));
    const oneHundredPercentAmount = cpPool.poolInfo.tokenAAmount;

    console.log('Pool token A amount', cpPool.poolInfo.tokenAAmount.toString());
    console.log('Pool token B amount', cpPool.poolInfo.tokenBAmount.toString());

    const [poolVaultALp, poolVaultBLp, vaultAReserve, vaultBReserve, onChainTimeStamp] = await Promise.all([
      MAINNET.connection.getTokenAccountBalance(cpPool.poolState.aVaultLp),
      MAINNET.connection.getTokenAccountBalance(cpPool.poolState.bVaultLp),
      MAINNET.connection.getTokenAccountBalance(cpPool.vaultA.vaultState.tokenVault),
      MAINNET.connection.getTokenAccountBalance(cpPool.vaultB.vaultState.tokenVault),
      getOnchainTime(MAINNET.connection),
    ]);

    const swapQuoteParams = {
      currentTime: onChainTimeStamp,
      depegAccounts: new Map(),
      poolState: cpPool.poolState,
      poolVaultALp: new BN(poolVaultALp.value.amount),
      poolVaultBLp: new BN(poolVaultBLp.value.amount),
      vaultA: cpPool.vaultA.vaultState,
      vaultB: cpPool.vaultB.vaultState,
      vaultALpSupply: cpPool.vaultA.lpSupply,
      vaultBLpSupply: cpPool.vaultB.lpSupply,
      vaultAReserve: new BN(vaultAReserve.value.amount),
      vaultBReserve: new BN(vaultBReserve.value.amount),
    };

    const { priceImpact: priceImpact1 } = calculateSwapQuote(inTokenMint, onePercentAmount, swapQuoteParams);
    const { priceImpact: priceImpact2 } = calculateSwapQuote(inTokenMint, fiftyPercentAmount, swapQuoteParams);
    const { priceImpact: priceImpact3 } = calculateSwapQuote(inTokenMint, oneHundredPercentAmount, swapQuoteParams);

    console.log(`Price impact with in amount ${onePercentAmount.toString()}`, priceImpact1);
    console.log(`Price impact with in amount ${fiftyPercentAmount.toString()}`, priceImpact2);
    console.log(`Price impact with in amount ${oneHundredPercentAmount.toString()}`, priceImpact3);

    expect(priceImpact3.toNumber()).toBeGreaterThan(priceImpact2.toNumber());
    expect(priceImpact2.toNumber()).toBeGreaterThan(priceImpact1.toNumber());
  });

  test('Ssamm price impact', async () => {
    const inTokenMint = new PublicKey(stablePool.tokenA.address);
    const onePercentAmount = stablePool.poolInfo.tokenAAmount.div(new BN(100));
    const fivePercentAmount = stablePool.poolInfo.tokenAAmount.mul(new BN(5)).div(new BN(100));

    console.log('Pool token A amount', stablePool.poolInfo.tokenAAmount.toString());
    console.log('Pool token B amount', stablePool.poolInfo.tokenBAmount.toString());

    const [poolVaultALp, poolVaultBLp, vaultAReserve, vaultBReserve, onChainTimeStamp] = await Promise.all([
      MAINNET.connection.getTokenAccountBalance(stablePool.poolState.aVaultLp),
      MAINNET.connection.getTokenAccountBalance(stablePool.poolState.bVaultLp),
      MAINNET.connection.getTokenAccountBalance(stablePool.vaultA.vaultState.tokenVault),
      MAINNET.connection.getTokenAccountBalance(stablePool.vaultB.vaultState.tokenVault),
      getOnchainTime(MAINNET.connection),
    ]);

    const swapQuoteParams = {
      currentTime: onChainTimeStamp,
      depegAccounts: new Map(),
      poolState: stablePool.poolState,
      poolVaultALp: new BN(poolVaultALp.value.amount),
      poolVaultBLp: new BN(poolVaultBLp.value.amount),
      vaultA: stablePool.vaultA.vaultState,
      vaultB: stablePool.vaultB.vaultState,
      vaultALpSupply: stablePool.vaultA.lpSupply,
      vaultBLpSupply: stablePool.vaultB.lpSupply,
      vaultAReserve: new BN(vaultAReserve.value.amount),
      vaultBReserve: new BN(vaultBReserve.value.amount),
    };

    const { priceImpact: priceImpact1 } = calculateSwapQuote(inTokenMint, onePercentAmount, swapQuoteParams);
    const { priceImpact: priceImpact2 } = calculateSwapQuote(inTokenMint, fivePercentAmount, swapQuoteParams);

    console.log(`Price impact with in amount ${onePercentAmount.toString()}`, priceImpact1);
    console.log(`Price impact with in amount ${fivePercentAmount.toString()}`, priceImpact2);

    expect(priceImpact2.toNumber()).toBeGreaterThan(priceImpact1.toNumber());
  });
});
