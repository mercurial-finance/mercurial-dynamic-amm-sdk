import { AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { airDropSol, getOrCreateATA, mockWallet, wrapSol } from './utils';
import { createMint, mintTo, NATIVE_MINT } from '@solana/spl-token';
import AmmImpl from '..';
import { BN } from 'bn.js';
import { ActivationType } from '../types';
import { createProgram, deriveCustomizablePermissionlessConstantProductPoolAddress } from '../utils';

const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
const provider = new AnchorProvider(connection, mockWallet, {
  commitment: connection.commitment,
});

describe('Initialize customizable permissionless constant product pool', () => {
  let MEME: PublicKey;

  let memeDecimal = 9;

  let mockWalletMemeATA: PublicKey;
  let mockWalletSolATA: PublicKey;

  const memeMultiplier = 10 ** memeDecimal;

  beforeAll(async () => {
    await airDropSol(connection, mockWallet.publicKey, 10);

    MEME = await createMint(provider.connection, mockWallet.payer, mockWallet.publicKey, null, memeDecimal);

    mockWalletMemeATA = await getOrCreateATA(connection, MEME, mockWallet.publicKey, mockWallet.payer);
    mockWalletSolATA = await getOrCreateATA(connection, NATIVE_MINT, mockWallet.publicKey, mockWallet.payer);

    await mintTo(
      provider.connection,
      mockWallet.payer,
      MEME,
      mockWalletMemeATA,
      mockWallet.payer.publicKey,
      1000000 * memeMultiplier,
      [],
      {
        commitment: 'confirmed',
      },
    );

    await wrapSol(connection, new BN(1_000_000), mockWallet.payer);
  });

  test('Initialize customizable CP pool', async () => {
    const tokenAAmount = new BN(1_000_000);
    const tokenBAmount = new BN(1_000_000);

    const initializeTx = await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      connection,
      mockWallet.publicKey,
      MEME,
      NATIVE_MINT,
      tokenAAmount,
      tokenBAmount,
      {
        // Denominator is default to 100_000
        tradeFeeNumerator: 2500,
        activationType: ActivationType.Timestamp,
        activationPoint: null,
        hasAlphaVault: false,
        padding: Array(90).fill(0),
      },
    );

    initializeTx.sign(mockWallet.payer);
    // 1124 bytes
    const txHash = await connection.sendRawTransaction(initializeTx.serialize());
    await connection.confirmTransaction(txHash, 'finalized');

    const poolKey = deriveCustomizablePermissionlessConstantProductPoolAddress(
      MEME,
      NATIVE_MINT,
      createProgram(connection).ammProgram.programId,
    );

    const pool = await AmmImpl.create(connection, poolKey);
    expect(pool.feeBps.eq(new BN(250))).toBeTruthy();
  });
});
