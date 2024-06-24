import { AnchorProvider, BN } from '@project-serum/anchor';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { Cluster, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  CONSTANT_PRODUCT_DEFAULT_TRADE_FEE_BPS,
  DEFAULT_SLIPPAGE,
  DEVNET_COIN,
  DEVNET_POOL,
  MAINNET_POOL,
  STABLE_SWAP_DEFAULT_TRADE_FEE_BPS,
  STAGING_PROGRAM_ID,
} from '../constants';
import AmmImpl from '../index';
import { calculateSwapQuote, derivePoolAddress, getOnchainTime } from '../utils';
import { airDropSol, airDropSolIfBalanceNotEnough, getOrCreateATA, mockWallet } from './utils';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';

describe('Stable Swap pool', () => {
  const connection = new Connection('http://localhost:8899', 'confirmed');
  const provider = new AnchorProvider(connection, mockWallet, {
    commitment: connection.commitment,
  });

  let usdtToken: Token;
  let usdcToken: Token;

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

    usdtToken = await Token.createMint(
      provider.connection,
      mockWallet.payer,
      mockWallet.publicKey,
      null,
      usdtDecimal,
      TOKEN_PROGRAM_ID,
    );

    USDT = usdtToken.publicKey;
    usdtTokenInfo = {
      chainId: 101,
      address: usdtToken.publicKey.toString(),
      symbol: 'USDT',
      decimals: usdtDecimal,
      name: 'Tether USD',
      logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
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

    mockWalletUsdtATA = await getOrCreateATA(connection, USDT, mockWallet.publicKey, mockWallet.payer);
    mockWalletUsdcATA = await getOrCreateATA(connection, USDC, mockWallet.publicKey, mockWallet.payer);

    await usdtToken.mintTo(mockWalletUsdtATA, mockWallet.payer, [], 1000000 * usdtMultiplier);
    await usdcToken.mintTo(mockWalletUsdcATA, mockWallet.payer, [], 1000000 * usdcMultiplier);
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
      await connection.confirmTransaction(txHash);

      const poolKey = derivePoolAddress(connection, usdtTokenInfo, usdcTokenInfo, true, tradeFeeBps);
      stableSwapFeeTiered = await AmmImpl.create(connection, poolKey, usdtTokenInfo, usdcTokenInfo);

      expect(poolKey.toBase58()).toBe(stableSwapFeeTiered.address.toBase58());
      expect(stableSwapFeeTiered.isStablePool).toBe(true);
      expect(stableSwapFeeTiered.tokenA.address.toString()).toBe(USDT.toString());
      expect(stableSwapFeeTiered.tokenB.address.toString()).toBe(USDC.toString());
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

      console.log(depositQuote);

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
      const inAmountLamport = new BN(0.1 * 10 ** stableSwapFeeTiered.tokenA.decimals);
      const inTokenMint = new PublicKey(stableSwapFeeTiered.tokenA.address);

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
      const inAmountLamport = new BN(0.1 * 10 ** stableSwapFeeTiered.tokenB.decimals);
      const inTokenMint = new PublicKey(stableSwapFeeTiered.tokenB.address);

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
