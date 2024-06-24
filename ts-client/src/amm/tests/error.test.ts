import AmmImpl from '..';
import { airDropSol, getOrCreateATA, mockWallet } from './utils';
import {
  CONSTANT_PRODUCT_DEFAULT_TRADE_FEE_BPS,
  DEFAULT_SLIPPAGE,
  DEVNET_COIN,
  DEVNET_POOL,
  MAINNET_POOL,
  STABLE_SWAP_DEFAULT_TRADE_FEE_BPS,
} from '../constants';
import { Cluster, Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN } from '@project-serum/anchor';
import DynamicAmmError from '../error';
import { IDL } from '../idl';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { TokenInfo } from '@solana/spl-token-registry';
import { derivePoolAddress } from '../utils';
import { msolTokenInfo, solTokenInfo } from './stableSwap.test';

describe('Error parsing', () => {
  const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
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

  let stablePool: AmmImpl;
  let cpPool: AmmImpl;
  let lstPool: AmmImpl;

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

  beforeAll(async () => {
    await airDropSol(connection, mockWallet.publicKey, 10);

    const usdtDepositAmount = new BN(10000 * usdtMultiplier);
    const usdcDepositAmount = new BN(10000 * usdcMultiplier);

    let tradeFeeBps = new BN(STABLE_SWAP_DEFAULT_TRADE_FEE_BPS);
    let transaction = await AmmImpl.createPermissionlessPool(
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
    let txHash = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(txHash, 'finalized');

    let poolKey = derivePoolAddress(connection, usdtTokenInfo, usdcTokenInfo, true, tradeFeeBps);
    stablePool = await AmmImpl.create(connection, poolKey, usdtTokenInfo, usdcTokenInfo);

    tradeFeeBps = new BN(CONSTANT_PRODUCT_DEFAULT_TRADE_FEE_BPS);
    transaction = await AmmImpl.createPermissionlessPool(
      connection,
      mockWallet.publicKey,
      usdtTokenInfo,
      usdcTokenInfo,
      usdtDepositAmount,
      usdcDepositAmount,
      false,
      tradeFeeBps,
    );

    transaction.sign(mockWallet.payer);
    txHash = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(txHash, 'finalized');

    poolKey = derivePoolAddress(connection, usdtTokenInfo, usdcTokenInfo, false, tradeFeeBps);
    cpPool = await AmmImpl.create(connection, poolKey, usdtTokenInfo, usdcTokenInfo);

    lstPool = await AmmImpl.create(connection, MAINNET_POOL.SOL_MSOL, solTokenInfo, msolTokenInfo);
  });

  test('Should throw slippage error', async () => {
    const inAmountBLamport = new BN(0.1 * 10 ** cpPool.tokenB.decimals);

    const { tokenAInAmount: cpTokenAInAmount, tokenBInAmount: cpTokenBInAmount } = cpPool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
      true,
      DEFAULT_SLIPPAGE,
    );

    const cpDepositTx = await cpPool.deposit(
      mockWallet.publicKey,
      cpTokenAInAmount,
      cpTokenBInAmount,
      new BN(Number.MAX_SAFE_INTEGER),
    );

    await provider.sendAndConfirm(cpDepositTx).catch((error) => {
      const ammError = new DynamicAmmError(error);

      expect(ammError.errorCode).toBe(IDL.errors[4].code);
    });

    const inLamportAmount = new BN(1 * 10 ** lstPool.tokenA.decimals);
    const { tokenAInAmount: depegTokenAInAmount, tokenBInAmount: depegTokenBInAmount } = lstPool.getDepositQuote(
      inLamportAmount,
      new BN(0),
      false,
      DEFAULT_SLIPPAGE,
    );

    const lstPoolDepositTx = await lstPool.deposit(
      mockWallet.publicKey,
      depegTokenAInAmount,
      depegTokenBInAmount,
      new BN(Number.MAX_SAFE_INTEGER),
    );

    await provider.sendAndConfirm(lstPoolDepositTx).catch((error) => {
      const ammError = new DynamicAmmError(error);
      expect(ammError.errorCode).toBe(IDL.errors[4].code);
    });

    const { tokenAInAmount: stableTokenAInAmount, tokenBInAmount: stableTokenBInAmount } = stablePool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
      true,
      DEFAULT_SLIPPAGE,
    );

    const stablePoolDepositTx = await stablePool.deposit(
      mockWallet.publicKey,
      stableTokenAInAmount,
      stableTokenBInAmount,
      new BN(Number.MAX_SAFE_INTEGER),
    );

    await provider.sendAndConfirm(stablePoolDepositTx).catch((error) => {
      const ammError = new DynamicAmmError(error);

      expect(ammError.errorCode).toBe(IDL.errors[4].code);
    });
  });
});
