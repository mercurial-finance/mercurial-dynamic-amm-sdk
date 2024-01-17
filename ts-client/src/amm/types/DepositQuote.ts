import BN from 'bn.js';

export type DepositQuote = {
  poolTokenAmountOut: BN;
  minPoolTokenAmountOut: BN;
  tokenAInAmount: BN;
  tokenBInAmount: BN;
};
