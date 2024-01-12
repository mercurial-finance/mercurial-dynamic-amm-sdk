import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface PoolFields {
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
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  aVaultLp: PublicKey
  /** LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  bVaultLp: PublicKey
  /** "A" vault lp bump. Used to create signer seeds. */
  aVaultLpBump: number
  /** Flag to determine whether the pool is enabled, or disabled. */
  enabled: boolean
  /** Admin fee token account for token A. Used to receive trading fee. */
  adminTokenAFee: PublicKey
  /** Admin fee token account for token B. Used to receive trading fee. */
  adminTokenBFee: PublicKey
  /** Owner of the pool. */
  admin: PublicKey
  /** Store the fee charges setting. */
  fees: types.PoolFeesFields
  /** Pool type */
  poolType: types.PoolTypeKind
  /** Stake pubkey of SPL stake pool */
  stake: PublicKey
  /** Padding for future pool field */
  padding: types.PaddingFields
  /** The type of the swap curve supported by the pool. */
  curveType: types.CurveTypeKind
}

export interface PoolJSON {
  /** LP token mint of the pool */
  lpMint: string
  /** Token A mint of the pool. Eg: USDT */
  tokenAMint: string
  /** Token B mint of the pool. Eg: USDC */
  tokenBMint: string
  /** Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account. */
  aVault: string
  /** Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account. */
  bVault: string
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  aVaultLp: string
  /** LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  bVaultLp: string
  /** "A" vault lp bump. Used to create signer seeds. */
  aVaultLpBump: number
  /** Flag to determine whether the pool is enabled, or disabled. */
  enabled: boolean
  /** Admin fee token account for token A. Used to receive trading fee. */
  adminTokenAFee: string
  /** Admin fee token account for token B. Used to receive trading fee. */
  adminTokenBFee: string
  /** Owner of the pool. */
  admin: string
  /** Store the fee charges setting. */
  fees: types.PoolFeesJSON
  /** Pool type */
  poolType: types.PoolTypeJSON
  /** Stake pubkey of SPL stake pool */
  stake: string
  /** Padding for future pool field */
  padding: types.PaddingJSON
  /** The type of the swap curve supported by the pool. */
  curveType: types.CurveTypeJSON
}

/** State of pool account */
export class Pool {
  /** LP token mint of the pool */
  readonly lpMint: PublicKey
  /** Token A mint of the pool. Eg: USDT */
  readonly tokenAMint: PublicKey
  /** Token B mint of the pool. Eg: USDC */
  readonly tokenBMint: PublicKey
  /** Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account. */
  readonly aVault: PublicKey
  /** Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account. */
  readonly bVault: PublicKey
  /** LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  readonly aVaultLp: PublicKey
  /** LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault. */
  readonly bVaultLp: PublicKey
  /** "A" vault lp bump. Used to create signer seeds. */
  readonly aVaultLpBump: number
  /** Flag to determine whether the pool is enabled, or disabled. */
  readonly enabled: boolean
  /** Admin fee token account for token A. Used to receive trading fee. */
  readonly adminTokenAFee: PublicKey
  /** Admin fee token account for token B. Used to receive trading fee. */
  readonly adminTokenBFee: PublicKey
  /** Owner of the pool. */
  readonly admin: PublicKey
  /** Store the fee charges setting. */
  readonly fees: types.PoolFees
  /** Pool type */
  readonly poolType: types.PoolTypeKind
  /** Stake pubkey of SPL stake pool */
  readonly stake: PublicKey
  /** Padding for future pool field */
  readonly padding: types.Padding
  /** The type of the swap curve supported by the pool. */
  readonly curveType: types.CurveTypeKind

  static readonly discriminator = Buffer.from([
    241, 154, 109, 4, 17, 177, 109, 188,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("lpMint"),
    borsh.publicKey("tokenAMint"),
    borsh.publicKey("tokenBMint"),
    borsh.publicKey("aVault"),
    borsh.publicKey("bVault"),
    borsh.publicKey("aVaultLp"),
    borsh.publicKey("bVaultLp"),
    borsh.u8("aVaultLpBump"),
    borsh.bool("enabled"),
    borsh.publicKey("adminTokenAFee"),
    borsh.publicKey("adminTokenBFee"),
    borsh.publicKey("admin"),
    types.PoolFees.layout("fees"),
    types.PoolType.layout("poolType"),
    borsh.publicKey("stake"),
    types.Padding.layout("padding"),
    types.CurveType.layout("curveType"),
  ])

  constructor(fields: PoolFields) {
    this.lpMint = fields.lpMint
    this.tokenAMint = fields.tokenAMint
    this.tokenBMint = fields.tokenBMint
    this.aVault = fields.aVault
    this.bVault = fields.bVault
    this.aVaultLp = fields.aVaultLp
    this.bVaultLp = fields.bVaultLp
    this.aVaultLpBump = fields.aVaultLpBump
    this.enabled = fields.enabled
    this.adminTokenAFee = fields.adminTokenAFee
    this.adminTokenBFee = fields.adminTokenBFee
    this.admin = fields.admin
    this.fees = new types.PoolFees({ ...fields.fees })
    this.poolType = fields.poolType
    this.stake = fields.stake
    this.padding = new types.Padding({ ...fields.padding })
    this.curveType = fields.curveType
  }

  static async fetch(
    c: Connection,
    address: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): Promise<Pool | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(programId)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[],
    programId: PublicKey = PROGRAM_ID
  ): Promise<Array<Pool | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(programId)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): Pool {
    if (!data.slice(0, 8).equals(Pool.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Pool.layout.decode(data.slice(8))

    return new Pool({
      lpMint: dec.lpMint,
      tokenAMint: dec.tokenAMint,
      tokenBMint: dec.tokenBMint,
      aVault: dec.aVault,
      bVault: dec.bVault,
      aVaultLp: dec.aVaultLp,
      bVaultLp: dec.bVaultLp,
      aVaultLpBump: dec.aVaultLpBump,
      enabled: dec.enabled,
      adminTokenAFee: dec.adminTokenAFee,
      adminTokenBFee: dec.adminTokenBFee,
      admin: dec.admin,
      fees: types.PoolFees.fromDecoded(dec.fees),
      poolType: types.PoolType.fromDecoded(dec.poolType),
      stake: dec.stake,
      padding: types.Padding.fromDecoded(dec.padding),
      curveType: types.CurveType.fromDecoded(dec.curveType),
    })
  }

  toJSON(): PoolJSON {
    return {
      lpMint: this.lpMint.toString(),
      tokenAMint: this.tokenAMint.toString(),
      tokenBMint: this.tokenBMint.toString(),
      aVault: this.aVault.toString(),
      bVault: this.bVault.toString(),
      aVaultLp: this.aVaultLp.toString(),
      bVaultLp: this.bVaultLp.toString(),
      aVaultLpBump: this.aVaultLpBump,
      enabled: this.enabled,
      adminTokenAFee: this.adminTokenAFee.toString(),
      adminTokenBFee: this.adminTokenBFee.toString(),
      admin: this.admin.toString(),
      fees: this.fees.toJSON(),
      poolType: this.poolType.toJSON(),
      stake: this.stake.toString(),
      padding: this.padding.toJSON(),
      curveType: this.curveType.toJSON(),
    }
  }

  static fromJSON(obj: PoolJSON): Pool {
    return new Pool({
      lpMint: new PublicKey(obj.lpMint),
      tokenAMint: new PublicKey(obj.tokenAMint),
      tokenBMint: new PublicKey(obj.tokenBMint),
      aVault: new PublicKey(obj.aVault),
      bVault: new PublicKey(obj.bVault),
      aVaultLp: new PublicKey(obj.aVaultLp),
      bVaultLp: new PublicKey(obj.bVaultLp),
      aVaultLpBump: obj.aVaultLpBump,
      enabled: obj.enabled,
      adminTokenAFee: new PublicKey(obj.adminTokenAFee),
      adminTokenBFee: new PublicKey(obj.adminTokenBFee),
      admin: new PublicKey(obj.admin),
      fees: types.PoolFees.fromJSON(obj.fees),
      poolType: types.PoolType.fromJSON(obj.poolType),
      stake: new PublicKey(obj.stake),
      padding: types.Padding.fromJSON(obj.padding),
      curveType: types.CurveType.fromJSON(obj.curveType),
    })
  }
}
