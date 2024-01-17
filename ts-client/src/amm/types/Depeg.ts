import { IdlTypes } from '@project-serum/anchor';
import { Amm } from '../idl';

export type DepegNone = {
  none: {};
};

export type DepegMarinade = {
  marinade: {};
};

export type DepegSplStake = {
  splStake: {};
};

export type DepegLido = {
  lido: {};
};

export type DepegType = DepegNone | DepegMarinade | DepegLido | DepegSplStake;

export type Depeg = Omit<IdlTypes<Amm>['Depeg'], 'depegType'> & { depegType: DepegType };
