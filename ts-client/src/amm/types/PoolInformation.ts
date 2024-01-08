import BN from 'bn.js';

export type PoolInformation = {
  tokenAAmount: BN;
  tokenBAmount: BN;
  virtualPrice: number;
};
