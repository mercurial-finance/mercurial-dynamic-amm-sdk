import { Program } from '@project-serum/anchor';
import { Amm as AmmIdl } from '../idl';
import { VaultIdl } from '@mercurial-finance/vault-sdk';

/** User defined types */
export * from './AmmImplementation';
export * from './SwapQuote';
export * from './DepositQuote';
export * from './WithdrawQuote';
export * from './AccountType';
export * from './SwapResult';
export * from './PoolState';
export * from './StakePoolLayout';
export * from './ParsedClockState';
export * from './PoolInformation';
export * from './AccountsToCache';
export * from './StakePool';
export * from './AccountsInfo';
export * from './SwapQuoteParam';
export * from './CurveType';
export * from './Depeg';
export * from './TokenMultiplier';
export * from './PoolFees';
export * from './PoolType';
export * from './PoolCreatedSimulation';

/** Programs */
export type AmmProgram = Program<AmmIdl>;
export type VaultProgram = Program<VaultIdl>;
