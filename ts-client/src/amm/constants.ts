import { ENV, TokenInfo } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';

export const ERROR = {
  POOL_NOT_LOAD: 'Pool not loaded',
  INVALID_MINT: 'Invalid mint',
  INVALID_ACCOUNT: 'Account not found',
};

export const PROGRAM_ID = 'Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB';
export const VAULT_PROGRAM_ID = '24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi';

export const DEVNET_COIN: Array<TokenInfo> = [
  {
    chainId: ENV.Devnet,
    address: 'So11111111111111111111111111111111111111112',
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
    },
  },
  {
    chainId: ENV.Devnet,
    address: 'zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA',
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
  },
  {
    chainId: ENV.Devnet,
    address: '9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9',
    decimals: 9,
    name: 'USDT',
    symbol: 'USDT',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    tags: ['stablecoin'],
    extensions: {
      coingeckoId: 'tether',
      serumV3Usdc: '77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS',
      website: 'https://tether.to/',
    },
  },
  {
    chainId: ENV.Devnet,
    address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    decimals: 9,
    symbol: 'mSOL',
    name: 'Marinade staked SOL (mSOL)',
    logoURI:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    extensions: {
      coingeckoId: 'msol',
      discord: 'https://discord.gg/mGqZA5pjRN',
      github: 'https://github.com/marinade-finance',
      medium: 'https://medium.com/marinade-finance',
      serumV3Usdc: '6oGsL2puUgySccKzn9XA9afqF217LfxP5ocq4B3LWsjy',
      serumV3Usdt: 'HxkQdUnrPdHwXP5T9kewEXs3ApgvbufuTfdw9v1nApFd',
      twitter: 'https://twitter.com/MarinadeFinance',
      website: 'https://marinade.finance',
    },
  },
];

export const DEVNET_POOL = Object.freeze({
  USDT_USDC: 'BAHscmu1NncGS7t4rc5gSBPv1UFEMkvLaon1Ahdd5rHi',
  USDT_SOL: 'Bgf1Sy5kfeDgib4go4NgzHuZwek8wE8NZus56z6uizzi',
  SOL_MSOL: '2rkn2yM4wJcHPV57T8fPWeBksrfSpiNZoEjRgjtxNDEQ',
});

export const MAINNET_POOL = Object.freeze({
  USDT_USDC: '32D4zRxNc1EssbJieVHfPhZM3rH6CzfUPrWUuWxD9prG',
  USDC_SOL: '5yuefgbJJpmFNK2iiYbLSpv1aZXq7F9AUKkZKErTYCvs',
  SOL_STSOL: '7EJSgV2pthhDfb4UiER9vzTqe2eojei9GEQAQnkqJ96e',
});

// Extra accounts for depeg pools. Might add more addresses in the future when more different types of pools are being added
export const CURVE_TYPE_ACCOUNTS = {
  // Stake account of Marinade finance. Used to retrieve mSol virtual price
  marinade: new PublicKey('8szGkuLTAux9XMgZ2vtY39jVSowEcpBfFfD8hXSEqdGC'),
  // Stake account of Solana Lido. Used to retrieve stSol virtual price
  lido: new PublicKey('49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn'),
};

export const SEEDS = Object.freeze({
  APY: 'apy',
});

export const POOL_BASE_KEY = new PublicKey('H9NnqW5Thn9dUzW3DRXe2xDhKjwZd4qbjngnZwEvnDuC');

export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const DEFAULT_SLIPPAGE = 1;

export const UNLOCK_AMOUNT_BUFFER = 0.998;

export const VIRTUAL_PRICE_PRECISION = new BN(100_000_000);
