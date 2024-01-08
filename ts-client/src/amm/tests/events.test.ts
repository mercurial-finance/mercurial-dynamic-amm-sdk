import { AnchorProvider, BN, getProvider, Program} from '@coral-xyz/anchor';
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
import {
  createProgramWithWallet,
  encodeCurveType,
  getFirstKey,
  getSecondKey,
  getTradeFeeBpsBuffer,
} from '../utils';
import { USDC_TOKEN_DECIMAL, WSOL_TOKEN_DECIMAL } from './constants';
import { TokenInfo } from '@solana/spl-token-registry';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { expect } from 'chai';

describe("Events", () => {
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

  type AmmEvent = IdlEvents<Amm>;

  before(async () => {
    // setProvider(provider);
    await airDropSol(provider.connection, mockWallet.publicKey, 1000);

    let { ata: wsolAta, tokenMint: wsolTokenMint } = await createAndMintTo(provider.connection, mockWallet.payer, mockWallet.publicKey, 100000, WSOL_TOKEN_DECIMAL);
    let { ata: usdcAta, tokenMint: usdcTokenMint} = await createAndMintTo(provider.connection, mockWallet.payer, mockWallet.publicKey, 100000, USDC_TOKEN_DECIMAL);

    wsolTokenInfo = createWethTokenInfo(wsolAta);
    usdcTokenInfo = createUsdcTokenInfo(usdcAta);

    let { ammProgram : newAmmProgram, vaultProgram: newVaultProgram } = createProgramWithWallet(provider.connection, mockWallet);
    ammProgram = newAmmProgram;
    vaultProgram = newVaultProgram;

    wsolVault = await setupVault(
      wsolTokenMint.publicKey,
      vaultProgram,
      mockWallet.payer
    );

    usdcVault = await setupVault(
      usdcTokenMint.publicKey,
      vaultProgram,
      mockWallet.payer
    );

    await depositVault(
      provider.connection,
      wsolVault,
      mockWallet.payer,
      vaultProgram,
      new BN(10 * 10 ** WSOL_TOKEN_DECIMAL),
    );

    await depositVault( provider.connection,
      usdcVault,
      mockWallet.payer,
      vaultProgram,
      new BN(1000 * 10 ** USDC_TOKEN_DECIMAL));
  });


  beforeEach(async () => {

  })

  it("initializePermissionlessPool should emit PoolCreated event", async () => {
    const listenerId = ammProgram.addEventListener("PoolCreated", async (event, slot, signature) => {
      console.log("got event");
    });

    const tokenAInfo = wsolTokenInfo;
    const tokenBInfo = usdcTokenInfo;
    const tokenAAmount = new BN(10 * 10 ** WSOL_TOKEN_DECIMAL);
    const tokenBAmount = new BN(1000 * 10 ** USDC_TOKEN_DECIMAL);
    const tradeFeeBps = new BN(25);
    const curveType: CurveType = {
      constantProduct: {}
    };

    const pool = await initializePermissionlessPoolWithFeeTier(provider.connection, wsolVault, usdcVault, ammProgram, vaultProgram, mockWallet.payer, curveType, tokenAAmount, tokenBAmount, tradeFeeBps);
    console.log("new pool ", pool.toBase58());

    setTimeout(() => {}, 2000);

    await ammProgram.removeEventListener(listenerId);
  });
});

function createWethTokenInfo(tokenAddress: PublicKey): TokenInfo {
  return {
    chainId: 1,
      address: tokenAddress.toBase58(),
    decimals: 9,
    name: 'Wrapped SOL',
    symbol: 'SOL',
    logoURI:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      extensions: {
    coingeckoId: 'solana',
      serumV3Usdc: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
      serumV3Usdt: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
      website: 'https://solana.com/',
    }
  }
};

function createUsdcTokenInfo(tokenAddress: PublicKey): TokenInfo {
  return {
    chainId: 1,
    address: tokenAddress.toBase58(),
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    extensions: {
      coingeckoId: 'usd-coin',
      serumV3Usdt: '77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS',
      website: 'https://www.centre.io/',
    },
  }
};

async function setupVault(tokenMint: PublicKey, vaultProgram: VaultProgram, adminKeypair: Keypair) {
  const vaultBase = VAULT_BASE_KEY;
  const { vaultPda, tokenVaultPda, lpMintPda } = await getVaultPdas(
    tokenMint,
    vaultBase,
    vaultProgram
  );
  await vaultProgram.methods
    .initialize()
    .accounts({
      vault: vaultPda[0],
      tokenVault: tokenVaultPda[0],
      tokenMint,
      payer: adminKeypair.publicKey,
      lpMint: lpMintPda[0],
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([adminKeypair])
    .rpc();

  return vaultPda[0];

}

export const getVaultPdas = async (
  tokenMint: PublicKey,
  base: PublicKey,
  vaultProgram: VaultProgram,
) => {
  const vaultPda = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), tokenMint.toBuffer(), base.toBuffer()],
    vaultProgram.programId
  );

  const tokenVaultPda = PublicKey.findProgramAddressSync(
    [Buffer.from("token_vault"), vaultPda[0].toBuffer()],
    vaultProgram.programId
  );

  const lpMintPda = PublicKey.findProgramAddressSync(
    [Buffer.from("lp_mint"), vaultPda[0].toBuffer()],
    vaultProgram.programId
  );

  return {
    vaultPda,
    tokenVaultPda,
    lpMintPda,
  };
};

export const depositVault = async (connection: Connection, vault: PublicKey, userKeypair: Keypair, vaultProgram: VaultProgram, depositAmount: BN) => {

  const vaultAccount = await vaultProgram.account.vault.fetch(vault);

  const userWsolLpMint = await getOrCreateATA(
    connection,
    vaultAccount.lpMint,
    userKeypair.publicKey,
    userKeypair,
  );

  const userToken = await getOrCreateATA(
    connection,
    vaultAccount.tokenMint,
    userKeypair.publicKey,
    userKeypair,
  );

  await vaultProgram.methods
    .deposit(depositAmount, new BN(0))
    .accounts({
      lpMint: vaultAccount.lpMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenVault: vaultAccount.tokenVault,
      userLp: userWsolLpMint,
      user: userKeypair.publicKey,
      userToken,
      vault,
    })
    .signers([userKeypair])
    .rpc();
};

export const initializePermissionlessPoolWithFeeTier = async (connection: Connection,
  aVault: PublicKey, bVault: PublicKey, ammProgram: AmmProgram, vaultProgram: VaultProgram, userKeypair: Keypair, curve: CurveType, aDepositAmount: BN, bDepositAmount: BN, tradeFeeBps: BN
): Promise<PublicKey> => {
  const [aVaultAccount, bVaultAccount] = await Promise.all([
    vaultProgram.account.vault.fetch(aVault),
    vaultProgram.account.vault.fetch(bVault),
  ]);

  const [poolPubkey, _poolPubkeyBump] =
    PublicKey.findProgramAddressSync(
      [
        Buffer.from([encodeCurveType(curve)]),
        getFirstKey(aVaultAccount.tokenMint, bVaultAccount.tokenMint),
        getSecondKey(aVaultAccount.tokenMint, bVaultAccount.tokenMint),
        getTradeFeeBpsBuffer(curve, tradeFeeBps),
      ],
      ammProgram.programId
    );

  const [poolLpMint, _poolLpMintBump] =
    PublicKey.findProgramAddressSync(
      [Buffer.from("lp_mint"), poolPubkey.toBuffer()],
      ammProgram.programId
    );

  const { aVaultLpPda, bVaultLpPda } = getPoolPdas(
    poolPubkey,
    aVault,
    bVault,
    ammProgram
  );

  const payerPoolLp = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    poolLpMint,
    userKeypair.publicKey
  );

  const [userTokenA, userTokenB] = await Promise.all([
    getOrCreateATA(
      connection,
      aVaultAccount.tokenMint,
      userKeypair.publicKey,
      userKeypair
    ),
    getOrCreateATA(
      connection,
      bVaultAccount.tokenMint,
      userKeypair.publicKey,
      userKeypair
    ),
  ]);

  const [adminTokenAFee, adminTokenBFee] = getAdminFeeTokenPDA(
    aVaultAccount.tokenMint,
    bVaultAccount.tokenMint,
    poolPubkey,
    ammProgram
  );

  const setComputeUnitLimitIx =
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 1_400_000,
    });

  let simulation = await ammProgram.methods.initializePermissionlessPoolWithFeeTier(
      curve as any,
      tradeFeeBps,
      aDepositAmount,
      bDepositAmount
    )
    .accounts({
      pool: poolPubkey,
      tokenAMint: aVaultAccount.tokenMint,
      tokenBMint: bVaultAccount.tokenMint,
      aVault,
      bVault,
      aVaultLpMint: aVaultAccount.lpMint,
      bVaultLpMint: bVaultAccount.lpMint,
      aVaultLp: aVaultLpPda[0],
      bVaultLp: bVaultLpPda[0],
      lpMint: poolLpMint,
      payerTokenA: userTokenA,
      payerTokenB: userTokenB,
      adminTokenAFee,
      adminTokenBFee,
      payerPoolLp: payerPoolLp,
      aTokenVault: aVaultAccount.tokenVault,
      bTokenVault: bVaultAccount.tokenVault,
      feeOwner: FEE_OWNER,
      payer: userKeypair.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      vaultProgram: vaultProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    }).preInstructions([setComputeUnitLimitIx])
    .signers([userKeypair]).simulate();


  let event= simulation.events[0].data;
  expect(event.pool.toBase58()).to.equal(poolPubkey.toBase58());
  expect(event.lpMint.toBase58()).to.equal(poolLpMint.toBase58());
  expect(event.tokenAMint.toBase58()).to.equal(aVaultAccount.tokenMint.toBase58());
  expect(event.tokenBMint.toBase58()).to.equal(bVaultAccount.tokenMint.toBase58());
  expect(event.poolType).to.deep.equal({ permissionless: {}});

  return poolPubkey;
};

const getPoolPdas = (
  poolPubkey: PublicKey,
  aVault: PublicKey,
  bVault: PublicKey,
  ammProgram: Program<Amm>
) => {
  const aVaultLpPda = PublicKey.findProgramAddressSync(
    [aVault.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId
  );
  const bVaultLpPda = PublicKey.findProgramAddressSync(
    [bVault.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId
  );

  return {
    aVaultLpPda,
    bVaultLpPda,
  };
}

const getAdminFeeTokenPDA = (
  tokenA: PublicKey,
  tokenB: PublicKey,
  poolPubkey: PublicKey,
  ammProgram: Program<Amm>
) => {
  const feeTokenA = PublicKey.findProgramAddressSync(
    [Buffer.from("fee"), tokenA.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId
  )[0];

  const feeTokenB = PublicKey.findProgramAddressSync(
    [Buffer.from("fee"), tokenB.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId
  )[0];

  return [feeTokenA, feeTokenB];
}
