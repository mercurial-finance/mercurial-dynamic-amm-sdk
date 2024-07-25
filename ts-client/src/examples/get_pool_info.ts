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
import fs from "fs";
import os from 'os'


function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename.replace("~", os.homedir)).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}
const payerKP = loadKeypairFromFile("~/.config/solana/id.json")
const payerWallet = new Wallet(payerKP);
// or use mock wallet instead
// const payerWallet = new Wallet(new Keypair());
console.log("Wallet Address: %s \n", payerKP.publicKey);

const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com');
const provider = new AnchorProvider(mainnetConnection, payerWallet, {
  commitment: 'confirmed',
});

async function getPoolInfo(poolAddress: PublicKey) {
  const ammProgram = new Program<AmmIdl>(AmmIDL, PROGRAM_ID, provider);
  let poolState = await ammProgram.account.pool.fetch(poolAddress);
  // console.log({poolState})
  const tokenList = await fetch('https://token.jup.ag/all').then(res => res.json());
  // console.log({tokenList})
  const tokenAInfo = tokenList.find(token => token.address === poolState.tokenAMint.toString());
  // console.log({tokenAInfo})
  const tokenBInfo = tokenList.find(token => token.address === poolState.tokenBMint.toString());
  // console.log({tokenBInfo})

  const pool = await AmmImpl.create(provider.connection, poolAddress, tokenAInfo, tokenBInfo);
  // console.log({pool})

  const poolInfo = pool.poolInfo
  // console.log({poolInfo})

  console.log('Pool Address: %s', poolAddress.toString())
  const poolTokenAddress = await pool.getPoolTokenMint();
  console.log('Pool LP Token Mint Address: %s', poolTokenAddress.toString())
  const LockedLpAmount = await pool.getLockedLpAmount();
  console.log('Locked Lp Amount: %s', LockedLpAmount.toNumber())
  const lpSupply = await pool.getLpSupply();
  console.log('Pool LP Supply: %s \n', lpSupply.toNumber() / Math.pow(10, pool.decimals))

  console.log("tokenA %s Amount: %s ", pool.tokenA.name, poolInfo.tokenAAmount.toNumber() / Math.pow(10, tokenAInfo.decimals))
  console.log("tokenB %s Amount: %s", pool.tokenB.name, poolInfo.tokenBAmount.toNumber() / Math.pow(10, tokenBInfo.decimals))
  console.log("virtualPrice: %s", poolInfo.virtualPrice)
  console.log("virtualPriceRaw to String: %s \n", poolInfo.virtualPriceRaw.toString())
}

async function main() {
  const poolAddressArray = [
    // mainnet-beta, USDC-SOL
    "5yuefgbJJpmFNK2iiYbLSpv1aZXq7F9AUKkZKErTYCvs",
    // mainnet-beta, SOL-USDC
    "6SWtsTzXrurtVWZdEHvnQdE9oM8tTtyg8rfEo3b4nM93",
    // mainnet-beta, Yes Token-SOL
    "CtghFLd4CPXL5GoDw9hyuDuh1ewmnUvBjyGzrLh46SKk",
    // devnet, 9NG-SOL
    "Bgf1Sy5kfeDgib4go4NgzHuZwek8wE8NZus56z6uizzi"
  ]
  await getPoolInfo(new PublicKey(poolAddressArray[1]));
}

main()
