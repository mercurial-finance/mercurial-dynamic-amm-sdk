import { IdlAccounts } from '@project-serum/anchor';
import { Amm as AmmIdl } from '../idl';
import { PoolFees, PoolType, CurveType } from './index';

export type PoolState = Omit<IdlAccounts<AmmIdl>['pool'], 'curveType' | 'fees' | 'poolType'> & {
  curveType: CurveType;
  fees: PoolFees;
  poolType: PoolType;
};
