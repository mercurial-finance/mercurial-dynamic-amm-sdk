import BN from 'bn.js';

export interface StakePool {
  totalLamports: BN;
  poolTokenSupply: BN;
}
