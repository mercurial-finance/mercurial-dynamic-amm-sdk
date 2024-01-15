import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateMintMetadataAccounts {
  /** Pool account */
  pool: PublicKey
  /** LP mint account of the pool */
  lpMint: PublicKey
  /** Vault A LP account of the pool */
  aVaultLp: PublicKey
  mintMetadata: PublicKey
  metadataProgram: PublicKey
  /** System program. */
  systemProgram: PublicKey
  /** Payer */
  payer: PublicKey
}

/** Create mint metadata account for old pools */
export function createMintMetadata(
  accounts: CreateMintMetadataAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: false },
    { pubkey: accounts.lpMint, isSigner: false, isWritable: false },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: false },
    { pubkey: accounts.mintMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
  ]
  const identifier = Buffer.from([13, 70, 168, 41, 250, 100, 148, 90])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
