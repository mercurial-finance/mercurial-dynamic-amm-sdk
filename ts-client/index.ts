import { VaultIdl as Vault, IDL as VaultIdl } from '@mercurial-finance/vault-sdk';
import AmmImpl from './src/amm';
import { StableSwap, ConstantProductSwap } from './src/amm/curve';
import { PROGRAM_ID, MAINNET_POOL, DEVNET_POOL, CURVE_TYPE_ACCOUNTS } from './src/amm/constants';
import {
  getOnchainTime,
  calculateMaxSwapOutAmount,
  calculateSwapQuote,
  calculatePoolInfo,
  getDepegAccounts,
  checkPoolExists,
  getTokensMintFromPoolAddress,
} from './src/amm/utils';
import { Amm, IDL as AmmIdl } from './src/amm/idl';

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
  checkPoolExists,
  getTokensMintFromPoolAddress,
  // Constant
  PROGRAM_ID,
  MAINNET_POOL,
  DEVNET_POOL,
  CURVE_TYPE_ACCOUNTS,
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
