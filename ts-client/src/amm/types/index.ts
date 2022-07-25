import { PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import { TypeDef } from '@project-serum/anchor/dist/cjs/program/namespace/types';
import BN from 'bn.js';
import { Amm as AmmIdl } from '../idl';
import { IdlTypes } from '@project-serum/anchor/dist/esm';

export type AmmImplementation = {
  getTokenA: () => TokenInfo;
  getTokenB: () => TokenInfo;
  getPoolTokenMint: () => PublicKey;
  getLPBalance: (owner: PublicKey) => Promise<BN>;
  getLPSupply: () => Promise<BN>;
  getQuote: (inTokenMint: PublicKey, inAmountLamport: BN) => Promise<BN>;
  swap: (owner: PublicKey, inputToken: PublicKey, inAmountLamport: BN, outAmountLamport: BN) => Promise<Transaction>;
  getDepositQuote: (maxTokenAIn: BN, maxTokenBIn: BN, slippage?: BN) => Promise<DepositQuote>;
  deposit: (owner: PublicKey, maxTokenAIn: BN, maxTokenBIn: BN, minPoolTokenAmountOut: BN) => Promise<Transaction>;
  getWithdrawQuote: (withdrawTokenAmount: BN, withdrawTokenMint: PublicKey, slippage?: BN) => Promise<WithdrawQuote>;
  withdraw: (owner: PublicKey, poolTokenAmountIn: BN, minTokenAOut: BN, minTokenBOut: BN) => Promise<Transaction>;
};

export type DepositQuote = {
  poolTokenAmountOut: BN;
  maxTokenAIn: BN;
  maxTokenBIn: BN;
};

export type WithdrawQuote = {
  minTokenAOut: BN;
  minTokenBOut: BN;
  poolTokenAmountIn: BN;
};

export type Quote = {
  getRate: () => BN;
  getLPFees: () => BN;
  getNetworkFees: () => BN;
  getPriceImpact: () => BN;
  getExpectedOutputAmount: () => BN;
  getMinOutputAmount: () => BN;
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
