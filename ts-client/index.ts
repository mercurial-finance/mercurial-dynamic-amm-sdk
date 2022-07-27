import AmmImpl from './src/amm';
import {
  PROGRAM_ID,
  DEV_POOL_SOL_MSOL,
  DEV_POOL_USDT_SOL,
  DEV_POOL_USDT_USDC,
  MAIN_POOL_SOL_STSOL,
  MAIN_POOL_USDT_SOL,
  MAIN_POOL_USDT_USDC,
} from './src/amm/constants';
import { getOnchainTime } from './src/amm/utils';

export default AmmImpl;
export {
  // Utils
  getOnchainTime,
  // Constant
  PROGRAM_ID,
  DEV_POOL_SOL_MSOL,
  DEV_POOL_USDT_SOL,
  DEV_POOL_USDT_USDC,
  MAIN_POOL_SOL_STSOL,
  MAIN_POOL_USDT_SOL,
  MAIN_POOL_USDT_USDC,
};

export type { AmmImplementation, DepositQuote, WithdrawQuote, PoolState, ParsedClockState } from './src/amm/types';
