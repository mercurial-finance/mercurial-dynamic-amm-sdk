import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface TokenMultiplierFields {
  /** Multiplier for token A of the pool. */
  tokenAMultiplier: BN
  /** Multiplier for token B of the pool. */
  tokenBMultiplier: BN
  /** Record the highest token decimal in the pool. For example, Token A is 6 decimal, token B is 9 decimal. This will save value of 9. */
  precisionFactor: number
}

export interface TokenMultiplierJSON {
  /** Multiplier for token A of the pool. */
  tokenAMultiplier: string
  /** Multiplier for token B of the pool. */
  tokenBMultiplier: string
  /** Record the highest token decimal in the pool. For example, Token A is 6 decimal, token B is 9 decimal. This will save value of 9. */
  precisionFactor: number
}

/** Multiplier for the pool token. Used to normalized token with different decimal into the same precision. */
export class TokenMultiplier {
  /** Multiplier for token A of the pool. */
  readonly tokenAMultiplier: BN
  /** Multiplier for token B of the pool. */
  readonly tokenBMultiplier: BN
  /** Record the highest token decimal in the pool. For example, Token A is 6 decimal, token B is 9 decimal. This will save value of 9. */
  readonly precisionFactor: number

  constructor(fields: TokenMultiplierFields) {
    this.tokenAMultiplier = fields.tokenAMultiplier
    this.tokenBMultiplier = fields.tokenBMultiplier
    this.precisionFactor = fields.precisionFactor
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("tokenAMultiplier"),
        borsh.u64("tokenBMultiplier"),
        borsh.u8("precisionFactor"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new TokenMultiplier({
      tokenAMultiplier: obj.tokenAMultiplier,
      tokenBMultiplier: obj.tokenBMultiplier,
      precisionFactor: obj.precisionFactor,
    })
  }

  static toEncodable(fields: TokenMultiplierFields) {
    return {
      tokenAMultiplier: fields.tokenAMultiplier,
      tokenBMultiplier: fields.tokenBMultiplier,
      precisionFactor: fields.precisionFactor,
    }
  }

  toJSON(): TokenMultiplierJSON {
    return {
      tokenAMultiplier: this.tokenAMultiplier.toString(),
      tokenBMultiplier: this.tokenBMultiplier.toString(),
      precisionFactor: this.precisionFactor,
    }
  }

  static fromJSON(obj: TokenMultiplierJSON): TokenMultiplier {
    return new TokenMultiplier({
      tokenAMultiplier: new BN(obj.tokenAMultiplier),
      tokenBMultiplier: new BN(obj.tokenBMultiplier),
      precisionFactor: obj.precisionFactor,
    })
  }

  toEncodable() {
    return TokenMultiplier.toEncodable(this)
  }
}
