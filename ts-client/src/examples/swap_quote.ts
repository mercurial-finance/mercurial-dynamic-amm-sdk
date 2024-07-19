import {
  Connection,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import BN from "bn.js";
import { Wallet, AnchorProvider, Program } from '@project-serum/anchor';
import AmmImpl from '../amm';
import { Amm as AmmIdl, IDL as AmmIDL } from '../amm/idl';
import { PROGRAM_ID } from "../amm/constants";

const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com');
const mockWallet = new Wallet(new Keypair());
const provider = new AnchorProvider(mainnetConnection, mockWallet, {
  commitment: 'confirmed',
});

async function swapQuote(poolAddress: PublicKey, swapAmount: BN, swapAtoB: boolean) {
  const ammProgram = new Program<AmmIdl>(AmmIDL, PROGRAM_ID, provider);
  let poolState = await ammProgram.account.pool.fetch(poolAddress);
  const tokenList = await fetch('https://token.jup.ag/all').then(res => res.json());
  const tokenAInfo = tokenList.find(token => token.address === poolState.tokenAMint.toString());
  const tokenBInfo = tokenList.find(token => token.address === poolState.tokenBMint.toString());
  const pool = await AmmImpl.create(provider.connection, poolAddress, tokenAInfo, tokenBInfo);
  let inTokenMint = swapAtoB ? poolState.tokenAMint : poolState.tokenBMint;
  let swapQuote = pool.getSwapQuote(inTokenMint, swapAmount, 100);
  console.log("🚀 ~ swapQuote:", swapQuote);
  console.log("SwapInAmount %s swapOutAmount %s", swapQuote.swapInAmount.toString(), swapQuote.swapOutAmount.toString());
}

async function main() {
  await swapQuote(new PublicKey(
    "CtghFLd4CPXL5GoDw9hyuDuh1ewmnUvBjyGzrLh46SKk"
  ), new BN(1_000_000), true);
}


main()