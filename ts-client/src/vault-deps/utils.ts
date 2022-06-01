import { PublicKey } from "@solana/web3.js";
import { VAULT_BASE_KEY } from "./constants";

export const getVaultPdas = async (
  tokenMint: PublicKey,
  programId: PublicKey
) => {
  const [vault, _vaultBump] = await PublicKey.findProgramAddress(
    [Buffer.from("vault"), tokenMint.toBuffer(), VAULT_BASE_KEY.toBuffer()],
    programId
  );

  const [tokenVault, lpMint] = await Promise.all([
    PublicKey.findProgramAddress(
      [Buffer.from("token_vault"), vault.toBuffer()],
      programId
    ),
    PublicKey.findProgramAddress(
      [Buffer.from("lp_mint"), vault.toBuffer()],
      programId
    ),
  ]);

  return {
    vaultPda: vault,
    tokenVaultPda: tokenVault[0],
    lpMintPda: lpMint[0],
  };
};
