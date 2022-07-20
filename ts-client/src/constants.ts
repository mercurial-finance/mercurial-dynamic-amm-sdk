import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";

export const POOL_BASE_KEY = new PublicKey(
  "H9NnqW5Thn9dUzW3DRXe2xDhKjwZd4qbjngnZwEvnDuC"
);

export const ERROR = {
  POOL_NOT_LOAD: "Pool not loaded",
  INVALID_MINT: "Invalid mint",
};

export const EXTRA_ACCOUNTS = {
  marinade: [new PublicKey("8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC")],
  solido: [new PublicKey("49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn")],
};
