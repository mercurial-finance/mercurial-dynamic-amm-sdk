import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh"

export interface PermissionedJSON {
  kind: "Permissioned"
}

export class Permissioned {
  static readonly discriminator = 0
  static readonly kind = "Permissioned"
  readonly discriminator = 0
  readonly kind = "Permissioned"

  toJSON(): PermissionedJSON {
    return {
      kind: "Permissioned",
    }
  }

  toEncodable() {
    return {
      Permissioned: {},
    }
  }
}

export interface PermissionlessJSON {
  kind: "Permissionless"
}

export class Permissionless {
  static readonly discriminator = 1
  static readonly kind = "Permissionless"
  readonly discriminator = 1
  readonly kind = "Permissionless"

  toJSON(): PermissionlessJSON {
    return {
      kind: "Permissionless",
    }
  }

  toEncodable() {
    return {
      Permissionless: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.PoolTypeKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("Permissioned" in obj) {
    return new Permissioned()
  }
  if ("Permissionless" in obj) {
    return new Permissionless()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(obj: types.PoolTypeJSON): types.PoolTypeKind {
  switch (obj.kind) {
    case "Permissioned": {
      return new Permissioned()
    }
    case "Permissionless": {
      return new Permissionless()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Permissioned"),
    borsh.struct([], "Permissionless"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
