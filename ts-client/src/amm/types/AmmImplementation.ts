import { PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import BN from 'bn.js';
import { DepositQuote, SwapQuote, WithdrawQuote } from './index';

export interface AmmImplementation {
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  decimals: number;
  isStablePool: boolean;
  updateState: () => Promise<void>;
  getPoolTokenMint: () => PublicKey;
  getUserBalance: (owner: PublicKey) => Promise<BN>;
  getLpSupply: () => Promise<BN>;
  getSwapQuote: (inTokenMint: PublicKey, inAmountLamport: BN, slippage: number) => SwapQuote;
  swap: (owner: PublicKey, inTokenMint: PublicKey, inAmountLamport: BN, outAmountLamport: BN) => Promise<Transaction>;
  getDepositQuote: (tokenAInAmount: BN, tokenBInAmount: BN, isImbalance: boolean, slippage: number) => DepositQuote;
  deposit: (owner: PublicKey, tokenAInAmount: BN, tokenBInAmount: BN, poolTokenAmount: BN) => Promise<Transaction>;
  getWithdrawQuote: (lpTokenAmount: BN, slippage: number, tokenMint?: PublicKey) => WithdrawQuote;
  withdraw: (
    owner: PublicKey,
    withdrawTokenAmount: BN,
    tokenAOutAmount: BN,
    tokenBOutAmount: BN,
  ) => Promise<Transaction>;
}
