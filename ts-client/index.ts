import AmmImpl from "./src/amm";
import { PROGRAM_ID } from "./src/amm/constants";
import { getOnchainTime } from "./src/amm/utils";

export default AmmImpl;
export {
  // Constants
  PROGRAM_ID,
  // Utils
  getOnchainTime,
};

export type {
  AmmImplementation,
  PoolState,
  ParsedClockState,
} from "./src/amm/types";
