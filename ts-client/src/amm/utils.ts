import { BN, EventParser } from '@project-serum/anchor';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import invariant from 'invariant';
import { WRAPPED_SOL_MINT } from './constants';
import { ParsedClockState } from './types';

export const getMaxAmountWithSlippage = (amount: BN, slippageRate: number) => {
  const slippage = ((100 + slippageRate) / 100) * 10000;
  return amount.mul(new BN(slippage)).div(new BN(10000));
};

export const getMinAmountWithSlippage = (amount: BN, slippageRate: number) => {
  const slippage = ((100 - slippageRate) / 100) * 10000;
  return amount.mul(new BN(slippage)).div(new BN(10000));
};

export const getOrCreateATAInstruction = async (
  tokenMint: PublicKey,
  owner: PublicKey,
  connection: Connection,
): Promise<[PublicKey, TransactionInstruction?]> => {
  let toAccount;
  try {
    toAccount = await Token.getAssociatedTokenAddress(ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, tokenMint, owner);
    const account = await connection.getAccountInfo(toAccount);
    if (!account) {
      const ix = Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        toAccount,
        owner,
        owner,
      );
      return [toAccount, ix];
    }
    return [toAccount, undefined];
  } catch (e) {
    /* handle error */
    console.error('Error::getOrCreateATAInstruction', e);
    throw e;
  }
};

export const wrapSOLInstruction = (from: PublicKey, to: PublicKey, amount: number): TransactionInstruction[] => {
  return [
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: amount,
    }),
    new TransactionInstruction({
      keys: [
        {
          pubkey: to,
          isSigner: false,
          isWritable: true,
        },
      ],
      data: Buffer.from(new Uint8Array([17])),
      programId: TOKEN_PROGRAM_ID,
    }),
  ];
};

export const unwrapSOLInstruction = async (owner: PublicKey) => {
  const wSolATAAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    WRAPPED_SOL_MINT,
    owner,
  );

  if (wSolATAAccount) {
    const closedWrappedSolInstruction = Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wSolATAAccount,
      owner,
      owner,
      [],
    );
    return closedWrappedSolInstruction;
  }
  return null;
};

export const getOnchainTime = async (connection: Connection) => {
  const parsedClock = await connection.getParsedAccountInfo(SYSVAR_CLOCK_PUBKEY);

  const parsedClockAccount = (parsedClock.value!.data as ParsedAccountData).parsed as ParsedClockState;

  const currentTime = parsedClockAccount.info.unixTimestamp;
  return currentTime;
};

export const parseLogs = async (eventParser: EventParser, logs: string[]) => {
  let timeout: NodeJS.Timeout;
  return new Promise((resolve, reject) => {
    invariant(logs.length, 'Invalid logs');
    eventParser?.parseLogs(logs, (event) => {
      timeout && clearTimeout(timeout);
      resolve(event?.data);
    });
    // TODO: find a better solution (create own eventParser)
    timeout = setTimeout(() => {
      invariant(true, 'No events found');
      reject();
    }, 1500);
  });
};

/**
 * Compute "actual" amount deposited to vault (precision loss)
 * @param depositAmount
 * @param beforeAmount
 * @param vaultLpBalance
 * @param vaultLpSupply
 * @param vaultTotalAmount
 * @returns
 */
export const computeActualDepositAmount = (
  depositAmount: BN,
  beforeAmount: BN,
  vaultLpBalance: BN,
  vaultLpSupply: BN,
  vaultTotalAmount: BN,
): BN => {
  if (depositAmount.eq(new BN(0))) return depositAmount;

  const vaultLpMinted = depositAmount.mul(vaultLpSupply).div(vaultTotalAmount);
  vaultLpSupply = vaultLpSupply.add(vaultLpMinted);
  vaultTotalAmount = vaultTotalAmount.add(depositAmount);
  vaultLpBalance = vaultLpBalance.add(vaultLpMinted);

  const afterAmount = vaultLpBalance.mul(vaultTotalAmount).div(vaultLpSupply);

  return afterAmount.sub(beforeAmount);
};
