import BN from 'bn.js';
import Decimal from 'decimal.js';

export interface SwapResult {
  amountOut: BN;
  priceImpact: Decimal;
  fee: BN;
}
