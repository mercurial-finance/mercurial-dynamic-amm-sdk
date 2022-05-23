import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MercurialDynamicAmmSdk } from "../target/types/mercurial_dynamic_amm_sdk";

describe("mercurial-dynamic-amm-sdk", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MercurialDynamicAmmSdk as Program<MercurialDynamicAmmSdk>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
