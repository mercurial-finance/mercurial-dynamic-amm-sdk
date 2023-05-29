import { AccountInfo, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { calculateSwapQuote, createProgram } from '../utils';
import fs from 'fs';
import path from 'path';

// Get snapshots by running cargo test-bpf --features test-bpf-capture at the root
import snapshot from './snapshots/snapshot-32D4zRxNc1EssbJieVHfPhZM3rH6CzfUPrWUuWxD9prG-EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v-1000000.json';
import { BN } from 'bn.js';

export type Snapshot = typeof snapshot;

describe('Assert swap quote with snapshot history', () => {
  const { ammProgram, vaultProgram } = createProgram(new Connection('http://127.0.0.1:8899'));

  const dir = fs.readdirSync(path.resolve(__dirname, './snapshots'));

  for (const snapshotFile of dir) {
    const data = fs.readFileSync(path.resolve(__dirname, './snapshots', snapshotFile));
    const snapshot: Snapshot = JSON.parse(data.toString());

    const poolState = ammProgram.account.pool.coder.accounts.decode('pool', Buffer.from(snapshot.pool_state));
    const vaultA = vaultProgram.account.vault.coder.accounts.decode('vault', Buffer.from(snapshot.vault_a_state));
    const vaultB = vaultProgram.account.vault.coder.accounts.decode('vault', Buffer.from(snapshot.vault_b_state));

    const inAmount = new BN(snapshot.in_amount);
    const inTokenMint = new PublicKey(snapshot.in_token_mint);
    const depegAccounts: Map<String, AccountInfo<Buffer>> = new Map();

    for (const [k, v] of Object.entries(snapshot.stakes_state)) {
      depegAccounts.set(k, {
        data: Buffer.from(v),
        executable: false,
        lamports: LAMPORTS_PER_SOL,
        owner: PublicKey.default,
        rentEpoch: 0,
      });
    }

    it(`Swap ${inTokenMint} ${inAmount} equals to snapshot`, () => {
      const { amountOut } = calculateSwapQuote(inTokenMint, inAmount, {
        poolState,
        vaultA,
        vaultB,
        currentTime: snapshot.onchain_timestamp,
        depegAccounts,
        poolVaultALp: new BN(snapshot.pool_vault_a_lp),
        vaultALpSupply: new BN(snapshot.vault_a_lp_supply),
        vaultAReserve: new BN(snapshot.vault_a_reserve),
        poolVaultBLp: new BN(snapshot.pool_vault_b_lp),
        vaultBLpSupply: new BN(snapshot.vault_b_lp_supply),
        vaultBReserve: new BN(snapshot.vault_b_reserve),
      });

      expect(amountOut.toString()).toBe(snapshot.out_amount.toString());
    });
  }
});
