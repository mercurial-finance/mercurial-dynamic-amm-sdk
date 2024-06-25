import { AnchorProvider, BN } from '@project-serum/anchor';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { Cluster, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  CONSTANT_PRODUCT_DEFAULT_TRADE_FEE_BPS,
  DEFAULT_SLIPPAGE,
  DEVNET_COIN,
  DEVNET_POOL,
  MAINNET_POOL,
  PROGRAM_ID,
  STAGING_PROGRAM_ID,
} from '../constants';
import AmmImpl from '../index';
import { calculateSwapQuote, derivePoolAddress, derivePoolAddressWithConfig, getOnchainTime } from '../utils';
import { airDropSol, airDropSolIfBalanceNotEnough, getOrCreateATA, mockWallet } from './utils';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';

describe('Constant product pool', () => {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
  const provider = new AnchorProvider(connection, mockWallet, {
    commitment: connection.commitment,
  });

  let btcToken: Token;
  let usdcToken: Token;

  let btcTokenInfo: TokenInfo;
  let usdcTokenInfo: TokenInfo;

  let BTC: PublicKey;
  let USDC: PublicKey;

  let mockWalletBtcATA: PublicKey;
  let mockWalletUsdcATA: PublicKey;

  let btcDecimal = 8;
  let usdcDecimal = 6;

  const btcMultiplier = 10 ** btcDecimal;
  const usdcMultiplier = 10 ** usdcDecimal;

  let cpPoolFeeTiered: AmmImpl;
  let cpPoolConfig: AmmImpl;

  beforeAll(async () => {
    await airDropSol(connection, mockWallet.publicKey, 10);

    btcToken = await Token.createMint(
      provider.connection,
      mockWallet.payer,
      mockWallet.publicKey,
      null,
      btcDecimal,
      TOKEN_PROGRAM_ID,
    );

    BTC = btcToken.publicKey;
    btcTokenInfo = {
      chainId: 101,
      address: btcToken.publicKey.toString(),
      symbol: 'BTC',
      decimals: btcDecimal,
      name: 'Bitcoin',
      logoURI: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    };

    usdcToken = await Token.createMint(
      provider.connection,
      mockWallet.payer,
      mockWallet.publicKey,
      null,
      usdcDecimal,
      TOKEN_PROGRAM_ID,
    );

    USDC = usdcToken.publicKey;
    usdcTokenInfo = {
      chainId: 101,
      address: usdcToken.publicKey.toString(),
      symbol: 'USDC',
      decimals: usdcDecimal,
      name: 'USD Coin',
      logoURI: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    };

    mockWalletBtcATA = await getOrCreateATA(connection, BTC, mockWallet.publicKey, mockWallet.payer);
    mockWalletUsdcATA = await getOrCreateATA(connection, USDC, mockWallet.publicKey, mockWallet.payer);

    await btcToken.mintTo(mockWalletBtcATA, mockWallet.payer, [], 10000 * btcMultiplier);
    await usdcToken.mintTo(mockWalletUsdcATA, mockWallet.payer, [], 1000000 * usdcMultiplier);
  });

  describe('With fee tier', () => {
    test('Create constant product pool', async () => {
      const btcDepositAmount = new BN(1 * btcMultiplier);
      const usdcDepositAmount = new BN(70000 * usdcMultiplier);

      const tradeFeeBps = new BN(CONSTANT_PRODUCT_DEFAULT_TRADE_FEE_BPS);
      const transaction = await AmmImpl.createPermissionlessPool(
        connection,
        mockWallet.publicKey,
        btcTokenInfo,
        usdcTokenInfo,
        btcDepositAmount,
        usdcDepositAmount,
        false,
        tradeFeeBps,
      );

      transaction.sign(mockWallet.payer);
      const txHash = await connection.sendRawTransaction(transaction.serialize());
      await connection.confirmTransaction(txHash, 'finalized');

      const poolKey = derivePoolAddress(connection, btcTokenInfo, usdcTokenInfo, false, tradeFeeBps);
      cpPoolFeeTiered = await AmmImpl.create(connection, poolKey, btcTokenInfo, usdcTokenInfo);

      expect(poolKey.toBase58()).toBe(cpPoolFeeTiered.address.toBase58());
      expect(cpPoolFeeTiered.isStablePool).toBe(false);
      expect(cpPoolFeeTiered.tokenA.address.toString()).toBe(BTC.toString());
      expect(cpPoolFeeTiered.tokenB.address.toString()).toBe(USDC.toString());
    });

    test('Get pool mint and supply', async () => {
      const lpMint = cpPoolFeeTiered.getPoolTokenMint();
      expect(lpMint).toBeDefined();

      const lpSupply = await cpPoolFeeTiered.getLpSupply();
      expect(lpSupply).toBeDefined();
    });

    test('Get user balance', async () => {
      const poolBalance = await cpPoolFeeTiered.getUserBalance(mockWallet.publicKey);
      expect(poolBalance).toBeDefined();
    });

    test('Deposit', async () => {
      await cpPoolFeeTiered.updateState();

      const btcDepositAmount = new BN(1 * btcMultiplier);

      const depositQuote = await cpPoolFeeTiered.getDepositQuote(btcDepositAmount, new BN(0), true, 0);

      const depositTx = await cpPoolFeeTiered.deposit(
        mockWallet.publicKey,
        depositQuote.tokenAInAmount,
        depositQuote.tokenBInAmount,
        depositQuote.poolTokenAmountOut,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const depositResult = await provider.sendAndConfirm(depositTx);
        console.log('Deposit', depositResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
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

    test('Withdraw', async () => {
      await cpPoolFeeTiered.updateState();
      const lpTokenBalance = await cpPoolFeeTiered.getUserBalance(mockWallet.publicKey);
      const lpTokenToWithdraw = lpTokenBalance.div(new BN(2));

      const withdrawQuote = await cpPoolFeeTiered.getWithdrawQuote(lpTokenToWithdraw, 0);

      const withdrawTx = await cpPoolFeeTiered.withdraw(
        mockWallet.publicKey,
        withdrawQuote.poolTokenAmountIn,
        withdrawQuote.tokenAOutAmount,
        withdrawQuote.tokenBOutAmount,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const withdrawResult = await provider.sendAndConfirm(withdrawTx);
        console.log('Withdraw', withdrawResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
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
      await cpPoolFeeTiered.updateState();
      const inAmountLamport = new BN(0.1 * 10 ** cpPoolFeeTiered.tokenA.decimals);
      const inTokenMint = new PublicKey(cpPoolFeeTiered.tokenA.address);

      const { swapOutAmount, minSwapOutAmount } = cpPoolFeeTiered.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const swapTx = await cpPoolFeeTiered.swap(mockWallet.publicKey, inTokenMint, inAmountLamport, minSwapOutAmount);

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
      await cpPoolFeeTiered.updateState();
      const inAmountLamport = new BN(0.1 * 10 ** cpPoolFeeTiered.tokenB.decimals);
      const inTokenMint = new PublicKey(cpPoolFeeTiered.tokenB.address);

      const { swapOutAmount, minSwapOutAmount } = cpPoolFeeTiered.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const swapTx = await cpPoolFeeTiered.swap(mockWallet.publicKey, inTokenMint, inAmountLamport, minSwapOutAmount);

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));

        const swapResult = await provider.sendAndConfirm(swapTx);
        console.log('Swap Result of B → A', swapResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));

        const tokenAReceived = afterTokenABalance.sub(beforeTokenABalance);
        expect(tokenAReceived.toString()).toBe(swapOutAmount.toString());
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });
  });

  describe('With config', () => {
    beforeAll(async () => {
      const tradeFeeBps = 1500;
      const protocolFeeBps = 5000;
      const transaction = await AmmImpl.createConfig(
        connection,
        mockWallet.publicKey,
        new BN(tradeFeeBps),
        new BN(protocolFeeBps),
        PublicKey.default,
        new BN(0),
      );
      transaction.sign(mockWallet.payer);
      const txHash = await connection.sendRawTransaction(transaction.serialize());
      console.log('Create config', txHash);
      await connection.confirmTransaction(txHash, 'finalized');
    });

    test('Create constant product pool', async () => {
      const configs = await AmmImpl.getFeeConfigurations(connection);
      const btcDepositAmount = new BN(1 * btcMultiplier);
      const usdcDepositAmount = new BN(70000 * usdcMultiplier);

      const transactions = await AmmImpl.createPermissionlessConstantProductPoolWithConfig(
        connection,
        mockWallet.publicKey,
        btcTokenInfo,
        usdcTokenInfo,
        btcDepositAmount,
        usdcDepositAmount,
        configs[0].publicKey,
      );

      for (const transaction of transactions) {
        transaction.sign(mockWallet.payer);
        const txHash = await connection.sendRawTransaction(transaction.serialize());
        await connection.confirmTransaction(txHash, 'finalized');
      }

      const poolKey = derivePoolAddressWithConfig(
        new PublicKey(btcTokenInfo.address),
        new PublicKey(usdcTokenInfo.address),
        configs[0].publicKey,
        new PublicKey(PROGRAM_ID),
      );
      cpPoolConfig = await AmmImpl.create(connection, poolKey, btcTokenInfo, usdcTokenInfo);

      expect(poolKey.toBase58()).toBe(cpPoolConfig.address.toBase58());
      expect(cpPoolConfig.isStablePool).toBe(false);
      expect(cpPoolConfig.tokenA.address.toString()).toBe(BTC.toString());
      expect(cpPoolConfig.tokenB.address.toString()).toBe(USDC.toString());
      const poolFees = cpPoolConfig.poolState.fees;
      expect(poolFees.tradeFeeNumerator.gt(new BN(0))).toBe(true);
      expect(poolFees.protocolTradeFeeNumerator.gt(new BN(0))).toBe(true);
    });

    test('Get pool mint and supply', async () => {
      const lpMint = cpPoolConfig.getPoolTokenMint();
      expect(lpMint).toBeDefined();

      const lpSupply = await cpPoolConfig.getLpSupply();
      expect(lpSupply).toBeDefined();
    });

    test('Get user balance', async () => {
      const poolBalance = await cpPoolConfig.getUserBalance(mockWallet.publicKey);
      expect(poolBalance).toBeDefined();
    });

    test('Deposit', async () => {
      await cpPoolConfig.updateState();

      const btcDepositAmount = new BN(1 * btcMultiplier);

      const depositQuote = await cpPoolConfig.getDepositQuote(btcDepositAmount, new BN(0), true, 0);

      const depositTx = await cpPoolConfig.deposit(
        mockWallet.publicKey,
        depositQuote.tokenAInAmount,
        depositQuote.tokenBInAmount,
        depositQuote.poolTokenAmountOut,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const depositResult = await provider.sendAndConfirm(depositTx);
        console.log('Deposit', depositResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
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

    test('Withdraw', async () => {
      await cpPoolConfig.updateState();
      const lpTokenBalance = await cpPoolConfig.getUserBalance(mockWallet.publicKey);
      const lpTokenToWithdraw = lpTokenBalance.div(new BN(2));

      const withdrawQuote = await cpPoolConfig.getWithdrawQuote(lpTokenToWithdraw, 0);

      const withdrawTx = await cpPoolConfig.withdraw(
        mockWallet.publicKey,
        withdrawQuote.poolTokenAmountIn,
        withdrawQuote.tokenAOutAmount,
        withdrawQuote.tokenBOutAmount,
      );

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));
        const beforeTokenBBalance = await provider.connection
          .getTokenAccountBalance(mockWalletUsdcATA)
          .then((v) => new BN(v.value.amount));

        const withdrawResult = await provider.sendAndConfirm(withdrawTx);
        console.log('Withdraw', withdrawResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
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
      await cpPoolConfig.updateState();
      const inAmountLamport = new BN(0.1 * 10 ** cpPoolConfig.tokenA.decimals);
      const inTokenMint = new PublicKey(cpPoolConfig.tokenA.address);

      const { swapOutAmount, minSwapOutAmount } = cpPoolConfig.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const swapTx = await cpPoolConfig.swap(mockWallet.publicKey, inTokenMint, inAmountLamport, minSwapOutAmount);

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
      await cpPoolConfig.updateState();
      const inAmountLamport = new BN(0.1 * 10 ** cpPoolConfig.tokenB.decimals);
      const inTokenMint = new PublicKey(cpPoolConfig.tokenB.address);

      const { swapOutAmount, minSwapOutAmount } = cpPoolConfig.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const swapTx = await cpPoolConfig.swap(mockWallet.publicKey, inTokenMint, inAmountLamport, minSwapOutAmount);

      try {
        const beforeTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));

        const swapResult = await provider.sendAndConfirm(swapTx);
        console.log('Swap Result of B → A', swapResult);

        const afterTokenABalance = await provider.connection
          .getTokenAccountBalance(mockWalletBtcATA)
          .then((v) => new BN(v.value.amount));

        const tokenAReceived = afterTokenABalance.sub(beforeTokenABalance);
        expect(tokenAReceived.toString()).toBe(swapOutAmount.toString());
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });

    test('Swap with referral', async () => {
      await cpPoolConfig.updateState();
      const inAmountLamport = new BN(10 * 10 ** cpPoolConfig.tokenA.decimals);
      const inTokenMint = new PublicKey(cpPoolConfig.tokenA.address);

      const { swapOutAmount, minSwapOutAmount } = cpPoolConfig.getSwapQuote(
        inTokenMint,
        inAmountLamport,
        DEFAULT_SLIPPAGE,
      );
      expect(swapOutAmount.toNumber()).toBeGreaterThan(0);

      const referralKeypair = Keypair.generate();
      const referralATA = await getOrCreateATA(connection, inTokenMint, referralKeypair.publicKey, mockWallet.payer);

      const swapTx = await cpPoolConfig.swap(
        mockWallet.publicKey,
        inTokenMint,
        inAmountLamport,
        minSwapOutAmount,
        referralKeypair.publicKey,
      );

      try {
        const beforeTokenBalance = await provider.connection
          .getTokenAccountBalance(referralATA)
          .then((v) => new BN(v.value.amount));

        const swapResult = await provider.sendAndConfirm(swapTx);
        console.log('Swap Result of A → B', swapResult);

        const afterTokenBalance = await provider.connection
          .getTokenAccountBalance(referralATA)
          .then((v) => new BN(v.value.amount));

        const referralFeeReceived = afterTokenBalance.sub(beforeTokenBalance);
        expect(referralFeeReceived.gt(new BN(0))).toBe(true);
      } catch (error: any) {
        console.trace(error);
        throw new Error(error.message);
      }
    });
  });
});
