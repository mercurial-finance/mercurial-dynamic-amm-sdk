import { PublicKey } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';

export function createWethTokenInfo(tokenAddress: PublicKey): TokenInfo {
  return {
    chainId: 1,
    address: tokenAddress.toBase58(),
    decimals: 9,
    name: 'Wrapped SOL',
    symbol: 'SOL',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    extensions: {
      coingeckoId: 'solana',
      serumV3Usdc: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
      serumV3Usdt: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
      website: 'https://solana.com/',
    }
  }
};

export function createUsdcTokenInfo(tokenAddress: PublicKey): TokenInfo {
  return {
    chainId: 1,
    address: tokenAddress.toBase58(),
    decimals: 6,
    name: 'USD Coin',
    symbol: 'USDC',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    extensions: {
      coingeckoId: 'usd-coin',
      serumV3Usdt: '77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS',
      website: 'https://www.centre.io/',
    },
  }
};
