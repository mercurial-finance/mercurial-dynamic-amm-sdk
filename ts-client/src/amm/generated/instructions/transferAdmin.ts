import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface TransferAdminAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** Admin account. Must be owner of the pool. */
  admin: PublicKey
  /** New admin account. */
  newAdmin: PublicKey
}

/** Transfer the admin of the pool to new admin. */
export function transferAdmin(
  accounts: TransferAdminAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
    { pubkey: accounts.newAdmin, isSigner: true, isWritable: false },
  ]
  const identifier = Buffer.from([42, 242, 66, 106, 228, 10, 111, 156])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
