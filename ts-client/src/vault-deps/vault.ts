import { AnchorProvider, Program, Wallet } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";
import { IDL, Vault as VaultIdl } from "./idl/vault";
import { getVaultPdas } from "./utils";
import { VaultState } from "./vault_state";

export type VaultProgram = Program<VaultIdl>;

const LOCKED_PROFIT_DEGRATION_DENUMERATOR = 1_000_000_000_000;

class Vault {
  private program: VaultProgram;
  public state: VaultState | undefined;

  constructor(wallet: Wallet, public connection: Connection) {
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "processed",
    });
    this.program = new Program<VaultIdl>(IDL as VaultIdl, PROGRAM_ID, provider);
  }

  async getVaultStateByMint(tokenMint: PublicKey) {
    const { vaultPda } = await getVaultPdas(tokenMint, this.program.programId);
    const vaultState = (await this.program.account.vault.fetchNullable(
      vaultPda
    )) as VaultState;

    if (!vaultState) {
      throw "Cannot get vault state";
    }

    this.state = vaultState;
  }

  calculateLockedProfit(currentTime) {
    const duration = currentTime - this.state?.lockedProfitTracker.lastReport;
    const lockedProfitDegradation =
      this.state?.lockedProfitTracker.lockedProfitDegradation;
    const lockedFundRatio = duration * lockedProfitDegradation;
    if (lockedFundRatio > LOCKED_PROFIT_DEGRATION_DENUMERATOR) {
      return 0;
    }
    const lockedProfit =
      this.state?.lockedProfitTracker.lastUpdatedLockedProfit;
    return Math.floor(
      (lockedProfit * (LOCKED_PROFIT_DEGRATION_DENUMERATOR - lockedFundRatio)) /
        LOCKED_PROFIT_DEGRATION_DENUMERATOR
    );
  }

  getUnlockedAmount(currentTime) {
    return this.state?.totalAmount - this.calculateLockedProfit(currentTime);
  }

  getAmountByShare(currentTime, share, totalSupply) {
    const totalAmount = this.getUnlockedAmount(currentTime);
    return Math.floor((share * totalAmount) / totalSupply);
  }

  getUnmintAmount(currentTime, outToken, totalSupply) {
    const totalAmount = this.getUnlockedAmount(currentTime);
    return Math.floor((outToken * totalSupply) / totalAmount);
  }
}

export default Vault;
