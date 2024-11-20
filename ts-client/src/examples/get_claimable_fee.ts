import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Wallet, AnchorProvider } from '@coral-xyz/anchor';
import AmmImpl from '../amm';

const mainnetConnection = new Connection('https://api.mainnet-beta.solana.com');
const provider = new AnchorProvider(mainnetConnection, new Wallet(Keypair.generate()), {
    commitment: 'confirmed',
});

async function getClaimableFee(poolAddress: PublicKey, owner: PublicKey) {
    const pool = await AmmImpl.create(provider.connection, poolAddress);
    let result = await pool.getUserLockEscrow(owner);
    console.log('unClaimed: %s', result?.fee.unClaimed.lp?.toString());
    console.log(result)
}

async function main() {
    // mainnet-beta, SOL-USDC
    const poolAddress = 'FRd5CJfLU2TDAUK2m3onvwqXs5md3y96Ad1RUMB5fyii';
    const owner = '3CCocQighVbWdoav1Fhp6t2K6v7kWtUEd6Sp59UU77Vt';
    await getClaimableFee(new PublicKey(poolAddress), new PublicKey(owner));
}

main();
