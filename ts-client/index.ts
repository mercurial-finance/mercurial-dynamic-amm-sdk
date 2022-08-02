import AmmImpl from './src/amm';
import { PROGRAM_ID, MAINNET_POOL, DEVNET_POOL } from './src/amm/constants';
import {
  getOnchainTime,
  calculateMaxSwapOutAmount,
  calculateSwapQuote,
  computeAndUpdatePoolInfo,
} from './src/amm/utils';

export default AmmImpl;
export {
  // Utils
  getOnchainTime,
  calculateMaxSwapOutAmount,
  calculateSwapQuote,
  computeAndUpdatePoolInfo,
  // Constant
  PROGRAM_ID,
  MAINNET_POOL,
  DEVNET_POOL,
};

export type { AmmImplementation, DepositQuote, WithdrawQuote, PoolState, ParsedClockState } from './src/amm/types';
