import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface SetPoolFeesArgs {
  fees: types.PoolFeesFields
}

export interface SetPoolFeesAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** Admin account. Must be owner of the pool. */
  admin: PublicKey
}

export const layout = borsh.struct([types.PoolFees.layout("fees")])

/** Update trading fee charged for liquidity provider, and admin. */
export function setPoolFees(
  args: SetPoolFeesArgs,
  accounts: SetPoolFeesAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
  ]
  const identifier = Buffer.from([102, 44, 158, 54, 205, 37, 126, 78])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      fees: types.PoolFees.toEncodable(args.fees),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
