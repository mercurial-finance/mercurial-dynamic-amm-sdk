import { AccountInfo, PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';
import BN from 'bn.js';
import { Amm as AmmIdl } from '../idl';
import { IdlTypes } from '@project-serum/anchor/dist/esm';

export type AmmImplementation = {
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  decimals: number;
  isStablePool: boolean;
  updateState: () => Promise<void>;
  getPoolTokenMint: () => PublicKey;
  getUserBalance: (owner: PublicKey) => Promise<BN>;
  getLpSupply: () => Promise<BN>;
  getSwapQuote: (inTokenMint: PublicKey, inAmountLamport: BN, slippage: number) => BN;
  swap: (owner: PublicKey, inTokenMint: PublicKey, inAmountLamport: BN, outAmountLamport: BN) => Promise<Transaction>;
  getDepositQuote: (tokenAInAmount: BN, tokenBInAmount: BN, isImbalance: boolean, slippage: number) => DepositQuote;
  deposit: (owner: PublicKey, tokenAInAmount: BN, tokenBInAmount: BN, poolTokenAmount: BN) => Promise<Transaction>;
  getWithdrawQuote: (lpTokenAmount: BN, slippage: number, tokenMint?: PublicKey) => WithdrawQuote;
  withdraw: (
    owner: PublicKey,
    withdrawTokenAmount: BN,
    tokenAOutAmount: BN,
    tokenBOutAmount: BN,
  ) => Promise<Transaction>;
};

export type SplInfoBuffer = {
  vaultAReserveBuffer: AccountInfo<Buffer> | null;
  vaultBReserveBuffer: AccountInfo<Buffer> | null;
  vaultALpMintBuffer: AccountInfo<Buffer> | null;
  vaultBLpMintBuffer: AccountInfo<Buffer> | null;
  poolVaultALpBuffer: AccountInfo<Buffer> | null;
  poolVaultBLpBuffer: AccountInfo<Buffer> | null;
  poolLpMintBuffer: AccountInfo<Buffer> | null;
};

export type DepositQuote = {
  poolTokenAmountOut: BN;
  tokenAInAmount: BN;
  tokenBInAmount: BN;
};

export type WithdrawQuote = {
  poolTokenAmountIn: BN;
  tokenAOutAmount: BN;
  tokenBOutAmount: BN;
};

export interface PoolFees {
  tradeFeeNumerator: BN;
  tradeFeeDenominator: BN;
  ownerTradeFeeNumerator: BN;
  ownerTradeFeeDenominator: BN;
}

export type StableSwapCurve = {
  ['stable']: {
    ['amp']: BN;
    ['tokenMultiplier']: TokenMultiplier;
    ['depeg']: Depeg;
  };
};

export type ConstantProductCurve = {
  ['constantProduct']: {};
};

export type DepegNone = {
  ['none']: {};
};

export type DepegMarinade = {
  ['marinade']: {};
};

export type DepegLido = {
  ['lido']: {};
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

// PoolState
export type PoolState = TypeDef<AmmIdl['accounts']['0'], IdlTypes<AmmIdl>>;

export type PoolInformation = {
  firstTimestamp: BN;
  currentTimestamp: BN;
  firstVirtualPrice: number;
  virtualPrice: number;
  tokenAAmount: BN;
  tokenBAmount: BN;
  apy: number;
};

export type SplInfo = {
  vaultAReserve: BN;
  vaultBReserve: BN;
  vaultALpSupply: BN;
  vaultBLpSupply: BN;
  poolVaultALp: BN;
  poolVaultBLp: BN;
  poolLpSupply: BN;
};

/** Utils */
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
