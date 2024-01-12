import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface NoneJSON {
  kind: "None"
}

export class None {
  static readonly discriminator = 0
  static readonly kind = "None"
  readonly discriminator = 0
  readonly kind = "None"

  toJSON(): NoneJSON {
    return {
      kind: "None",
    }
  }

  toEncodable() {
    return {
      None: {},
    }
  }
}

export interface MarinadeJSON {
  kind: "Marinade"
}

export class Marinade {
  static readonly discriminator = 1
  static readonly kind = "Marinade"
  readonly discriminator = 1
  readonly kind = "Marinade"

  toJSON(): MarinadeJSON {
    return {
      kind: "Marinade",
    }
  }

  toEncodable() {
    return {
      Marinade: {},
    }
  }
}

export interface LidoJSON {
  kind: "Lido"
}

export class Lido {
  static readonly discriminator = 2
  static readonly kind = "Lido"
  readonly discriminator = 2
  readonly kind = "Lido"

  toJSON(): LidoJSON {
    return {
      kind: "Lido",
    }
  }

  toEncodable() {
    return {
      Lido: {},
    }
  }
}

export interface SplStakeJSON {
  kind: "SplStake"
}

export class SplStake {
  static readonly discriminator = 3
  static readonly kind = "SplStake"
  readonly discriminator = 3
  readonly kind = "SplStake"

  toJSON(): SplStakeJSON {
    return {
      kind: "SplStake",
    }
  }

  toEncodable() {
    return {
      SplStake: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.DepegTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("None" in obj) {
    return new None()
  }
  if ("Marinade" in obj) {
    return new Marinade()
  }
  if ("Lido" in obj) {
    return new Lido()
  }
  if ("SplStake" in obj) {
    return new SplStake()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(obj: types.DepegTypeJSON): types.DepegTypeKind {
  switch (obj.kind) {
    case "None": {
      return new None()
    }
    case "Marinade": {
      return new Marinade()
    }
    case "Lido": {
      return new Lido()
    }
    case "SplStake": {
      return new SplStake()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "None"),
    borsh.struct([], "Marinade"),
    borsh.struct([], "Lido"),
    borsh.struct([], "SplStake"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
