import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializePermissionlessPoolArgs {
  curveType: types.CurveTypeKind
  tokenAAmount: BN
  tokenBAmount: BN
}

export interface InitializePermissionlessPoolAccounts {
  /** Pool account (PDA address) */
  pool: PublicKey
  /** LP token mint of the pool */
  lpMint: PublicKey
  /** Token A mint of the pool. Eg: USDT */
  tokenAMint: PublicKey
  /** Token B mint of the pool. Eg: USDC */
  tokenBMint: PublicKey
  /** Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account. */
  aVault: PublicKey
  /** Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account. */
  bVault: PublicKey
  /** Token vault account of vault A */
  aTokenVault: PublicKey
  /** Token vault account of vault B */
  bTokenVault: PublicKey
  /** LP token mint of vault A */
  aVaultLpMint: PublicKey
  /** LP token mint of vault B */
  bVaultLpMint: PublicKey
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  aVaultLp: PublicKey
  /** LP token account of vault B. Used to receive/burn vault LP upon deposit/withdraw from the vault. */
  bVaultLp: PublicKey
  /** Payer token account for pool token A mint. Used to bootstrap the pool with initial liquidity. */
  payerTokenA: PublicKey
  /** Admin token account for pool token B mint. Used to bootstrap the pool with initial liquidity. */
  payerTokenB: PublicKey
  payerPoolLp: PublicKey
  /** Admin fee token account for token A. Used to receive trading fee. */
  adminTokenAFee: PublicKey
  /** Admin fee token account for token B. Used to receive trading fee. */
  adminTokenBFee: PublicKey
  /** Admin account. This account will be the admin of the pool, and the payer for PDA during initialize pool. */
  payer: PublicKey
  feeOwner: PublicKey
  /** Rent account. */
  rent: PublicKey
  mintMetadata: PublicKey
  metadataProgram: PublicKey
  /** Vault program. The pool will deposit/withdraw liquidity from the vault. */
  vaultProgram: PublicKey
  /** Token program. */
  tokenProgram: PublicKey
  /** Associated token program. */
  associatedTokenProgram: PublicKey
  /** System program. */
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  types.CurveType.layout("curveType"),
  borsh.u64("tokenAAmount"),
  borsh.u64("tokenBAmount"),
])

/** Initialize a new permissionless pool. */
export function initializePermissionlessPool(
  args: InitializePermissionlessPoolArgs,
  accounts: InitializePermissionlessPoolAccounts,
  programId: PublicKey = PROGRAM_ID
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.pool, isSigner: false, isWritable: true },
    { pubkey: accounts.lpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenAMint, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenBMint, isSigner: false, isWritable: false },
    { pubkey: accounts.aVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.bTokenVault, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLpMint, isSigner: false, isWritable: true },
    { pubkey: accounts.aVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.bVaultLp, isSigner: false, isWritable: true },
    { pubkey: accounts.payerTokenA, isSigner: false, isWritable: true },
    { pubkey: accounts.payerTokenB, isSigner: false, isWritable: true },
    { pubkey: accounts.payerPoolLp, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTokenAFee, isSigner: false, isWritable: true },
    { pubkey: accounts.adminTokenBFee, isSigner: false, isWritable: true },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.feeOwner, isSigner: false, isWritable: false },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.mintMetadata, isSigner: false, isWritable: true },
    { pubkey: accounts.metadataProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.vaultProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    {
      pubkey: accounts.associatedTokenProgram,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([118, 173, 41, 157, 173, 72, 97, 103])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      curveType: args.curveType.toEncodable(),
      tokenAAmount: args.tokenAAmount,
      tokenBAmount: args.tokenBAmount,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId, data })
  return ix
}
