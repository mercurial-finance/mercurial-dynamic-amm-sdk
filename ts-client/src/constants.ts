import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB";

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

export interface PoolInfoItem {
  programId: PublicKey;
  lpMint: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  aVault: PublicKey;
  bVault: PublicKey;
  aVaultLp: PublicKey;
  bVaultLp: PublicKey;
  adminTokenAFee: PublicKey;
  adminTokenBFee: PublicKey;
  admin: PublicKey;
}

// Pools in mainnet
export const POOLS: {
  [x: string]: PoolInfoItem;
} = {
  USDC_USDT: {
    programId: new PublicKey(PROGRAM_ID),
    lpMint: new PublicKey("xLebAypjbaQ9tmxUKHV6DZU4mY8ATAAP2sfkNNQLXjf"),
    tokenAMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    tokenBMint: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
    aVault: new PublicKey("3ESUFCnRNgZ7Mn2mPPUMmXYaKU8jpnV9VtA17M7t2mHQ"),
    bVault: new PublicKey("5XCP3oD3JAuQyDpfBFFVUxsBxNjPQojpKuL4aVhHsDok"),
    aVaultLp: new PublicKey("24NYE3hHQyUTrHUT4n1CcVrMP9Xy3ULuT1Uurw1HDeck"),
    bVaultLp: new PublicKey("Hv5ogVb2BZCF3ET2KnaEYj2seKHN5ffGDazm6BGt5DD9"),
    adminTokenAFee: new PublicKey(
      "DAjtNiiVWM6BhuLcV2dyAaPkPmrKwwhLAX2eukgpgPP"
    ),
    adminTokenBFee: new PublicKey(
      "8XDKwNtjhD54hqVm3JLfmHYy3mZSLXV93CDECnUXiDgF"
    ),
    admin: new PublicKey("5unTfT2kssBuNvHPY6LbJfJpLqEcdMxGYLWHwShaeTLi"),
  },
  USDC_SOL: {
    programId: new PublicKey(PROGRAM_ID),
    lpMint: new PublicKey("4x76pkvNJYy9YRZM6Y6RZXJckRpsHQEWoD6sM9HEpmB"),
    tokenAMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
    tokenBMint: new PublicKey("So11111111111111111111111111111111111111112"),
    aVault: new PublicKey("3ESUFCnRNgZ7Mn2mPPUMmXYaKU8jpnV9VtA17M7t2mHQ"),
    bVault: new PublicKey("FERjPVNEa7Udq8CEv68h6tPL46Tq7ieE49HrE2wea3XT"),
    aVaultLp: new PublicKey("CNc2A5yjKUa9Rp3CVYXF9By1qvRHXMncK9S254MS9JeV"),
    bVaultLp: new PublicKey("7LHUMZd12RuanSXhXjQWPSXS6QEVQimgwxde6xYTJuA7"),
    adminTokenAFee: new PublicKey(
      "DAjtNiiVWM6BhuLcV2dyAaPkPmrKwwhLAX2eukgpgPP"
    ),
    adminTokenBFee: new PublicKey(
      "Her31Y6STaGw7Lv3X1K4ntTqi9HpDW1GZE9WStPZDA1X"
    ),
    admin: new PublicKey("5unTfT2kssBuNvHPY6LbJfJpLqEcdMxGYLWHwShaeTLi"),
  },
  SOL_STSOL: {
    programId: new PublicKey(PROGRAM_ID),
    lpMint: new PublicKey("9Gpvqcua3hLps1AhtTSVEFSgKG2Dni6yLyXtEeZGLR3y"),
    tokenAMint: new PublicKey("So11111111111111111111111111111111111111112"),
    tokenBMint: new PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"),
    aVault: new PublicKey("FERjPVNEa7Udq8CEv68h6tPL46Tq7ieE49HrE2wea3XT"),
    bVault: new PublicKey("CGY4XQq8U4VAJpbkaFPHZeXpW3o4KQ5LowVsn6hnMwKe"),
    aVaultLp: new PublicKey("BbRTJbmwBpmF8K6cbVNZLtCVzQczVdBoQS3aFZXxt1qB"),
    bVaultLp: new PublicKey("63sCov3VofCy7usVSzcdKYxzc6osp31pBY3YBT9XadVm"),
    adminTokenAFee: new PublicKey(
      "Her31Y6STaGw7Lv3X1K4ntTqi9HpDW1GZE9WStPZDA1X"
    ),
    adminTokenBFee: new PublicKey(
      "GeXRcHSyBFLpjDj9H3kZZyhRNxeWzNHHVxnjTNsZwz79"
    ),
    admin: new PublicKey("5unTfT2kssBuNvHPY6LbJfJpLqEcdMxGYLWHwShaeTLi"),
  },
};

// Pools in devnet
export const DEV_POOLS: {
  [x: string]: PoolInfoItem;
} = {
  USDT_USDC: {
    programId: new PublicKey(PROGRAM_ID),
    lpMint: new PublicKey("3A2DuLdNFyeVFVsumFEVWKFoLaeTryZ4PQSJowD38Le7"),
    tokenAMint: new PublicKey("9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9"),
    tokenBMint: new PublicKey("zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA"),
    aVault: new PublicKey("9Fze2yguDHYvX1KVfj1rgA9Q5moboWQFkw67wLGc61Z8"),
    bVault: new PublicKey("ATeQUJkKFRiWUfV76k5P5TfAyXwjWgBdck54z2sGvuNK"),
    aVaultLp: new PublicKey("8JJLKZpULia8yuXtWK8tEqaxtPuqMCkYVjkyTRW9nJ8A"),
    bVaultLp: new PublicKey("Bz112DsSnCxpbyiG8vw7WP2xK2rrfAzXPwQDvrzLSssg"),
    adminTokenAFee: new PublicKey(
      "3KNite3CFJLPmkjHyEXeUrsmumuN1EBwJtdhcE8RngyT"
    ),
    adminTokenBFee: new PublicKey(
      "68GRDKxWnJ4xFCHPqvEZKDuFHAiovFNrkuaoY4Zy3cGA"
    ),
    admin: new PublicKey("FXBXnxEEfwZJA1xnyJzKEhhJXmussKXKRdq5cAh19dbC"),
  },
  USDT_SOL: {
    programId: new PublicKey(PROGRAM_ID),
    lpMint: new PublicKey("2xSpdNRwDjkx2BJAtdu2zArWybzeEHqPqP1m63tFakNU"),
    tokenAMint: new PublicKey("9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9"),
    tokenBMint: new PublicKey("So11111111111111111111111111111111111111112"),
    aVault: new PublicKey("9Fze2yguDHYvX1KVfj1rgA9Q5moboWQFkw67wLGc61Z8"),
    bVault: new PublicKey("FERjPVNEa7Udq8CEv68h6tPL46Tq7ieE49HrE2wea3XT"),
    aVaultLp: new PublicKey("44hoWbCApNe2fZV7oTtuSNs1Nhq1KHFTqEUyVQ7GmPCa"),
    bVaultLp: new PublicKey("2AncUScc8A3g6vYfLBtMdy3N7Bp38Ze4irGqqhadcyRQ"),
    adminTokenAFee: new PublicKey(
      "3KNite3CFJLPmkjHyEXeUrsmumuN1EBwJtdhcE8RngyT"
    ),
    adminTokenBFee: new PublicKey(
      "839z5nGCCyr3CERTs1hBfy5DRVAbPcK1PopdjWFaPaYp"
    ),
    admin: new PublicKey("FXBXnxEEfwZJA1xnyJzKEhhJXmussKXKRdq5cAh19dbC"),
  },
  SOL_MSOL: {
    programId: new PublicKey(PROGRAM_ID),
    lpMint: new PublicKey("ENoFQvqrk6LnxRUmPX1cJzHyrsicJCrbZ2WEtGMY9y6N"),
    tokenAMint: new PublicKey("So11111111111111111111111111111111111111112"),
    tokenBMint: new PublicKey("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So,"),
    aVault: new PublicKey("FERjPVNEa7Udq8CEv68h6tPL46Tq7ieE49HrE2wea3XT"),
    bVault: new PublicKey("8p1VKP45hhqq5iZG5fNGoi7ucme8nFLeChoDWNy7rWFm"),
    aVaultLp: new PublicKey("Ez31MhwNEWGVWannFHvu2nS8npZ54AKw4ZvV1MFS2Gys"),
    bVaultLp: new PublicKey("DirBMuLaYGSMQMqMBwTuHh43jEQHEg4jSRWQXqbdUpiW"),
    adminTokenAFee: new PublicKey(
      "839z5nGCCyr3CERTs1hBfy5DRVAbPcK1PopdjWFaPaYp"
    ),
    adminTokenBFee: new PublicKey(
      "DE7WgHvxEVAPfV5L7Lg8p17ceXK4yRFRbD7qvZju5x7o"
    ),
    admin: new PublicKey("FXBXnxEEfwZJA1xnyJzKEhhJXmussKXKRdq5cAh19dbC"),
  },
};
