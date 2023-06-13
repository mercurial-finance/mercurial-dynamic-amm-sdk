import AmmImpl from '..';
import { DEVNET, airDropSol, mockWallet } from './utils';
import { DEFAULT_SLIPPAGE, DEVNET_COIN, DEVNET_POOL } from '../constants';
import { Cluster, PublicKey } from '@solana/web3.js';
import { AnchorProvider, BN } from '@project-serum/anchor';
import DynamicAmmError from '../error';
import { IDL } from '../idl';

describe('Interact with Mainnet pool', () => {
  const provider = new AnchorProvider(DEVNET.connection, mockWallet, {
    commitment: 'confirmed',
  });
  let stablePool: AmmImpl;
  let cpPool: AmmImpl;
  let depegPool: AmmImpl;

  beforeAll(async () => {
    // await airDropSol(DEVNET.connection, mockWallet.publicKey);

    const USDT = DEVNET_COIN.find((token) => token.address === '9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9');
    const USDC = DEVNET_COIN.find((token) => token.address === 'zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA');
    const SOL = DEVNET_COIN.find((token) => token.address === 'So11111111111111111111111111111111111111112');
    const MSOL = DEVNET_COIN.find((token) => token.address === 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So');

    const pools = [
      { pool: new PublicKey(DEVNET_POOL.USDT_SOL), tokenInfoA: USDT!, tokenInfoB: SOL! },
      { pool: new PublicKey(DEVNET_POOL.SOL_MSOL), tokenInfoA: SOL!, tokenInfoB: MSOL! },
      { pool: new PublicKey(DEVNET_POOL.USDT_USDC), tokenInfoA: USDT!, tokenInfoB: USDC! },
    ];

    const [pool1, pool2, pool3] = await AmmImpl.createMultiple(DEVNET.connection, pools, {
      cluster: DEVNET.cluster as Cluster,
    });
    cpPool = pool1;
    depegPool = pool2;
    stablePool = pool3;
  });

  test('Should throw slippage error', async () => {
    const inAmountBLamport = new BN(0.1 * 10 ** cpPool.tokenB.decimals);

    const { tokenAInAmount: cpTokenAInAmount, tokenBInAmount: cpTokenBInAmount } = cpPool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
      true,
      DEFAULT_SLIPPAGE,
    );

    const cpDepositTx = await cpPool.deposit(
      mockWallet.publicKey,
      cpTokenAInAmount,
      cpTokenBInAmount,
      new BN(Number.MAX_SAFE_INTEGER),
    );

    provider.sendAndConfirm(cpDepositTx).catch((error) => {
      const ammError = new DynamicAmmError(error);

      expect(ammError.errorCode).toBe(IDL.errors[4].code);
    });

    const { tokenAInAmount: depegTokenAInAmount, tokenBInAmount: depegTokenBInAmount } = depegPool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
      true,
      DEFAULT_SLIPPAGE,
    );

    const depegPoolDepositTx = await depegPool.deposit(
      mockWallet.publicKey,
      depegTokenAInAmount,
      depegTokenBInAmount,
      new BN(Number.MAX_SAFE_INTEGER),
    );

    provider.sendAndConfirm(depegPoolDepositTx).catch((error) => {
      const ammError = new DynamicAmmError(error);

      expect(ammError.errorCode).toBe(IDL.errors[4].code);
    });

    const { tokenAInAmount: stableTokenAInAmount, tokenBInAmount: stableTokenBInAmount } = stablePool.getDepositQuote(
      new BN(0),
      inAmountBLamport,
      true,
      DEFAULT_SLIPPAGE,
    );

    const stablePoolDepositTx = await stablePool.deposit(
      mockWallet.publicKey,
      stableTokenAInAmount,
      stableTokenBInAmount,
      new BN(Number.MAX_SAFE_INTEGER),
    );

    provider.sendAndConfirm(stablePoolDepositTx).catch((error) => {
      const ammError = new DynamicAmmError(error);

      expect(ammError.errorCode).toBe(IDL.errors[4].code);
    });
  });
});
