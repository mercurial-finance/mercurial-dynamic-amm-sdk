import {
  Connection,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import BN from "bn.js";
import { Wallet, AnchorProvider, Program } from '@project-serum/anchor';
import AmmImpl from '../amm';
import fs from "fs";
import os from 'os'
import { SwapQuote } from "../amm/types";


function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename.replace("~", os.homedir)).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}
const payerKP = loadKeypairFromFile("~/.config/solana/id.json")
const payerWallet = new Wallet(payerKP);
console.log("Wallet Address: %s \n", payerKP.publicKey);

const devnetConnection = new Connection('https://api.devnet.solana.com');
const provider = new AnchorProvider(devnetConnection, payerWallet, {
  commitment: 'confirmed',
});

async function swap(poolAddress: PublicKey, swapAmount: BN, swapAtoB: boolean ) {
  let tokenAInfo = {
    chainId: 103,
    address: '9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9',
    decimals: 9,
    name: '9NG',
    symbol: '9NG',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    tags: ['stablecoin'],
  }
  let tokenBInfo = {
    chainId: 103,
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    name: 'Wrapped SOL',
    symbol: 'SOL',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  }

  const pool = await AmmImpl.create(provider.connection, poolAddress, tokenAInfo, tokenBInfo);
  const poolInfo = pool.poolInfo

  const poolTokenAddress = await pool.getPoolTokenMint();
  console.log('Pool LP Token Mint Address: %s', poolTokenAddress.toString())
  const lpSupply = await pool.getLpSupply();
  console.log('Pool LP Supply: %s', lpSupply.toNumber() / Math.pow(10, pool.decimals))
  const LockedLpAmount = await pool.getLockedLpAmount();
  console.log('Locked Lp Amount: %s \n', LockedLpAmount.toNumber())

  console.log("tokenA %s Amount: %s ", pool.tokenA.name, poolInfo.tokenAAmount.toNumber() / Math.pow(10, tokenAInfo.decimals))
  console.log("tokenB %s Amount: %s ", pool.tokenB.name, poolInfo.tokenBAmount.toNumber() / Math.pow(10, tokenBInfo.decimals))
  console.log("virtualPrice: %s \n", poolInfo.virtualPrice)

  let swapInToken = swapAtoB ? tokenAInfo : tokenBInfo;
  let swapOuToken = swapAtoB ? tokenBInfo : tokenAInfo;
  let inTokenMint = new PublicKey(swapInToken.address);
  let swapQuote: SwapQuote = pool.getSwapQuote(inTokenMint, swapAmount, 100);
  console.log("🚀 ~ swapQuote:");
  console.log("Swap In %s, Amount %s ", swapInToken.name, swapQuote.swapInAmount.toNumber() / Math.pow(10, swapInToken.decimals))
  console.log("Swap Out %s, Amount %s \n", swapOuToken.name, swapQuote.swapOutAmount.toNumber() / Math.pow(10, swapOuToken.decimals));
  console.log("Fee of the Swap %s %s", swapQuote.fee.toNumber() / Math.pow(10, swapInToken.decimals), swapInToken.name)
  console.log("Price Impact of the Swap %s \n", swapQuote.priceImpact)

  console.log("Swapping...↔️ Please wait for a while😊☕️")

  const swapTx = await pool.swap(
    payerWallet.publicKey,
    new PublicKey(swapInToken.address),
    swapAmount,
    swapQuote.minSwapOutAmount,
  );
  const swapResult = await provider.sendAndConfirm(swapTx);

  console.log('Swap Transaction Hash: %s ', swapResult)
}

async function main() {
  // devnet, 9NG-SOL
  const poolAddress = "Bgf1Sy5kfeDgib4go4NgzHuZwek8wE8NZus56z6uizzi"

  // swap 10 9NG token to SOL
  // await swap(new PublicKey(poolAddress), new BN(10000_000_000), true);

  // swap 0.01 SOL to 9NG token
  await swap(new PublicKey(poolAddress), new BN(10_000_000), false);
}

main()
