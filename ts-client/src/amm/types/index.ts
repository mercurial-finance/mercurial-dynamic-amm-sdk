import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';
import BN from 'bn.js';
import { Amm as AmmIdl } from '../idl';
import { IdlTypes } from '@project-serum/anchor/dist/esm';
import AmmImpl from '..';

export type AmmImplementation = {
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  decimals: number;
  isStablePool: boolean;
  updatePoolState: () => Promise<void>;
  getPoolTokenMint: () => PublicKey;
  getUserBalance: (owner: PublicKey) => Promise<BN>;
  getSwapQuote: (inTokenMint: PublicKey, inAmountLamport: BN, slippage?: number) => Promise<BN>;
  swap: (owner: PublicKey, inTokenMint: PublicKey, inAmountLamport: BN, outAmountLamport: BN) => Promise<Transaction>;
  getDepositQuote: (tokenAInAmount: BN, tokenBInAmount: BN, slippage?: number) => Promise<DepositQuote>;
  deposit: (owner: PublicKey, tokenAInAmount: BN, tokenBInAmount: BN, poolTokenAmount: BN) => Promise<Transaction>;
  getWithdrawQuote: (withdrawTokenAmount: BN, tokenMint?: PublicKey, slippage?: number) => Promise<WithdrawQuote>;
  withdraw: (
    owner: PublicKey,
    withdrawTokenAmount: BN,
    tokenAOutAmount: BN,
    tokenBOutAmount: BN,
  ) => Promise<Transaction>;
};

export type DepositQuote = {
  poolTokenAmountOut: BN;
  tokenAInAmount: BN;
  tokenBInAmount: BN;
};

export type WithdrawQuote = {
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

type VirtualPrice = {
  price: BN;
  timestamp: BN;
};

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
