import { Wallet } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const airDropSol = async (connection: Connection, publicKey: PublicKey, amount = 1) => {
  try {
    const airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const mockWallet = new Wallet(
  process.env.WALLET_PRIVATE_KEY ? Keypair.fromSecretKey(bs58.decode(process.env.WALLET_PRIVATE_KEY)) : new Keypair(),
);

export const MAINNET = {
  connection: new Connection(process.env.MAINNET_RPC_ENDPOINT as string),
  cluster: 'mainnet-beta',
};

export const DEVNET = {
  connection: new Connection('https://api.devnet.solana.com/', {
    commitment: 'confirmed',
  }),
  cluster: 'devnet',
};
