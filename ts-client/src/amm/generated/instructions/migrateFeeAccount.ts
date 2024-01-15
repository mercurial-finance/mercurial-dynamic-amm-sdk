import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface MigrateFeeAccountAccounts {
  /** Pool account */
  pool: PublicKey
  /** A vault LP token account of the pool. */
  aVaultLp: PublicKey
  /** Admin fee token account for token A. Used to receive trading fee. */
  adminTokenAFee: PublicKey
  /** Admin fee token account for token B. Used to receive trading fee. */
  adminTokenBFee: PublicKey
  /** Token A mint */
  tokenAMint: PublicKey
  /** Token B mint */
  tokenBMint: PublicKey
  /** Token fee account. Controlled by pool a_vault_lp PDA. */
  newAdminTokenAFee: PublicKey
  /** Token fee account. Controlled by pool a_vault_lp PDA. */
  newAdminTokenBFee: PublicKey
  /** Admin account. Must be owner of the pool. */
  admin: PublicKey
  /** Treasury token a fee ATA. */
  treasuryTokenAFee: PublicKey
  /** Treasury token b fee ATA. */
  treasuryTokenBFee: PublicKey
  /** Treasury signer */
  treasury: PublicKey
  /** Token program. */
  tokenProgram: PublicKey
  /** System program. */
  systemProgram: PublicKey
}

/** Migrate old token fee owner to PDA */
export function migrateFeeAccount(
  accounts: MigrateFeeAccountAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: false },
    { pubkey: accounts.adminTokenAFee, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTokenBFee, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenAMint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenBMint, isSigner: false, isWritable: false },
    { pubkey: accounts.newAdminTokenAFee, isSigner: false, isWritable: true },
    { pubkey: accounts.newAdminTokenBFee, isSigner: false, isWritable: true },
    { pubkey: accounts.admin, isSigner: true, isWritable: true },
    { pubkey: accounts.treasuryTokenAFee, isSigner: false, isWritable: true },
    { pubkey: accounts.treasuryTokenBFee, isSigner: false, isWritable: true },
    { pubkey: accounts.treasury, isSigner: true, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([223, 60, 126, 177, 109, 146, 65, 81])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
