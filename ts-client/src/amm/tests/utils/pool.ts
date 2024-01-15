import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { AmmProgram, CurveType, PoolCreatedSimulation, VaultProgram } from '../../types';
import { BN, Program } from '@project-serum/anchor';
import { encodeCurveType, getFirstKey, getSecondKey, getTradeFeeBpsBuffer } from '../../utils';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getOrCreateATA } from './index';
import { FEE_OWNER } from '../../constants';
import { expect } from 'chai';
import { Amm } from '../../idl';

export const simulateInitializePermissionlessPoolWithFeeTier = async (
  connection: Connection,
  aVault: PublicKey,
  bVault: PublicKey,
  ammProgram: AmmProgram,
  vaultProgram: VaultProgram,
  userKeypair: Keypair,
  curve: CurveType,
  aDepositAmount: BN,
  bDepositAmount: BN,
  tradeFeeBps: BN,
) => {
  let { pool, poolLpMint, aVaultAccount, bVaultAccount, instruction } =
    await initializePermissionlessPoolWithFeeTierInstruction(
      connection,
      aVault,
      bVault,
      ammProgram,
      vaultProgram,
      userKeypair,
      curve,
      aDepositAmount,
      bDepositAmount,
      tradeFeeBps,
    );
  let simulation: PoolCreatedSimulation = await instruction.simulate();

  let event = simulation.events[0].data;
  expect(event.pool.toBase58()).to.equal(pool.toBase58());
  expect(event.lpMint.toBase58()).to.equal(poolLpMint.toBase58());
  expect(event.tokenAMint.toBase58()).to.equal(aVaultAccount.tokenMint.toBase58());
  expect(event.tokenBMint.toBase58()).to.equal(bVaultAccount.tokenMint.toBase58());
  expect(event.poolType).to.deep.equal({ permissionless: {} });

  return pool;
};

export const initializePermissionlessPoolWithFeeTier = async (
  connection: Connection,
  aVault: PublicKey,
  bVault: PublicKey,
  ammProgram: AmmProgram,
  vaultProgram: VaultProgram,
  userKeypair: Keypair,
  curve: CurveType,
  aDepositAmount: BN,
  bDepositAmount: BN,
  tradeFeeBps: BN,
) => {
  let { pool, poolLpMint, aVaultAccount, bVaultAccount, instruction } =
    await initializePermissionlessPoolWithFeeTierInstruction(
      connection,
      aVault,
      bVault,
      ammProgram,
      vaultProgram,
      userKeypair,
      curve,
      aDepositAmount,
      bDepositAmount,
      tradeFeeBps,
    );
  let sigHash = await instruction.rpc();
  return { pool, poolLpMint, aVaultAccount, bVaultAccount };
};

export const initializePermissionlessPoolWithFeeTierInstruction = async (
  connection: Connection,
  aVault: PublicKey,
  bVault: PublicKey,
  ammProgram: AmmProgram,
  vaultProgram: VaultProgram,
  userKeypair: Keypair,
  curve: CurveType,
  aDepositAmount: BN,
  bDepositAmount: BN,
  tradeFeeBps: BN,
) => {
  const [aVaultAccount, bVaultAccount] = await Promise.all([
    vaultProgram.account.vault.fetch(aVault),
    vaultProgram.account.vault.fetch(bVault),
  ]);

  const [poolPubkey, _poolPubkeyBump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from([encodeCurveType(curve)]),
      getFirstKey(aVaultAccount.tokenMint, bVaultAccount.tokenMint),
      getSecondKey(aVaultAccount.tokenMint, bVaultAccount.tokenMint),
      getTradeFeeBpsBuffer(curve, tradeFeeBps),
    ],
    ammProgram.programId,
  );

  const [poolLpMint, _poolLpMintBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('lp_mint'), poolPubkey.toBuffer()],
    ammProgram.programId,
  );

  const { aVaultLpPda, bVaultLpPda } = getPoolPdas(poolPubkey, aVault, bVault, ammProgram);

  const payerPoolLp = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    poolLpMint,
    userKeypair.publicKey,
  );

  const [userTokenA, userTokenB] = await Promise.all([
    getOrCreateATA(connection, aVaultAccount.tokenMint, userKeypair.publicKey, userKeypair),
    getOrCreateATA(connection, bVaultAccount.tokenMint, userKeypair.publicKey, userKeypair),
  ]);

  const [adminTokenAFee, adminTokenBFee] = getAdminFeeTokenPDA(
    aVaultAccount.tokenMint,
    bVaultAccount.tokenMint,
    poolPubkey,
    ammProgram,
  );

  const setComputeUnitLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1_400_000,
  });

  let instruction = ammProgram.methods
    .initializePermissionlessPoolWithFeeTier(curve as any, tradeFeeBps, aDepositAmount, bDepositAmount)
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
    })
    .preInstructions([setComputeUnitLimitIx])
    .signers([userKeypair]);

  return {
    pool: poolPubkey,
    poolLpMint,
    aVaultAccount,
    bVaultAccount,
    instruction,
  };
};

const getPoolPdas = (poolPubkey: PublicKey, aVault: PublicKey, bVault: PublicKey, ammProgram: Program<Amm>) => {
  const aVaultLpPda = PublicKey.findProgramAddressSync(
    [aVault.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId,
  );
  const bVaultLpPda = PublicKey.findProgramAddressSync(
    [bVault.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId,
  );

  return {
    aVaultLpPda,
    bVaultLpPda,
  };
};

const getAdminFeeTokenPDA = (tokenA: PublicKey, tokenB: PublicKey, poolPubkey: PublicKey, ammProgram: Program<Amm>) => {
  const feeTokenA = PublicKey.findProgramAddressSync(
    [Buffer.from('fee'), tokenA.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId,
  )[0];

  const feeTokenB = PublicKey.findProgramAddressSync(
    [Buffer.from('fee'), tokenB.toBuffer(), poolPubkey.toBuffer()],
    ammProgram.programId,
  )[0];

  return [feeTokenA, feeTokenB];
};
