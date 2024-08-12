import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { TokenInfo } from '@solana/spl-token-registry';
import { Connection, PublicKey } from '@solana/web3.js';
import { DEFAULT_SLIPPAGE, MAINNET_POOL, STABLE_SWAP_DEFAULT_TRADE_FEE_BPS } from '../constants';
import AmmImpl from '../index';
import { derivePoolAddress } from '../utils';
import { airDropSol, getOrCreateATA, mockWallet } from './utils';
import { createMint, mintTo } from '@solana/spl-token';

export const solTokenInfo: TokenInfo = {
  chainId: 101,
  address: 'So11111111111111111111111111111111111111112',
  name: 'SOL',
  symbol: 'SOL',
  decimals: 9,
};

export const msolTokenInfo: TokenInfo = {
  chainId: 101,
  address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
  name: 'mSOL',
  symbol: 'mSOL',
  decimals: 9,
};

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
const provider = new AnchorProvider(connection, mockWallet, {
  commitment: connection.commitment,
});

describe('Stable Swap pool', () => {
  let usdtTokenInfo: TokenInfo;
  let usdcTokenInfo: TokenInfo;

  let USDT: PublicKey;
  let USDC: PublicKey;

  let mockWalletUsdtATA: PublicKey;
  let mockWalletUsdcATA: PublicKey;

  let usdtDecimal = 6;
  let usdcDecimal = 6;

  const usdtMultiplier = 10 ** usdtDecimal;
  const usdcMultiplier = 10 ** usdcDecimal;

  let stableSwapFeeTiered: AmmImpl;

  beforeAll(async () => {
    await airDropSol(connection, mockWallet.publicKey, 10);

    USDT = await createMint(provider.connection, mockWallet.payer, mockWallet.publicKey, null, usdtDecimal);

    usdtTokenInfo = {
      chainId: 101,
      address: USDT.toString(),
      symbol: 'USDT',
      decimals: usdtDecimal,
      name: 'Tether USD',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    };

    USDC = await createMint(provider.connection, mockWallet.payer, mockWallet.publicKey, null, usdcDecimal);
    usdcTokenInfo = {
      chainId: 101,
      address: USDC.toString(),
      symbol: 'USDC',
      decimals: usdcDecimal,
      name: 'USD Coin',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    };

    mockWalletUsdtATA = await getOrCreateATA(connection, USDT, mockWallet.publicKey, mockWallet.payer);
    mockWalletUsdcATA = await getOrCreateATA(connection, USDC, mockWallet.publicKey, mockWallet.payer);

    await mintTo(
      provider.connection,
      mockWallet.payer,
      USDT,
      mockWalletUsdtATA,
      mockWallet.payer.publicKey,
      1000000 * usdtMultiplier,
      [],
      {
        commitment: 'confirmed',
      },
    );

    await mintTo(
      provider.connection,
      mockWallet.payer,
      USDC,
      mockWalletUsdcATA,
      mockWallet.payer.publicKey,
      1000000 * usdcMultiplier,
      [],
      {
        commitment: 'confirmed',
      },
    );
  });

  describe('With fee tier', () => {
    test('Create stable swap pool', async () => {
      const usdtDepositAmount = new BN(10000 * usdtMultiplier);
      const usdcDepositAmount = new BN(10000 * usdcMultiplier);

      const tradeFeeBps = new BN(STABLE_SWAP_DEFAULT_TRADE_FEE_BPS);
      const transaction = await AmmImpl.createPermissionlessPool(
        connection,
        mockWallet.publicKey,
        usdtTokenInfo,
        usdcTokenInfo,
        usdtDepositAmount,
        usdcDepositAmount,
        true,
        tradeFeeBps,
      );

      transaction.sign(mockWallet.payer);
      const txHash = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(txHash, 'finalized');

      const poolKey = derivePoolAddress(connection, usdtTokenInfo, usdcTokenInfo, true, tradeFeeBps);
      stableSwapFeeTiered = await AmmImpl.create(connection, poolKey);

      expect(poolKey.toBase58()).toBe(stableSwapFeeTiered.address.toBase58());
      expect(stableSwapFeeTiered.isStablePool).toBe(true);
      expect(stableSwapFeeTiered.tokenAMint.address.toString()).toBe(USDT.toString());
      expect(stableSwapFeeTiered.tokenBMint.address.toString()).toBe(USDC.toString());
    });

    test('Get pool mint and supply', async () => {
      const lpMint = stableSwapFeeTiered.getPoolTokenMint();
      expect(lpMint).toBeDefined();

      const lpSupply = await stableSwapFeeTiered.getLpSupply();
      expect(lpSupply).toBeDefined();
    });

    test('Get user balance', async () => {
      const poolBalance = await stableSwapFeeTiered.getUserBalance(mockWallet.publicKey);
      expect(poolBalance).toBeDefined();
    });

    test('Balanced deposit', async () => {
      await stableSwapFeeTiered.updateState();

      const usdtDepositAmount = new BN(100 * usdtMultiplier);

      const depositQuote = await stableSwapFeeTiered.getDepositQuote(usdtDepositAmount, new BN(0), true, 0);

      const depositTx = await stableSwapFeeTiered.deposit(
        mockWallet.publicKey,
        depositQuote.tokenAInAmount,
        depositQuote.tokenBInAmount,
        depositQuote.poolTokenAmountOut,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const depositResult = await provider.sendAndConfirm(depositTx);
        console.log('Deposit', depositResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const afterTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        expect(afterTokenABalance.lt(beforeTokenABalance)).toBe(true);
        expect(afterTokenBBalance.lt(beforeTokenBBalance)).toBe(true);
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });

    test('Imbalance deposit', async () => {
      await stableSwapFeeTiered.updateState();

      const usdtDepositAmount = new BN(100 * usdtMultiplier);
      const usdcDepositAmount = new BN(500 * usdcMultiplier);

      const depositQuote = await stableSwapFeeTiered.getDepositQuote(usdtDepositAmount, usdcDepositAmount, false, 0);

      const depositTx = await stableSwapFeeTiered.deposit(
        mockWallet.publicKey,
        depositQuote.tokenAInAmount,
        depositQuote.tokenBInAmount,
        depositQuote.poolTokenAmountOut,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const depositResult = await provider.sendAndConfirm(depositTx);
        console.log('Deposit', depositResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const afterTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        expect(afterTokenABalance.lt(beforeTokenABalance)).toBe(true);
        expect(afterTokenBBalance.lt(beforeTokenBBalance)).toBe(true);
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });

    test('Imbalance deposit single side', async () => {
      await stableSwapFeeTiered.updateState();

      const usdtDepositAmount = new BN(100 * usdtMultiplier);

      const depositQuote = await stableSwapFeeTiered.getDepositQuote(usdtDepositAmount, new BN(0), false, 0);

      const depositTx = await stableSwapFeeTiered.deposit(
        mockWallet.publicKey,
        depositQuote.tokenAInAmount,
        depositQuote.tokenBInAmount,
        depositQuote.poolTokenAmountOut,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const depositResult = await provider.sendAndConfirm(depositTx);
        console.log('Deposit', depositResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const afterTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        expect(afterTokenABalance.lt(beforeTokenABalance)).toBe(true);
        expect(afterTokenBBalance.eq(beforeTokenBBalance)).toBe(true);
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });

    test('Withdraw', async () => {
      await stableSwapFeeTiered.updateState();
      const lpTokenBalance = await stableSwapFeeTiered.getUserBalance(mockWallet.publicKey);
      const lpTokenToWithdraw = lpTokenBalance.div(new BN(2));

      const withdrawQuote = await stableSwapFeeTiered.getWithdrawQuote(lpTokenToWithdraw, 0);

      const withdrawTx = await stableSwapFeeTiered.withdraw(
        mockWallet.publicKey,
        withdrawQuote.poolTokenAmountIn,
        withdrawQuote.tokenAOutAmount,
        withdrawQuote.tokenBOutAmount,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const withdrawResult = await provider.sendAndConfirm(withdrawTx);
        console.log('Withdraw', withdrawResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));
        const afterTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const tokenAWithdrawn = afterTokenABalance.sub(beforeTokenABalance);
        const tokenBWithdrawn = afterTokenBBalance.sub(beforeTokenBBalance);
        expect(tokenAWithdrawn.eq(withdrawQuote.tokenAOutAmount)).toBe(true);
        expect(tokenBWithdrawn.eq(withdrawQuote.tokenBOutAmount)).toBe(true);
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });

    test('Swap A → B', async () => {
      await stableSwapFeeTiered.updateState();
      const inAmountLamport = new BN(0.1 * 10 ** stableSwapFeeTiered.tokenAMint.decimals);
      const inTokenMint = new PublicKey(stableSwapFeeTiered.tokenAMint.address);

      const { swapOutAmount, minSwapOutAmount } = stableSwapFeeTiered.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const swapTx = await stableSwapFeeTiered.swap(
        mockWallet.publicKey,
        inTokenMint,
        inAmountLamport,
        minSwapOutAmount,
      );

      try {
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const swapResult = await provider.sendAndConfirm(swapTx);
        console.log('Swap Result of A → B', swapResult);

        const afterTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const tokenBReceived = afterTokenBBalance.sub(beforeTokenBBalance);
        expect(tokenBReceived.toString()).toBe(swapOutAmount.toString());
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });

    test('Swap B → A', async () => {
      await stableSwapFeeTiered.updateState();
      const inAmountLamport = new BN(0.1 * 10 ** stableSwapFeeTiered.tokenBMint.decimals);
      const inTokenMint = new PublicKey(stableSwapFeeTiered.tokenBMint.address);

      const { swapOutAmount, minSwapOutAmount } = stableSwapFeeTiered.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const swapTx = await stableSwapFeeTiered.swap(
        mockWallet.publicKey,
        inTokenMint,
        inAmountLamport,
        minSwapOutAmount,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));

        const swapResult = await provider.sendAndConfirm(swapTx);
        console.log('Swap Result of B → A', swapResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdtATA)
          .then((v) => new BN(v.value.amount));

        const tokenAReceived = afterTokenABalance.sub(beforeTokenABalance);
        expect(tokenAReceived.toString()).toBe(swapOutAmount.toString());
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });
  });
});

describe('LST pool', () => {
  let mockWalletMsolATA: PublicKey;

  let lstPool: AmmImpl;

  beforeAll(async () => {
    await airDropSol(connection, mockWallet.publicKey, 10);

    mockWalletMsolATA = await getOrCreateATA(
      connection,
      new PublicKey(msolTokenInfo.address),
      mockWallet.publicKey,
      mockWallet.payer,
    );

    lstPool = await AmmImpl.create(connection, MAINNET_POOL.SOL_MSOL);
  });

  test('Is LST', () => {
    expect(lstPool.isLST).toBe(true);
  });

  test('Swap SOL -> mSOL', async () => {
    await lstPool.updateState();
    const inAmountLamport = new BN(5 * 10 ** solTokenInfo.decimals);
    const inTokenMint = new PublicKey(solTokenInfo.address);

    const { swapOutAmount, minSwapOutAmount } = await lstPool.getSwapQuote(
      inTokenMint,
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await lstPool.swap(mockWallet.publicKey, inTokenMint, inAmountLamport, minSwapOutAmount);
    swapTx.sign(mockWallet.payer);

    try {
      const beforeMsolBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result of SOL → mSOL', swapResult);

      const afterMsolBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const mSolReceived = afterMsolBalance.sub(beforeMsolBalance);
      expect(mSolReceived.gte(minSwapOutAmount)).toBe(true);
      // This is true when the profit drip is not too fast
      // expect(mSolReceived.toString()).toBe(swapOutAmount.toString());
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Swap mSOL -> SOL', async () => {
    await lstPool.updateState();
    const inAmountLamport = new BN(1 * 10 ** msolTokenInfo.decimals);
    const inTokenMint = new PublicKey(msolTokenInfo.address);

    const { swapOutAmount, minSwapOutAmount } = await lstPool.getSwapQuote(
      inTokenMint,
      inAmountLamport,
      DEFAULT_SLIPPAGE,
    );
    expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

    const swapTx = await lstPool.swap(mockWallet.publicKey, inTokenMint, inAmountLamport, minSwapOutAmount);
    swapTx.sign(mockWallet.payer);

    try {
      const beforeSolBalance = await provider.connection.getBalance(mockWallet.publicKey);

      const swapResult = await provider.sendAndConfirm(swapTx);
      console.log('Swap Result of mSOL → SOL', swapResult);

      await getOrCreateATA(connection, new PublicKey(solTokenInfo.address), mockWallet.publicKey, mockWallet.payer);

      const afterSolBalance = await provider.connection.getBalance(mockWallet.publicKey);

      const solReceived = afterSolBalance - beforeSolBalance + 10000.0; // 0.000005 * 2 * 10 ** 9, tx fee for swap + create ATA
      expect(solReceived).toBeGreaterThanOrEqual(minSwapOutAmount.toNumber());
      // This is true when the profit drip is not too fast
      // expect(solReceived).toBe(swapOutAmount.toNumber());
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Get pool mint and supply', async () => {
    const lpMint = lstPool.getPoolTokenMint();
    expect(lpMint).toBeDefined();

    const lpSupply = await lstPool.getLpSupply();
    expect(lpSupply).toBeDefined();
  });

  test('Balanced deposit', async () => {
    await lstPool.updateState();

    const inAmountLamport = new BN(0.1 * 10 ** solTokenInfo.decimals);
    const depositQuote = await lstPool.getDepositQuote(inAmountLamport, new BN(0), true, DEFAULT_SLIPPAGE);

    const depositTx = await lstPool.deposit(
      mockWallet.publicKey,
      depositQuote.tokenAInAmount,
      depositQuote.tokenBInAmount,
      depositQuote.poolTokenAmountOut,
    );

    try {
      const beforeSolBalance = await provider.connection.getBalance(mockWallet.publicKey);
      const beforeTokenABalance = new BN(beforeSolBalance);

      const beforeTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Deposit', depositResult);

      const afterTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));
      const afterTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      expect(afterTokenABalance.lt(beforeTokenABalance)).toBe(true);
      expect(afterTokenBBalance.lt(beforeTokenBBalance)).toBe(true);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Imbalance deposit', async () => {
    await lstPool.updateState();

    const solDepositAmount = new BN(0.1 * 10 ** solTokenInfo.decimals);
    const msolDepositAmount = new BN(0.1 * 10 ** msolTokenInfo.decimals);

    const depositQuote = await lstPool.getDepositQuote(solDepositAmount, msolDepositAmount, false, DEFAULT_SLIPPAGE);

    const depositTx = await lstPool.deposit(
      mockWallet.publicKey,
      depositQuote.tokenAInAmount,
      depositQuote.tokenBInAmount,
      depositQuote.poolTokenAmountOut,
    );

    try {
      const beforeTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));
      const beforeTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Deposit', depositResult);

      const afterTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));
      const afterTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      expect(afterTokenABalance.lt(beforeTokenABalance)).toBe(true);
      expect(afterTokenBBalance.lt(beforeTokenBBalance)).toBe(true);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Imbalance deposit single side', async () => {
    await lstPool.updateState();

    const solDepositAmount = new BN(0.1 * 10 ** solTokenInfo.decimals);
    const depositQuote = await lstPool.getDepositQuote(solDepositAmount, new BN(0), false, DEFAULT_SLIPPAGE);

    const depositTx = await lstPool.deposit(
      mockWallet.publicKey,
      depositQuote.tokenAInAmount,
      depositQuote.tokenBInAmount,
      depositQuote.poolTokenAmountOut,
    );

    try {
      const beforeTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));

      const beforeTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const depositResult = await provider.sendAndConfirm(depositTx);
      console.log('Deposit', depositResult);

      const afterTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));
      const afterTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      expect(afterTokenABalance.lt(beforeTokenABalance)).toBe(true);
      expect(afterTokenBBalance.eq(beforeTokenBBalance)).toBe(true);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });

  test('Get user balance', async () => {
    await lstPool.updateState();
    const poolBalance = await lstPool.getUserBalance(mockWallet.publicKey);
    expect(poolBalance).toBeDefined();
  });

  test('Withdraw', async () => {
    await lstPool.updateState();
    const lpTokenBalance = await lstPool.getUserBalance(mockWallet.publicKey);
    const lpTokenToWithdraw = lpTokenBalance.div(new BN(2));

    const withdrawQuote = await lstPool.getWithdrawQuote(lpTokenToWithdraw, DEFAULT_SLIPPAGE);

    const withdrawTx = await lstPool.withdraw(
      mockWallet.publicKey,
      withdrawQuote.poolTokenAmountIn,
      withdrawQuote.tokenAOutAmount,
      withdrawQuote.tokenBOutAmount,
    );

    try {
      const beforeTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));
      const beforeTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const withdrawResult = await provider.sendAndConfirm(withdrawTx);
      console.log('Withdraw', withdrawResult);

      const afterTokenABalance = new BN(await provider.connection.getBalance(mockWallet.publicKey));
      const afterTokenBBalance = await provider.connection
        .getTokenAccountBalance(mockWalletMsolATA)
        .then((v) => new BN(v.value.amount));

      const tokenAWithdrawn = afterTokenABalance.sub(beforeTokenABalance);
      const tokenBWithdrawn = afterTokenBBalance.sub(beforeTokenBBalance);

      expect(tokenAWithdrawn.gte(withdrawQuote.minTokenAOutAmount)).toBe(true);
      expect(tokenBWithdrawn.gte(withdrawQuote.minTokenBOutAmount)).toBe(true);
    } catch (error: any) {
      console.trace(error);
      throw new Error(error.message);
    }
  });
});
