import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface AtoBJSON {
  kind: "AtoB"
}

export class AtoB {
  static readonly discriminator = 0
  static readonly kind = "AtoB"
  readonly discriminator = 0
  readonly kind = "AtoB"

  toJSON(): AtoBJSON {
    return {
      kind: "AtoB",
    }
  }

  toEncodable() {
    return {
      AtoB: {},
    }
  }
}

export interface BtoAJSON {
  kind: "BtoA"
}

export class BtoA {
  static readonly discriminator = 1
  static readonly kind = "BtoA"
  readonly discriminator = 1
  readonly kind = "BtoA"

  toJSON(): BtoAJSON {
    return {
      kind: "BtoA",
    }
  }

  toEncodable() {
    return {
      BtoA: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.TradeDirectionKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("AtoB" in obj) {
    return new AtoB()
  }
  if ("BtoA" in obj) {
    return new BtoA()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(
  obj: types.TradeDirectionJSON
): types.TradeDirectionKind {
  switch (obj.kind) {
    case "AtoB": {
      return new AtoB()
    }
    case "BtoA": {
      return new BtoA()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "AtoB"),
    borsh.struct([], "BtoA"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
