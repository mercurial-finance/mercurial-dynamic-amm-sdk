import { BN } from "@project-serum/anchor";
import { AccountLayout, MintLayout } from "@solana/spl-token";
import { AccountInfo } from "@solana/web3.js";

export class VaultSpl {
  reserveBalance: BN;
  totalLpSupply: BN;

  constructor() {
    this.reserveBalance = new BN(0);
    this.totalLpSupply = new BN(0);
  }

  fromAccountsInfo(
    tokenVault: AccountInfo<Buffer>,
    lpMint: AccountInfo<Buffer>
  ) {
    const reserveInfo = AccountLayout.decode(tokenVault.data);
    const lpMintInfo = MintLayout.decode(lpMint.data);
    this.reserveBalance = new BN(reserveInfo.amount.toString());
    this.totalLpSupply = new BN(lpMintInfo.supply.toString());
  }
}
