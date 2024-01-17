import { VaultState } from '@mercurial-finance/vault-sdk';
import BN from 'bn.js';
import { AccountInfo } from '@solana/web3.js';
import { PoolState } from './PoolState';

export type SwapQuoteParam = {
  poolState: PoolState;
  vaultA: VaultState;
  vaultB: VaultState;
  poolVaultALp: BN;
  poolVaultBLp: BN;
  vaultALpSupply: BN;
  vaultBLpSupply: BN;
  vaultAReserve: BN;
  vaultBReserve: BN;
  currentTime: number;
  depegAccounts: Map<String, AccountInfo<Buffer>>;
};
