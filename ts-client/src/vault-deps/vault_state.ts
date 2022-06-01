import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export interface VaultState {
  admin: PublicKey;
  base: PublicKey;
  bumps: {
    vaultBump: number;
    tokenVaultBump: number;
  };
  enabled: 1 | 0;
  feeVault: PublicKey;
  lockedProfitTracker: {
    lastUpdatedLockedProfit: BN;
    lastReport: BN;
    lockedProfitDegradation: BN;
  };
  lpMint: PublicKey;
  operator: PublicKey;
  strategies: Array<PublicKey>;
  tokenMint: PublicKey;
  tokenVault: PublicKey;
  totalAmount: BN;
}
