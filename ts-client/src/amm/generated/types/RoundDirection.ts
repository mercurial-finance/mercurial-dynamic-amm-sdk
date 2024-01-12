import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface FloorJSON {
  kind: "Floor"
}

export class Floor {
  static readonly discriminator = 0
  static readonly kind = "Floor"
  readonly discriminator = 0
  readonly kind = "Floor"

  toJSON(): FloorJSON {
    return {
      kind: "Floor",
    }
  }

  toEncodable() {
    return {
      Floor: {},
    }
  }
}

export interface CeilingJSON {
  kind: "Ceiling"
}

export class Ceiling {
  static readonly discriminator = 1
  static readonly kind = "Ceiling"
  readonly discriminator = 1
  readonly kind = "Ceiling"

  toJSON(): CeilingJSON {
    return {
      kind: "Ceiling",
    }
  }

  toEncodable() {
    return {
      Ceiling: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.RoundDirectionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("Floor" in obj) {
    return new Floor()
  }
  if ("Ceiling" in obj) {
    return new Ceiling()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(
  obj: types.RoundDirectionJSON
): types.RoundDirectionKind {
  switch (obj.kind) {
    case "Floor": {
      return new Floor()
    }
    case "Ceiling": {
      return new Ceiling()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Floor"),
    borsh.struct([], "Ceiling"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
