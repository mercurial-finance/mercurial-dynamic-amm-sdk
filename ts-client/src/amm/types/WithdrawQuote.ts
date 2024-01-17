import BN from 'bn.js';

export type WithdrawQuote = {
  poolTokenAmountIn: BN;
  minTokenAOutAmount: BN;
  minTokenBOutAmount: BN;
  tokenAOutAmount: BN;
  tokenBOutAmount: BN;
};
