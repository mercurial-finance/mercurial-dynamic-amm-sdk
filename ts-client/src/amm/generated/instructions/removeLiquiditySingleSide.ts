import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface RemoveLiquiditySingleSideArgs {
  poolTokenAmount: BN
  minimumOutAmount: BN
}

export interface RemoveLiquiditySingleSideAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** LP token mint of the pool */
  lpMint: PublicKey
  /** User pool lp token account. LP will be burned from this account upon success liquidity removal. */
  userPoolLp: PublicKey
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  aVaultLp: PublicKey
  /** LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  bVaultLp: PublicKey
  /** Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account. */
  aVault: PublicKey
  /** Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account. */
  bVault: PublicKey
  /** LP token mint of vault A */
  aVaultLpMint: PublicKey
  /** LP token mint of vault B */
  bVaultLpMint: PublicKey
  /** Token vault account of vault A */
  aTokenVault: PublicKey
  /** Token vault account of vault B */
  bTokenVault: PublicKey
  /** User token account to receive token upon success liquidity removal. */
  userDestinationToken: PublicKey
  /** User account. Must be owner of the user_pool_lp account. */
  user: PublicKey
  /** Vault program. The pool will deposit/withdraw liquidity from the vault. */
  vaultProgram: PublicKey
  /** Token program. */
  tokenProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("poolTokenAmount"),
  borsh.u64("minimumOutAmount"),
])

/** Withdraw only single token from the pool. Only supported by pool with stable swap curve. */
export function removeLiquiditySingleSide(
  args: RemoveLiquiditySingleSideArgs,
  accounts: RemoveLiquiditySingleSideAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.lpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.userPoolLp, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.aVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.aTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bTokenVault, isSigner: false, isWritable: true },
    {
      pubkey: accounts.userDestinationToken,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: accounts.user, isSigner: true, isWritable: false },
    { pubkey: accounts.vaultProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([84, 84, 177, 66, 254, 185, 10, 251])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      poolTokenAmount: args.poolTokenAmount,
      minimumOutAmount: args.minimumOutAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
