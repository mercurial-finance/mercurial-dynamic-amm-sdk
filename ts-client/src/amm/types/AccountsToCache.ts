import { AccountInfo } from '@solana/web3.js';

export type AccountsToCache = {
  apyPdaBuffer: AccountInfo<Buffer> | null;
  poolBuffer: AccountInfo<Buffer> | null;
  vaultAPdaBuffer: AccountInfo<Buffer> | null;
  vaultBPdaBuffer: AccountInfo<Buffer> | null;
  vaultAReserveBuffer: AccountInfo<Buffer> | null;
  vaultBReserveBuffer: AccountInfo<Buffer> | null;
  vaultALpMintBuffer: AccountInfo<Buffer> | null;
  vaultBLpMintBuffer: AccountInfo<Buffer> | null;
  poolVaultALpBuffer: AccountInfo<Buffer> | null;
  poolVaultBLpBuffer: AccountInfo<Buffer> | null;
  poolLpMintBuffer: AccountInfo<Buffer> | null;
  marinadeBuffer: AccountInfo<Buffer> | null;
  solidoBuffer: AccountInfo<Buffer> | null;
  clockAccountBuffer: AccountInfo<Buffer> | null;
};