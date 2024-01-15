import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface DepegFields {
  /** The virtual price of staking / interest bearing token */
  baseVirtualPrice: BN
  /** The virtual price of staking / interest bearing token */
  baseCacheUpdated: BN
  /** Type of the depeg pool */
  depegType: types.DepegTypeKind
}

export interface DepegJSON {
  /** The virtual price of staking / interest bearing token */
  baseVirtualPrice: string
  /** The virtual price of staking / interest bearing token */
  baseCacheUpdated: string
  /** Type of the depeg pool */
  depegType: types.DepegTypeJSON
}

/** Contains information for depeg pool */
export class Depeg {
  /** The virtual price of staking / interest bearing token */
  readonly baseVirtualPrice: BN
  /** The virtual price of staking / interest bearing token */
  readonly baseCacheUpdated: BN
  /** Type of the depeg pool */
  readonly depegType: types.DepegTypeKind

  constructor(fields: DepegFields) {
    this.baseVirtualPrice = fields.baseVirtualPrice
    this.baseCacheUpdated = fields.baseCacheUpdated
    this.depegType = fields.depegType
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("baseVirtualPrice"),
        borsh.u64("baseCacheUpdated"),
        types.DepegType.layout("depegType"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Depeg({
      baseVirtualPrice: obj.baseVirtualPrice,
      baseCacheUpdated: obj.baseCacheUpdated,
      depegType: types.DepegType.fromDecoded(obj.depegType),
    })
  }

  static toEncodable(fields: DepegFields) {
    return {
      baseVirtualPrice: fields.baseVirtualPrice,
      baseCacheUpdated: fields.baseCacheUpdated,
      depegType: fields.depegType.toEncodable(),
    }
  }

  toJSON(): DepegJSON {
    return {
      baseVirtualPrice: this.baseVirtualPrice.toString(),
      baseCacheUpdated: this.baseCacheUpdated.toString(),
      depegType: this.depegType.toJSON(),
    }
  }

  static fromJSON(obj: DepegJSON): Depeg {
    return new Depeg({
      baseVirtualPrice: new BN(obj.baseVirtualPrice),
      baseCacheUpdated: new BN(obj.baseCacheUpdated),
      depegType: types.DepegType.fromJSON(obj.depegType),
    })
  }

  toEncodable() {
    return Depeg.toEncodable(this)
  }
}
