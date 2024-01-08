import { BN, getProvider, IdlEvents } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import AmmImpl from '../index';
import { AmmProgram, CurveType, VaultProgram } from '../types';
import { Amm } from '../idl';
import { airDropSol, createAndMintTo, mockWallet } from './utils';
import { USDC_TOKEN_DECIMAL, WSOL_TOKEN_DECIMAL } from './constants';
import { createProgramWithWallet } from '../utils';
import { createUsdcTokenInfo, createWethTokenInfo } from './utils/mock_token_info';
import { depositVault, setupVault } from './utils/vault';
import { initializePermissionlessPoolWithFeeTier, simulateInitializePermissionlessPoolWithFeeTier } from './utils/pool';

describe('Pool', () => {
  const provider = getProvider();

  let wsolAta: PublicKey;
  let usdcAta: PublicKey;

  let wsolTokenInfo: TokenInfo;
  let usdcTokenInfo: TokenInfo;

  let cpPool: AmmImpl;
  let depegPool: AmmImpl;
  let stablePool: AmmImpl;
  let currentCpPoolBalance: BN;
  let currentDepegPoolBalance: BN;
  let currentStablePoolBalance: BN;

  let ammProgram: AmmProgram;
  let vaultProgram: VaultProgram;
  let wsolVault: PublicKey;
  let usdcVault: PublicKey;
  let pool: PublicKey;

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

    const tokenAAmount = new BN(10 * 10 ** WSOL_TOKEN_DECIMAL);
    const tokenBAmount = new BN(1000 * 10 ** USDC_TOKEN_DECIMAL);
    const tradeFeeBps = new BN(25);
    const curveType: CurveType = {
      constantProduct: {},
    };

    pool = await initializePermissionlessPoolWithFeeTier(
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
  });

  it('should able to subscribe reserve changes', async () => {});
});
