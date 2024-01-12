import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface AddBalanceLiquidityArgs {
  poolTokenAmount: BN
  maximumTokenAAmount: BN
  maximumTokenBAmount: BN
}

export interface AddBalanceLiquidityAccounts {
  /** Pool account (PDA) */
  pool: PublicKey
  /** LP token mint of the pool */
  lpMint: PublicKey
  /** user pool lp token account. lp will be burned from this account upon success liquidity removal. */
  userPoolLp: PublicKey
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
  /** Token vault account of vault A */
  aTokenVault: PublicKey
  /** Token vault account of vault B */
  bTokenVault: PublicKey
  /** User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account. */
  userAToken: PublicKey
  /** User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account. */
  userBToken: PublicKey
  /** User account. Must be owner of user_a_token, and user_b_token. */
  user: PublicKey
  /** Vault program. the pool will deposit/withdraw liquidity from the vault. */
  vaultProgram: PublicKey
  /** Token program. */
  tokenProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u64("poolTokenAmount"),
  borsh.u64("maximumTokenAAmount"),
  borsh.u64("maximumTokenBAmount"),
])

/** Deposit tokens to the pool in a balanced ratio. */
export function addBalanceLiquidity(
  args: AddBalanceLiquidityArgs,
  accounts: AddBalanceLiquidityAccounts,
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
    { pubkey: accounts.userAToken, isSigner: false, isWritable: true },
    { pubkey: accounts.userBToken, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: true, isWritable: false },
    { pubkey: accounts.vaultProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([168, 227, 50, 62, 189, 171, 84, 176])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      poolTokenAmount: args.poolTokenAmount,
      maximumTokenAAmount: args.maximumTokenAAmount,
      maximumTokenBAmount: args.maximumTokenBAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
