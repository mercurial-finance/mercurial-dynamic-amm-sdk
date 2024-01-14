import { Wallet } from '@project-serum/anchor';
import { bs58 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { TokenInfo } from '../../types';

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

  return ata.address;
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

export async function getValidatedTokens(): Promise<TokenInfo[]> {
  try {
    const tokensList: TokenInfo[] = [];
    const data = await fetch(`https://token.jup.ag/strict`)
    const tokens = await data.json()
    tokens.forEach((token: TokenInfo) => {
      tokensList.push(token);
    });
    return tokensList;
  } catch (error: any) {
    throw new Error("Failed to fetch validated tokens");
  }
};