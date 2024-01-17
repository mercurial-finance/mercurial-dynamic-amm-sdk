import BN from 'bn.js';
import Decimal from 'decimal.js';

export type SwapQuote = {
  swapInAmount: BN;
  swapOutAmount: BN;
  minSwapOutAmount: BN;
  fee: BN;
  priceImpact: Decimal;
};
