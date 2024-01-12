import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface ConstantProductJSON {
  kind: "ConstantProduct"
}

export class ConstantProduct {
  static readonly discriminator = 0
  static readonly kind = "ConstantProduct"
  readonly discriminator = 0
  readonly kind = "ConstantProduct"

  toJSON(): ConstantProductJSON {
    return {
      kind: "ConstantProduct",
    }
  }

  toEncodable() {
    return {
      ConstantProduct: {},
    }
  }
}

export type StableFields = {
  /** Amplification coefficient */
  amp: BN
  /** Multiplier for the pool token. Used to normalized token with different decimal into the same precision. */
  tokenMultiplier: types.TokenMultiplierFields
  /** Depeg pool information. Contains functions to allow token amount to be repeg using stake / interest bearing token virtual price */
  depeg: types.DepegFields
  /** The last amp updated timestamp. Used to prevent update_curve_info called infinitely many times within a short period */
  lastAmpUpdatedTimestamp: BN
}
export type StableValue = {
  /** Amplification coefficient */
  amp: BN
  /** Multiplier for the pool token. Used to normalized token with different decimal into the same precision. */
  tokenMultiplier: types.TokenMultiplier
  /** Depeg pool information. Contains functions to allow token amount to be repeg using stake / interest bearing token virtual price */
  depeg: types.Depeg
  /** The last amp updated timestamp. Used to prevent update_curve_info called infinitely many times within a short period */
  lastAmpUpdatedTimestamp: BN
}

export interface StableJSON {
  kind: "Stable"
  value: {
    /** Amplification coefficient */
    amp: string
    /** Multiplier for the pool token. Used to normalized token with different decimal into the same precision. */
    tokenMultiplier: types.TokenMultiplierJSON
    /** Depeg pool information. Contains functions to allow token amount to be repeg using stake / interest bearing token virtual price */
    depeg: types.DepegJSON
    /** The last amp updated timestamp. Used to prevent update_curve_info called infinitely many times within a short period */
    lastAmpUpdatedTimestamp: string
  }
}

export class Stable {
  static readonly discriminator = 1
  static readonly kind = "Stable"
  readonly discriminator = 1
  readonly kind = "Stable"
  readonly value: StableValue

  constructor(value: StableFields) {
    this.value = {
      amp: value.amp,
      tokenMultiplier: new types.TokenMultiplier({ ...value.tokenMultiplier }),
      depeg: new types.Depeg({ ...value.depeg }),
      lastAmpUpdatedTimestamp: value.lastAmpUpdatedTimestamp,
    }
  }

  toJSON(): StableJSON {
    return {
      kind: "Stable",
      value: {
        amp: this.value.amp.toString(),
        tokenMultiplier: this.value.tokenMultiplier.toJSON(),
        depeg: this.value.depeg.toJSON(),
        lastAmpUpdatedTimestamp: this.value.lastAmpUpdatedTimestamp.toString(),
      },
    }
  }

  toEncodable() {
    return {
      Stable: {
        amp: this.value.amp,
        tokenMultiplier: types.TokenMultiplier.toEncodable(
          this.value.tokenMultiplier
        ),
        depeg: types.Depeg.toEncodable(this.value.depeg),
        lastAmpUpdatedTimestamp: this.value.lastAmpUpdatedTimestamp,
      },
    }
  }
}

export type NewCurveFields = {
  fieldOne: BN
  fieldTwo: BN
}
export type NewCurveValue = {
  fieldOne: BN
  fieldTwo: BN
}

export interface NewCurveJSON {
  kind: "NewCurve"
  value: {
    fieldOne: string
    fieldTwo: string
  }
}

export class NewCurve {
  static readonly discriminator = 2
  static readonly kind = "NewCurve"
  readonly discriminator = 2
  readonly kind = "NewCurve"
  readonly value: NewCurveValue

  constructor(value: NewCurveFields) {
    this.value = {
      fieldOne: value.fieldOne,
      fieldTwo: value.fieldTwo,
    }
  }

  toJSON(): NewCurveJSON {
    return {
      kind: "NewCurve",
      value: {
        fieldOne: this.value.fieldOne.toString(),
        fieldTwo: this.value.fieldTwo.toString(),
      },
    }
  }

  toEncodable() {
    return {
      NewCurve: {
        fieldOne: this.value.fieldOne,
        fieldTwo: this.value.fieldTwo,
      },
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.NewCurveTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("ConstantProduct" in obj) {
    return new ConstantProduct()
  }
  if ("Stable" in obj) {
    const val = obj["Stable"]
    return new Stable({
      amp: val["amp"],
      tokenMultiplier: types.TokenMultiplier.fromDecoded(
        val["tokenMultiplier"]
      ),
      depeg: types.Depeg.fromDecoded(val["depeg"]),
      lastAmpUpdatedTimestamp: val["lastAmpUpdatedTimestamp"],
    })
  }
  if ("NewCurve" in obj) {
    const val = obj["NewCurve"]
    return new NewCurve({
      fieldOne: val["fieldOne"],
      fieldTwo: val["fieldTwo"],
    })
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(obj: types.NewCurveTypeJSON): types.NewCurveTypeKind {
  switch (obj.kind) {
    case "ConstantProduct": {
      return new ConstantProduct()
    }
    case "Stable": {
      return new Stable({
        amp: new BN(obj.value.amp),
        tokenMultiplier: types.TokenMultiplier.fromJSON(
          obj.value.tokenMultiplier
        ),
        depeg: types.Depeg.fromJSON(obj.value.depeg),
        lastAmpUpdatedTimestamp: new BN(obj.value.lastAmpUpdatedTimestamp),
      })
    }
    case "NewCurve": {
      return new NewCurve({
        fieldOne: new BN(obj.value.fieldOne),
        fieldTwo: new BN(obj.value.fieldTwo),
      })
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "ConstantProduct"),
    borsh.struct(
      [
        borsh.u64("amp"),
        types.TokenMultiplier.layout("tokenMultiplier"),
        types.Depeg.layout("depeg"),
        borsh.u64("lastAmpUpdatedTimestamp"),
      ],
      "Stable"
    ),
    borsh.struct([borsh.u64("fieldOne"), borsh.u64("fieldTwo")], "NewCurve"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
