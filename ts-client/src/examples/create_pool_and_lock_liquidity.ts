import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import BN from 'bn.js';
import { Wallet, AnchorProvider } from '@coral-xyz/anchor';
import AmmImpl from '../amm';
import { PROGRAM_ID, SEEDS } from '../amm/constants';
import {
  getAssociatedTokenAccount,
  derivePoolAddressWithConfig as deriveConstantProductPoolAddressWithConfig,
} from '../amm/utils';
import fs from 'fs';

function loadKeypairFromFile(filename: string): Keypair {
  const secret = JSON.parse(fs.readFileSync(filename).toString()) as number[];
  const secretKey = Uint8Array.from(secret);
  return Keypair.fromSecretKey(secretKey);
}

const mainnetConnection = new Connection('https://api.devnet.solana.com');
const payerKP = loadKeypairFromFile('~/.config/solana/id.json');
const payerWallet = new Wallet(payerKP);
console.log('payer %s', payerKP.publicKey);

const provider = new AnchorProvider(mainnetConnection, payerWallet, {
  commitment: 'confirmed',
});

type AllocationByPercentage = {
  address: PublicKey;
  percentage: number;
};

type AllocationByAmount = {
  address: PublicKey;
  amount: BN;
};

function fromAllocationsToAmount(lpAmount: BN, allocations: AllocationByPercentage[]): AllocationByAmount[] {
  const sumPercentage = allocations.reduce((partialSum, a) => partialSum + a.percentage, 0);
  if (sumPercentage === 0) {
    throw Error('sumPercentage is zero');
  }

  let amounts: AllocationByAmount[] = [];
  let sum = new BN(0);
  for (let i = 0; i < allocations.length - 1; i++) {
    const amount = lpAmount.mul(new BN(allocations[i].percentage)).div(new BN(sumPercentage));
    sum = sum.add(amount);
    amounts.push({
      address: allocations[i].address,
      amount,
    });
  }
  // the last wallet get remaining amount
  amounts.push({
    address: allocations[allocations.length - 1].address,
    amount: lpAmount.sub(sum),
  });
  return amounts;
}

async function createPoolAndLockLiquidity(
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  tokenAAmount: BN,
  tokenBAmount: BN,
  config: PublicKey,
  allocations: AllocationByPercentage[],
) {
  const programID = new PublicKey(PROGRAM_ID);
  const poolPubkey = deriveConstantProductPoolAddressWithConfig(tokenAMint, tokenBMint, config, programID);
  console.log('create pool %s', poolPubkey);
  let transactions = await AmmImpl.createPermissionlessConstantProductPoolWithConfig(
    provider.connection,
    payerWallet.publicKey,
    tokenAMint,
    tokenBMint,
    tokenAAmount,
    tokenBAmount,
    config,
  );
  for (const transaction of transactions) {
    transaction.sign(payerWallet.payer);
    const txHash = await provider.connection.sendRawTransaction(transaction.serialize());
    await provider.connection.confirmTransaction(txHash, 'finalized');
    console.log('transaction %s', txHash);
  }

  const [lpMint] = PublicKey.findProgramAddressSync([Buffer.from(SEEDS.LP_MINT), poolPubkey.toBuffer()], programID);
  const payerPoolLp = await getAssociatedTokenAccount(lpMint, payerWallet.publicKey);
  const payerPoolLpBalance = (await provider.connection.getTokenAccountBalance(payerPoolLp)).value.amount;
  console.log('payerPoolLpBalance %s', payerPoolLpBalance.toString());

  let allocationByAmounts = fromAllocationsToAmount(new BN(payerPoolLpBalance), allocations);
  const pool = await AmmImpl.create(provider.connection, poolPubkey);
  for (const allocation of allocationByAmounts) {
    console.log('Lock liquidity %s', allocation.address.toString());
    let transaction = await pool.lockLiquidity(allocation.address, allocation.amount, payerWallet.publicKey);
    transaction.sign(payerWallet.payer);
    const txHash = await provider.connection.sendRawTransaction(transaction.serialize());
    await provider.connection.confirmTransaction(txHash, 'finalized');
    console.log('transaction %s', txHash);
  }
}

async function main() {
  const tokenAMint = new PublicKey('BjhBG7jkHYMBMos2HtRdFrw8rvSguBe5c3a3EJYXhyUf');
  const tokenBMint = new PublicKey('9KMeJp868Pdk8PrJEkwoAHMA1ctdxfVhe2TjeS4BcWjs');
  let config = new PublicKey('21PjsfQVgrn56jSypUT5qXwwSjwKWvuoBCKbVZrgTLz4');

  let allocations = [
    {
      address: new PublicKey('4sBMz7zmDWPzdEnECJW3NA9mEcNwkjYtVnL2KySaWYAf'),
      percentage: 80,
    },
    {
      address: new PublicKey('CVV5MxfwA24PsM7iuS2ddssYgySf5SxVJ8PpAwGN2yVy'),
      percentage: 20,
    },
  ];
  let tokenAAmount = new BN(100_000);
  let tokenBAmount = new BN(500_000);

  await createPoolAndLockLiquidity(tokenAMint, tokenBMint, tokenAAmount, tokenBAmount, config, allocations);
}

main();
