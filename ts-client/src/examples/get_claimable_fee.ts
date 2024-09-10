import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import BN from 'bn.js';
import { Wallet, AnchorProvider, Program } from '@coral-xyz/anchor';
import AmmImpl from '../amm';
import { Amm as AmmIdl, IDL as AmmIDL } from '../amm/idl';
import { PROGRAM_ID } from '../amm/constants';
import fs from 'fs';
import os from 'os';

function loadKeypairFromFile(filename: string): Keypair {
    const secret = JSON.parse(fs.readFileSync(filename.replace('~', os.homedir)).toString()) as number[];
    const secretKey = Uint8Array.from(secret);
    return Keypair.fromSecretKey(secretKey);
}
const payerKP = loadKeypairFromFile('~/.config/solana/id.json');
const payerWallet = new Wallet(payerKP);
console.log('Wallet Address: %s \n', payerKP.publicKey);

const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com');
const provider = new AnchorProvider(mainnetConnection, payerWallet, {
    commitment: 'confirmed',
});

async function getClaimableFee(poolAddress: PublicKey, owner: PublicKey) {
    const pool = await AmmImpl.create(provider.connection, poolAddress);
    let result = await pool.getUserLockEscrow(owner);
    console.log('unClaimed: %s', result?.fee.unClaimed.lp?.toString());
}

async function main() {
    // mainnet-beta, SOL-USDC
    const poolAddress = '6ovwZuLQ5bAktBxpoQH4PC6RBN4bXtzetZUP9kQtCeAv';
    const owner = '8AuJcdEvHsQTAPZc5gjjLFpo4aHfgwu3cY1NePpeLVvY';
    await getClaimableFee(new PublicKey(poolAddress), new PublicKey(owner));
}

main();
