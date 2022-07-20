import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface PoolFees {
  tradeFeeNumerator: BN;
  tradeFeeDenominator: BN;
  ownerTradeFeeNumerator: BN;
  ownerTradeFeeDenominator: BN;
}

export type CurveType = StableSwapCurve | ConstantProductCurve;

export const encodeCurveType = (curveType: CurveType) => {
  if ("stable" in curveType) {
    return 1;
  } else {
    return 0;
  }
};

export type StableSwapCurve = {
  ["stable"]: {
    ["amp"]: BN;
    ["tokenMultiplier"]: TokenMultiplier;
    ["depeg"]: Depeg;
  };
};

export type ConstantProductCurve = {
  ["constantProduct"]: {};
};

export type DepegNone = {
  ["none"]: {};
};

export type DepegMarinade = {
  ["marinade"]: {};
};

export type DepegLido = {
  ["lido"]: {};
};

export type DepegType = DepegNone | DepegMarinade | DepegLido;

export type Depeg = {
  baseVirtualPrice: BN;
  baseCacheUpdated: BN;
  depegType: DepegType;
};

export interface TokenMultiplier {
  tokenAMultiplier: BN;
  tokenBMultiplier: BN;
  precisionFactor: number;
}

export interface VirtualPrice {
  price: BN;
  timestamp: BN;
}

export interface SnapShot {
  pointer: BN;
  virtualPrices: [VirtualPrice];
}

export interface PoolState {
  lpMint: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  aVault: PublicKey;
  bVault: PublicKey;
  aVaultLp: PublicKey;
  bVaultLp: PublicKey;
  aVaultLpBump: number;
  enabled: boolean;
  adminTokenAFee: PublicKey;
  adminTokenBFee: PublicKey;
  admin: PublicKey;
  fees: PoolFees;
  padding: any;
  curveType: CurveType;
}

export interface ParsedClockState {
  info: {
    epoch: number;
    epochStartTimestamp: number;
    leaderScheduleEpoch: number;
    slot: number;
    unixTimestamp: number;
  };
  type: string;
  program: string;
  space: number;
}
