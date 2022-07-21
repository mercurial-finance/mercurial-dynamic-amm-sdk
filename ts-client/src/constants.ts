import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";

export const POOL_BASE_KEY = new PublicKey(
  "H9NnqW5Thn9dUzW3DRXe2xDhKjwZd4qbjngnZwEvnDuC"
);

export const ERROR = {
  POOL_NOT_LOAD: "Pool not loaded",
  INVALID_MINT: "Invalid mint",
};

// Extra accounts for depeg pools. Might add more addresses in the future when more different types of pools are being added
export const EXTRA_ACCOUNTS = {
  // Stake account of Marinade finance. Used to retrieve mSol virtual price
  marinade: [new PublicKey("8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC")],
  // Stake account of Solana Lido. Used to retrieve stSol virtual price
  solido: [new PublicKey("49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn")],
};
