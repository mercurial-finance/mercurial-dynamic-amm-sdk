import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { VaultProgram } from '../../types';
import { VAULT_BASE_KEY } from '../../constants';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@project-serum/anchor';
import { getOrCreateATA } from './index';

/** Setup new vault */
export async function setupVault(tokenMint: PublicKey, vaultProgram: VaultProgram, adminKeypair: Keypair) {
  const vaultBase = VAULT_BASE_KEY;
  const { vaultPda, tokenVaultPda, lpMintPda } = await getVaultPdas(tokenMint, vaultBase, vaultProgram);
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

/** Deposit to vault */
export async function depositVault(
  connection: Connection,
  vault: PublicKey,
  userKeypair: Keypair,
  vaultProgram: VaultProgram,
  depositAmount: BN,
) {
  const vaultAccount = await vaultProgram.account.vault.fetch(vault);

  const userWsolLpMint = await getOrCreateATA(connection, vaultAccount.lpMint, userKeypair.publicKey, userKeypair);

  const userToken = await getOrCreateATA(connection, vaultAccount.tokenMint, userKeypair.publicKey, userKeypair);

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
}

export const getVaultPdas = async (tokenMint: PublicKey, base: PublicKey, vaultProgram: VaultProgram) => {
  const vaultPda = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), tokenMint.toBuffer(), base.toBuffer()],
    vaultProgram.programId,
  );

  const tokenVaultPda = PublicKey.findProgramAddressSync(
    [Buffer.from('token_vault'), vaultPda[0].toBuffer()],
    vaultProgram.programId,
  );

  const lpMintPda = PublicKey.findProgramAddressSync(
    [Buffer.from('lp_mint'), vaultPda[0].toBuffer()],
    vaultProgram.programId,
  );

  return {
    vaultPda,
    tokenVaultPda,
    lpMintPda,
  };
};
