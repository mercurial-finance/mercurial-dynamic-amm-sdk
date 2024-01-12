import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface PaddingFields {
  /** Padding 0 */
  padding0: Array<number>
  /** Padding 1 */
  padding: Array<BN>
}

export interface PaddingJSON {
  /** Padding 0 */
  padding0: Array<number>
  /** Padding 1 */
  padding: Array<string>
}

/** Padding for future pool fields */
export class Padding {
  /** Padding 0 */
  readonly padding0: Array<number>
  /** Padding 1 */
  readonly padding: Array<BN>

  constructor(fields: PaddingFields) {
    this.padding0 = fields.padding0
    this.padding = fields.padding
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.array(borsh.u8(), 15, "padding0"),
        borsh.array(borsh.u128(), 29, "padding"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Padding({
      padding0: obj.padding0,
      padding: obj.padding,
    })
  }

  static toEncodable(fields: PaddingFields) {
    return {
      padding0: fields.padding0,
      padding: fields.padding,
    }
  }

  toJSON(): PaddingJSON {
    return {
      padding0: this.padding0,
      padding: this.padding.map((item) => item.toString()),
    }
  }

  static fromJSON(obj: PaddingJSON): Padding {
    return new Padding({
      padding0: obj.padding0,
      padding: obj.padding.map((item) => new BN(item)),
    })
  }

  toEncodable() {
    return Padding.toEncodable(this)
  }
}
