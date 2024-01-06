import { Wallet } from '@coral-xyz/anchor';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import {
  TOKEN_PROGRAM_ID,
  Token
} from '@solana/spl-token';

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

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

export const getOrCreateATA = async (connection: Connection, mint: PublicKey, owner: PublicKey, payer: Keypair) => {
  const token = new Token(connection, mint, TOKEN_PROGRAM_ID, payer);
  const ata = await token.getOrCreateAssociatedAccountInfo(owner);
  // const ata = Token.getOrCreateAssociatedTokenAccount(connection, mint, owner);
  return ata.address;
};

export const createAndMintTo = async (
  connection: Connection,
  admin: Keypair,
  destination: PublicKey,
  amount: number,
  decimals: number,
) => {
  const tokenMint = await Token.createMint(
    connection,
    admin,
    admin.publicKey,
    null,
    decimals,
    TOKEN_PROGRAM_ID
  );

  // const tokenAccount = await createAssociatedTokenAccount(connection, admin, tokenMint, admin.publicKey);

  const tokenAccount = await getOrCreateATA(
    connection,
    tokenMint.publicKey,
    destination,
    admin
  );
  await tokenMint.mintTo(tokenAccount, admin.publicKey, [], amount * 10 ** decimals);
  return {
    tokenMint,
    ata: tokenAccount,
    ataOwner: destination,
  };
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

export const LOCALNET = {
  connection: new Connection('http://127.0.0.1:8899', {
    commitment: 'confirmed',
  }),
  cluster: 'localnet',
  ammProgramId: "Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB"
}