import { AnchorProvider, BN, Wallet } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { TokenInfo } from '@solana/spl-token-registry';
import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import AmmImpl from '../index';
import { derivePoolAddress } from '../utils';
import { airDropSolIfBalanceNotEnough, getOrCreateATA } from './utils';

describe('Constant product pool', () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const privateKey = JSON.parse(process.env.WALLET_PRIVATE_KEY || '[]');
  const mockWallet = new Wallet(Keypair.fromSecretKey(new Uint8Array(privateKey)));

  console.log('Connected wallet', mockWallet.payer.publicKey.toBase58());

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
    await airDropSolIfBalanceNotEnough(connection, mockWallet.publicKey, 1);

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

  test('Create constant product pool 100 bps', async () => {
    const btcDepositAmount = new BN(1 * btcMultiplier);
    const usdcDepositAmount = new BN(70000 * usdcMultiplier);

    const tradeFeeBps = new BN(100);
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

    expect(cpPoolFeeTiered.feeBps.toNumber()).toBe(tradeFeeBps.toNumber());
  });
});
