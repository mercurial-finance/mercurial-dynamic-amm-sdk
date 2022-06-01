import { BN } from "@project-serum/anchor";
import { AccountLayout, MintLayout } from "@solana/spl-token";
import { AccountInfo } from "@solana/web3.js";

export class PoolSpl {
  vaultALpBalance: BN;
  vaultBLpBalance: BN;
  totalLpSupply: BN;

  constructor() {
    this.vaultALpBalance = new BN(0);
    this.vaultBLpBalance = new BN(0);
    this.totalLpSupply = new BN(0);
  }

  fromAccountsInfo(
    vaultALp: AccountInfo<Buffer>,
    vaultBLp: AccountInfo<Buffer>,
    lpMint: AccountInfo<Buffer>
  ) {
    const vaultALpInfo = AccountLayout.decode(vaultALp.data);
    const vaultBLpInfo = AccountLayout.decode(vaultBLp.data);
    const lpMintInfo = MintLayout.decode(lpMint.data);
    this.vaultALpBalance = new BN(vaultALpInfo.amount.toString());
    this.vaultBLpBalance = new BN(vaultBLpInfo.amount.toString());
    this.totalLpSupply = new BN(lpMintInfo.supply.toString());
  }
}
