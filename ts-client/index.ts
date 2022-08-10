import AmmImpl from './src/amm';
import { StableSwap, ConstantProductSwap } from './src/amm/curve';
import { PROGRAM_ID, MAINNET_POOL, DEVNET_POOL } from './src/amm/constants';
import {
  getOnchainTime,
  calculateMaxSwapOutAmount,
  calculateSwapQuote,
  calculatePoolInfo,
  getDepegAccounts,
} from './src/amm/utils';
import { Amm, IDL as AmmIdl } from './src/amm/idl';
import { Vault, IDL as VaultIdl } from './src/amm/vault-idl';

export default AmmImpl;
export {
  // Classes
  ConstantProductSwap,
  StableSwap,
  // Utils
  getDepegAccounts,
  getOnchainTime,
  calculateMaxSwapOutAmount,
  calculateSwapQuote,
  calculatePoolInfo,
  // Constant
  PROGRAM_ID,
  MAINNET_POOL,
  DEVNET_POOL,
  // IDL
  AmmIdl,
  VaultIdl,
};

export type {
  AmmImplementation,
  DepositQuote,
  WithdrawQuote,
  PoolState,
  PoolInformation,
  ParsedClockState,
  ConstantProductCurve,
  StableSwapCurve,
  SwapQuoteParam,
} from './src/amm/types';
export type { VaultState } from '@mercurial-finance/vault-sdk';
export type { Amm, Vault };
