import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface OverrideCurveParamArgs {
  curveType: types.CurveTypeKind
}

export interface OverrideCurveParamAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** Admin account. Must be owner of the pool. */
  admin: PublicKey
}

export const layout = borsh.struct([types.CurveType.layout("curveType")])

/**
 * Update swap curve parameters. This function do not allow update of curve type. For example: stable swap curve to constant product curve. Only supported by pool with stable swap curve.
 * Only amp is allowed to be override. The other attributes of stable swap curve will be ignored.
 */
export function overrideCurveParam(
  args: OverrideCurveParamArgs,
  accounts: OverrideCurveParamAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: false },
  ]
  const identifier = Buffer.from([98, 86, 204, 51, 94, 71, 69, 187])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      curveType: args.curveType.toEncodable(),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
