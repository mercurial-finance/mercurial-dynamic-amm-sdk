import BN from 'bn.js';
import { TokenMultiplier } from './TokenMultiplier';
import { Depeg } from './Depeg';

export type CurveType = ConstantProductCurve | StableSwapCurve;

export type StableSwapCurve = {
  stable: {
    amp: BN;
    tokenMultiplier: TokenMultiplier;
    depeg: Depeg;
    lastAmpUpdatedTimestamp: BN
  };
};

export type ConstantProductCurve = {
  constantProduct: {};
};