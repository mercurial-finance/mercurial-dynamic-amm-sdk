import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface SwapArgs {
  inAmount: BN
  minimumOutAmount: BN
}

export interface SwapAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** User token account. Token from this account will be transfer into the vault by the pool in exchange for another token of the pool. */
  userSourceToken: PublicKey
  /** User token account. The exchanged token will be transfer into this account from the pool. */
  userDestinationToken: PublicKey
  /** Vault account for token a. token a of the pool will be deposit / withdraw from this vault account. */
  aVault: PublicKey
  /** Vault account for token b. token b of the pool will be deposit / withdraw from this vault account. */
  bVault: PublicKey
  /** Token vault account of vault A */
  aTokenVault: PublicKey
  /** Token vault account of vault B */
  bTokenVault: PublicKey
  /** Lp token mint of vault a */
  aVaultLpMint: PublicKey
  /** Lp token mint of vault b */
  bVaultLpMint: PublicKey
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  aVaultLp: PublicKey
  /** LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  bVaultLp: PublicKey
  /** Admin fee token account. Used to receive trading fee. It's mint field must matched with user_source_token mint field. */
  adminTokenFee: PublicKey
  /** User account. Must be owner of user_source_token. */
  user: PublicKey
  /** Vault program. the pool will deposit/withdraw liquidity from the vault. */
  vaultProgram: PublicKey
  /** Token program. */
  tokenProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("inAmount"),
  borsh.u64("minimumOutAmount"),
])

/** Swap token A to B, or vice versa. An amount of trading fee will be charged for liquidity provider, and the admin of the pool. */
export function swap(
  args: SwapArgs,
  accounts: SwapAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.userSourceToken, isSigner: false, isWritable: true },
    {
      pubkey: accounts.userDestinationToken,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.aVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTokenFee, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: true, isWritable: false },
    { pubkey: accounts.vaultProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([248, 198, 158, 145, 225, 117, 135, 200])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      inAmount: args.inAmount,
      minimumOutAmount: args.minimumOutAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
