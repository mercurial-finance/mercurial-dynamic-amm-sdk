import { Cluster, Connection, Keypair, PublicKey } from '@solana/web3.js';
import AmmImpl from '../index';
import { DEV_POOL_SOL_MSOL, DEV_POOL_USDT_SOL, DEV_POOL_USDT_USDC } from '../constants';
import { AnchorProvider, BN, Wallet } from '@project-serum/anchor';
// import { airDropSol } from "./utils";
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';

let mockWallet = new Wallet(
  process.env.WALLET_PRIVATE_KEY ? Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY)) : new Keypair(),
);

const MAINNET = {
  connection: new Connection('https://api.mainnet-beta.solana.com'),
  cluster: 'mainnet-beta',
};

const DEVNET = {
  connection: new Connection('https://api.devnet.solana.com/', {
    commitment: 'confirmed',
  }),
  cluster: 'devnet',
};

describe('Get Devnet pool state', () => {
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
    // await airDropSol(DEVNET.connection, mockWallet.publicKey, 2);
    cpPool = await AmmImpl.create(DEVNET.connection, new PublicKey(DEV_POOL_USDT_SOL), {
      cluster: DEVNET.cluster as Cluster,
    });
    depegPool = await AmmImpl.create(DEVNET.connection, new PublicKey(DEV_POOL_SOL_MSOL), {
      cluster: DEVNET.cluster as Cluster,
    });
    stablePool = await AmmImpl.create(DEVNET.connection, new PublicKey(DEV_POOL_USDT_USDC), {
      cluster: DEVNET.cluster as Cluster,
    });
  });

  test('Get Pool Token Mint', () => {
    expect(cpPool.getPoolTokenMint()).toBeDefined();
    expect(stablePool.getPoolTokenMint()).toBeDefined();
    expect(depegPool.getPoolTokenMint()).toBeDefined();
  });

  test('Get Pool Balance', async () => {
    currentCpPoolBalance = await cpPool.getUserBalance(mockWallet.publicKey);
    currentDepegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
    currentStablePoolBalance = await stablePool.getUserBalance(mockWallet.publicKey);
  });

  test('Swap SOL → USDT', async () => {
    const inAmountLamport = new BN(0.1 * 10 ** cpPool.tokenB.decimals);

    const quote = await cpPool.getSwapQuote(new PublicKey(cpPool.tokenB.address), inAmountLamport);
    expect(quote.toNumber()).toBeGreaterThan(0);

    const swapTx = await cpPool.swap(
      mockWallet.publicKey,
      new PublicKey(cpPool.tokenB.address),
      inAmountLamport,
      quote,
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
    const inAmountLamport = new BN(1 * 10 ** cpPool.tokenA.decimals);

    const quote = await cpPool.getSwapQuote(new PublicKey(cpPool.tokenA.address), inAmountLamport);
    expect(quote.toNumber()).toBeGreaterThan(0);

    const swapTx = await cpPool.swap(
      mockWallet.publicKey,
      new PublicKey(cpPool.tokenA.address),
      inAmountLamport,
      quote,
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
    const inAmountLamport = new BN(1 * 10 ** stablePool.tokenA.decimals);
    const quote = await stablePool.getSwapQuote(new PublicKey(stablePool.tokenA.address), inAmountLamport);
    expect(Number(quote)).toBeGreaterThan(0);

    const swapTx = await stablePool.swap(
      mockWallet.publicKey,
      new PublicKey(stablePool.tokenA.address),
      inAmountLamport,
      quote,
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
    const quote = await stablePool.getSwapQuote(new PublicKey(stablePool.tokenB.address), inAmountLamport);
    expect(Number(quote)).toBeGreaterThan(0);

    const swapTx = await stablePool.swap(
      mockWallet.publicKey,
      new PublicKey(stablePool.tokenB.address),
      inAmountLamport,
      quote,
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

    const quote = await depegPool.getSwapQuote(new PublicKey(depegPool.tokenA.address), inAmountLamport);
    expect(Number(quote)).toBeGreaterThan(0);

    const swapTx = await depegPool.swap(
      mockWallet.publicKey,
      new PublicKey(depegPool.tokenA.address),
      inAmountLamport,
      quote,
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

    const quote = await depegPool.getSwapQuote(new PublicKey(depegPool.tokenB.address), inAmountLamport);
    expect(Number(quote)).toBeGreaterThan(0);

    const swapTx = await depegPool.swap(
      mockWallet.publicKey,
      new PublicKey(depegPool.tokenB.address),
      inAmountLamport,
      quote,
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

  // Balance deposit in constant product
  test('Deposit SOL in USDT-SOL pool', async () => {
    const inAmountBLamport = new BN(1 * 10 ** cpPool.tokenA.decimals);

    const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } = await cpPool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
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

    const { poolTokenAmountOut, tokenAInAmount, tokenBInAmount } = await cpPool.getDepositQuote(
      inAmountALamport,
      new BN(0),
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

  // // Balance deposit in stable pool
  test('Deposit USDC and USDT in USDT-USDC', async () => {
    const inAmountALamport = new BN(1 * 10 ** stablePool.tokenA.decimals);
    const inAmountBLamport = new BN(1 * 10 ** stablePool.tokenB.decimals);

    const { poolTokenAmountOut } = await stablePool.getDepositQuote(inAmountALamport, inAmountBLamport);

    const depositTx = await stablePool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      inAmountBLamport,
      poolTokenAmountOut,
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

  // Single deposit in stable pool
  test('Deposit USDT in USDT-USDC (balance)', async () => {
    const inAmountALamport = new BN(1 * 10 ** stablePool.tokenA.decimals);

    const { poolTokenAmountOut, tokenBInAmount } = await stablePool.getDepositQuote(inAmountALamport, new BN(0));

    const depositTx = await stablePool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      tokenBInAmount,
      poolTokenAmountOut,
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

  // Balance deposit in depeg pool
  test('Deposit SOL and mSOL in SOL-mSOL', async () => {
    const inAmountALamport = new BN(0.1 * 10 ** depegPool.tokenA.decimals);
    const inAmountBLamport = new BN(0.1 * 10 ** depegPool.tokenB.decimals);

    const { poolTokenAmountOut } = await depegPool.getDepositQuote(inAmountALamport, inAmountBLamport);

    const depositTx = await depegPool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      inAmountBLamport,
      poolTokenAmountOut,
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

    const { poolTokenAmountOut, tokenBInAmount } = await depegPool.getDepositQuote(inAmountALamport, new BN(0), true);

    const depositTx = await depegPool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      tokenBInAmount,
      poolTokenAmountOut,
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

    const { poolTokenAmountOut, tokenBInAmount } = await depegPool.getDepositQuote(inAmountALamport, new BN(0));

    const depositTx = await depegPool.deposit(
      mockWallet.publicKey,
      inAmountALamport,
      tokenBInAmount,
      poolTokenAmountOut,
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
    const outTokenAmountLamport = new BN(2 * 10 ** cpPool.decimals);

    const { tokenAOutAmount, tokenBOutAmount } = await cpPool.getWithdrawQuote(outTokenAmountLamport);

    const withdrawTx = await cpPool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      tokenAOutAmount,
      tokenBOutAmount,
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
    const outTokenAmountLamport = new BN(1 * 10 ** stablePool.decimals);

    const { tokenAOutAmount, tokenBOutAmount } = await stablePool.getWithdrawQuote(
      outTokenAmountLamport,
      new PublicKey(stablePool.tokenA.address),
    );

    const withdrawTx = await stablePool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      tokenAOutAmount,
      tokenBOutAmount,
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
    const outTokenAmountLamport = new BN(1 * 10 ** stablePool.decimals);

    const { tokenAOutAmount, tokenBOutAmount } = await stablePool.getWithdrawQuote(outTokenAmountLamport);

    const withdrawTx = await stablePool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      tokenAOutAmount,
      tokenBOutAmount,
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

    const { tokenAOutAmount, tokenBOutAmount } = await depegPool.getWithdrawQuote(
      outTokenAmountLamport,
      new PublicKey(depegPool.tokenB.address),
    );

    const withdrawTx = await depegPool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      tokenAOutAmount,
      tokenBOutAmount,
    );

    try {
      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Result of SOL withdrawal from SOL-mSOL', withdrawResult);
      expect(typeof withdrawResult).toBe('string');

      const depegPoolBalance = await depegPool.getUserBalance(mockWallet.publicKey);
      expect(depegPoolBalance.toNumber()).toBeLessThan(currentDepegPoolBalance.toNumber());
      currentStablePoolBalance = depegPoolBalance;
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  // single withdraw from depeg pool
  test('Withdraw mSOL from SOL-mSOL', async () => {
    const outTokenAmountLamport = new BN(0.1 * 10 ** depegPool.decimals);

    const { tokenAOutAmount, tokenBOutAmount } = await depegPool.getWithdrawQuote(
      outTokenAmountLamport,
      new PublicKey(depegPool.tokenB.address),
    );

    const withdrawTx = await depegPool.withdraw(
      mockWallet.publicKey,
      outTokenAmountLamport,
      tokenAOutAmount,
      tokenBOutAmount,
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
