import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface GetPoolInfoAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** LP token mint of the pool */
  lpMint: PublicKey
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  aVaultLp: PublicKey
  /** LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  bVaultLp: PublicKey
  /** Vault account for token a. token a of the pool will be deposit / withdraw from this vault account. */
  aVault: PublicKey
  /** Vault account for token b. token b of the pool will be deposit / withdraw from this vault account. */
  bVault: PublicKey
  /** LP token mint of vault a */
  aVaultLpMint: PublicKey
  /** LP token mint of vault b */
  bVaultLpMint: PublicKey
}

/** Get the general information of the pool. */
export function getPoolInfo(
  accounts: GetPoolInfoAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.lpMint, isSigner: false, isWritable: false },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: false },
    { pubkey: accounts.bVaultLp, isSigner: false, isWritable: false },
    { pubkey: accounts.aVault, isSigner: false, isWritable: false },
    { pubkey: accounts.bVault, isSigner: false, isWritable: false },
    { pubkey: accounts.aVaultLpMint, isSigner: false, isWritable: false },
    { pubkey: accounts.bVaultLpMint, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([9, 48, 220, 101, 22, 240, 78, 200])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
