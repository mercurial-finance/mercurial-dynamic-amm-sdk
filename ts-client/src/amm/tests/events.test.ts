import { AnchorProvider, BN, getProvider, Program } from '@coral-xyz/anchor';
import { airDropSol, createAndMintTo, DEVNET, getOrCreateATA, LOCALNET, mockWallet } from './utils';
import { FEE_OWNER, VAULT_BASE_KEY } from '../constants';
import {
  Cluster,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import AmmImpl from '../index';
import { AmmProgram, ConstantProductCurve, CurveType, VaultProgram } from '../types';
import { IdlEvents } from '@coral-xyz/anchor';
import { Amm } from '../idl';
import { createProgramWithWallet, encodeCurveType, getFirstKey, getSecondKey, getTradeFeeBpsBuffer } from '../utils';
import { USDC_TOKEN_DECIMAL, WSOL_TOKEN_DECIMAL } from './constants';
import { TokenInfo } from '@solana/spl-token-registry';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { expect } from 'chai';
import { simulateInitializePermissionlessPoolWithFeeTier } from './utils/pool';
import { setupVault, depositVault } from './utils/vault';
import { createUsdcTokenInfo, createWethTokenInfo } from './utils/mock_token_info';

describe('Events', () => {
  const provider = getProvider();

  let wsolTokenInfo: TokenInfo;
  let usdcTokenInfo: TokenInfo;

  let ammProgram: AmmProgram;
  let vaultProgram: VaultProgram;
  let wsolVault: PublicKey;
  let usdcVault: PublicKey;

  before(async () => {
    await airDropSol(provider.connection, mockWallet.publicKey, 1000);

    let { ata: wsolAta, tokenMint: wsolTokenMint } = await createAndMintTo(
      provider.connection,
      mockWallet.payer,
      mockWallet.publicKey,
      100000,
      WSOL_TOKEN_DECIMAL,
    );
    let { ata: usdcAta, tokenMint: usdcTokenMint } = await createAndMintTo(
      provider.connection,
      mockWallet.payer,
      mockWallet.publicKey,
      100000,
      USDC_TOKEN_DECIMAL,
    );

    wsolTokenInfo = createWethTokenInfo(wsolAta);
    usdcTokenInfo = createUsdcTokenInfo(usdcAta);

    let { ammProgram: newAmmProgram, vaultProgram: newVaultProgram } = createProgramWithWallet(
      provider.connection,
      mockWallet,
    );
    ammProgram = newAmmProgram;
    vaultProgram = newVaultProgram;

    wsolVault = await setupVault(wsolTokenMint.publicKey, vaultProgram, mockWallet.payer);

    usdcVault = await setupVault(usdcTokenMint.publicKey, vaultProgram, mockWallet.payer);

    await depositVault(
      provider.connection,
      wsolVault,
      mockWallet.payer,
      vaultProgram,
      new BN(10 * 10 ** WSOL_TOKEN_DECIMAL),
    );

    await depositVault(
      provider.connection,
      usdcVault,
      mockWallet.payer,
      vaultProgram,
      new BN(1000 * 10 ** USDC_TOKEN_DECIMAL),
    );
  });

  it('initializePermissionlessPool should emit PoolCreated event', async () => {
    const listenerId = ammProgram.addEventListener('PoolCreated', async (event, slot, signature) => {
      console.log('got event');
    });

    const tokenAAmount = new BN(10 * 10 ** WSOL_TOKEN_DECIMAL);
    const tokenBAmount = new BN(1000 * 10 ** USDC_TOKEN_DECIMAL);
    const tradeFeeBps = new BN(25);
    const curveType: CurveType = {
      constantProduct: {},
    };

    const pool = await simulateInitializePermissionlessPoolWithFeeTier(
      provider.connection,
      wsolVault,
      usdcVault,
      ammProgram,
      vaultProgram,
      mockWallet.payer,
      curveType,
      tokenAAmount,
      tokenBAmount,
      tradeFeeBps,
    );
    console.log('new pool ', pool.toBase58());

    setTimeout(() => {}, 2000);

    await ammProgram.removeEventListener(listenerId);
  });
});
