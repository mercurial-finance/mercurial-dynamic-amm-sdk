import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface PoolFeesFields {
  /**
   * Trade fees are extra token amounts that are held inside the token
   * accounts during a trade, making the value of liquidity tokens rise.
   * Trade fee numerator
   */
  tradeFeeNumerator: BN
  /** Trade fee denominator */
  tradeFeeDenominator: BN
  /**
   * Owner trading fees are extra token amounts that are held inside the token
   * accounts during a trade, with the equivalent in pool tokens minted to
   * the owner of the program.
   * Owner trade fee numerator
   */
  ownerTradeFeeNumerator: BN
  /** Owner trade fee denominator */
  ownerTradeFeeDenominator: BN
}

export interface PoolFeesJSON {
  /**
   * Trade fees are extra token amounts that are held inside the token
   * accounts during a trade, making the value of liquidity tokens rise.
   * Trade fee numerator
   */
  tradeFeeNumerator: string
  /** Trade fee denominator */
  tradeFeeDenominator: string
  /**
   * Owner trading fees are extra token amounts that are held inside the token
   * accounts during a trade, with the equivalent in pool tokens minted to
   * the owner of the program.
   * Owner trade fee numerator
   */
  ownerTradeFeeNumerator: string
  /** Owner trade fee denominator */
  ownerTradeFeeDenominator: string
}

/** Information regarding fee charges */
export class PoolFees {
  /**
   * Trade fees are extra token amounts that are held inside the token
   * accounts during a trade, making the value of liquidity tokens rise.
   * Trade fee numerator
   */
  readonly tradeFeeNumerator: BN
  /** Trade fee denominator */
  readonly tradeFeeDenominator: BN
  /**
   * Owner trading fees are extra token amounts that are held inside the token
   * accounts during a trade, with the equivalent in pool tokens minted to
   * the owner of the program.
   * Owner trade fee numerator
   */
  readonly ownerTradeFeeNumerator: BN
  /** Owner trade fee denominator */
  readonly ownerTradeFeeDenominator: BN

  constructor(fields: PoolFeesFields) {
    this.tradeFeeNumerator = fields.tradeFeeNumerator
    this.tradeFeeDenominator = fields.tradeFeeDenominator
    this.ownerTradeFeeNumerator = fields.ownerTradeFeeNumerator
    this.ownerTradeFeeDenominator = fields.ownerTradeFeeDenominator
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("tradeFeeNumerator"),
        borsh.u64("tradeFeeDenominator"),
        borsh.u64("ownerTradeFeeNumerator"),
        borsh.u64("ownerTradeFeeDenominator"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new PoolFees({
      tradeFeeNumerator: obj.tradeFeeNumerator,
      tradeFeeDenominator: obj.tradeFeeDenominator,
      ownerTradeFeeNumerator: obj.ownerTradeFeeNumerator,
      ownerTradeFeeDenominator: obj.ownerTradeFeeDenominator,
    })
  }

  static toEncodable(fields: PoolFeesFields) {
    return {
      tradeFeeNumerator: fields.tradeFeeNumerator,
      tradeFeeDenominator: fields.tradeFeeDenominator,
      ownerTradeFeeNumerator: fields.ownerTradeFeeNumerator,
      ownerTradeFeeDenominator: fields.ownerTradeFeeDenominator,
    }
  }

  toJSON(): PoolFeesJSON {
    return {
      tradeFeeNumerator: this.tradeFeeNumerator.toString(),
      tradeFeeDenominator: this.tradeFeeDenominator.toString(),
      ownerTradeFeeNumerator: this.ownerTradeFeeNumerator.toString(),
      ownerTradeFeeDenominator: this.ownerTradeFeeDenominator.toString(),
    }
  }

  static fromJSON(obj: PoolFeesJSON): PoolFees {
    return new PoolFees({
      tradeFeeNumerator: new BN(obj.tradeFeeNumerator),
      tradeFeeDenominator: new BN(obj.tradeFeeDenominator),
      ownerTradeFeeNumerator: new BN(obj.ownerTradeFeeNumerator),
      ownerTradeFeeDenominator: new BN(obj.ownerTradeFeeDenominator),
    })
  }

  toEncodable() {
    return PoolFees.toEncodable(this)
  }
}
