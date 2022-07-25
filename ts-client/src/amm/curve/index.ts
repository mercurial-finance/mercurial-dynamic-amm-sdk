import { BN } from '@project-serum/anchor';
import { PoolFees } from '../types';

export interface SwapCurve {
  computeOutAmount(
    sourceAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN,
    tradeDirection: TradeDirection,
  ): BN;

  computeD(tokenAAmount: BN, tokenBAmount: BN): BN;

  computeInAmount(destAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, tradeDirection: TradeDirection): BN;

  computeImbalanceDeposit(
    depositAAmount: BN,
    depositBAmount: BN,
    swapTokenAAmount: BN,
    swapTokenBAmount: BN,
    lpSupply: BN,
    fees: PoolFees,
  ): BN;

  computeWithdrawOne(
    lpAmount: BN,
    lpSupply: BN,
    swapTokenAAmount: BN,
    swapTokenBAmount: BN,
    fees: PoolFees,
    tradeDirection: TradeDirection,
  ): BN;
}

export enum TradeDirection {
  AToB,
  BToA,
}

export * from './stable-swap';
export * from './constant-product';
