import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface EnableOrDisablePoolArgs {
  enable: boolean
}

export interface EnableOrDisablePoolAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** Admin account. Must be owner of the pool. */
  admin: PublicKey
}

export const layout = borsh.struct([borsh.bool("enable")])

/** Enable or disable a pool. A disabled pool allow only remove balanced liquidity operation. */
export function enableOrDisablePool(
  args: EnableOrDisablePoolArgs,
  accounts: EnableOrDisablePoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
  ]
  const identifier = Buffer.from([128, 6, 228, 131, 55, 161, 52, 169])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      enable: args.enable,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
