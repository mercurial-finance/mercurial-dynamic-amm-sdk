import { BN, BorshCoder, Idl } from '@project-serum/anchor';
import { Fees, computeD, computeY, normalizedTradeFee } from '@saberhq/stableswap-sdk';
import { Fraction, Percent, ZERO } from '@saberhq/token-utils';
import { AccountInfo, PublicKey } from '@solana/web3.js';
import JSBI from 'jsbi';
import { OutResult, SwapCurve, TradeDirection, getPriceImpact } from '.';
import { CURVE_TYPE_ACCOUNTS } from '../constants';
import MarinadeIDL from '../marinade-finance.json';
import { Depeg, DepegType, PoolFees, StakePool, StakePoolLayout, TokenMultiplier } from '../types';

// Precision for base pool virtual price
const PRECISION = new BN(1_000_000);
const BASE_CACHE_EXPIRE = new BN(60 * 10);

const N_COINS = JSBI.BigInt(2);

export class StableSwap implements SwapCurve {
  constructor(
    private amp: number,
    private tokenMultiplier: TokenMultiplier,
    public depeg: Depeg,
    private extraAccounts: Map<String, AccountInfo<Buffer>>,
    private onChainTime: BN,
    private stakePoolPubkey: PublicKey,
  ) {}

  private getBasePoolVirtualPrice(depegType: DepegType): BN {
    if (depegType['marinade']) {
      const account = this.extraAccounts.get(CURVE_TYPE_ACCOUNTS.marinade.toBase58());
      const coder = new BorshCoder(MarinadeIDL as any as Idl);
      const stake = coder.accounts.decode('State', account!.data);
      const msolPrice = stake.msolPrice as BN;
      return msolPrice.mul(PRECISION).div(new BN(0x1_0000_0000));
    }
    if (depegType['lido']) {
      const account = this.extraAccounts.get(CURVE_TYPE_ACCOUNTS.lido.toBase58());
      //https://github.com/mercurial-finance/mercurial-dynamic-amm/blob/main/programs/amm/tests/test_depeg_price.rs#L33
      const stSolSupply = new BN(account!.data.readBigInt64LE(73).toString());
      const stSolBalance = new BN(account!.data.readBigInt64LE(81).toString());
      return stSolBalance.mul(PRECISION).div(stSolSupply);
    }
    if (depegType['splStake']) {
      const account = this.extraAccounts.get(this.stakePoolPubkey.toBase58());
      const stakePool: StakePool = StakePoolLayout.decode(account!.data);
      return stakePool.totalLamports.mul(PRECISION).div(stakePool.poolTokenSupply);
    }
    throw new Error('UnsupportedBasePool');
  }

  private updateDepegInfoIfExpired() {
    if (!this.depeg.depegType['none']) {
      const expired = this.onChainTime.toNumber() > this.depeg.baseCacheUpdated.add(BASE_CACHE_EXPIRE).toNumber();
      if (expired) {
        this.depeg.baseVirtualPrice = this.getBasePoolVirtualPrice(this.depeg.depegType);
        this.depeg.baseCacheUpdated = new BN(this.onChainTime);
      }
    }
  }

  private upscaleTokenA(tokenAAmount: BN): BN {
    const { tokenAMultiplier } = this.tokenMultiplier;
    const normalizedTokenAAmount = tokenAAmount.mul(tokenAMultiplier);
    if (!this.depeg.depegType['none']) {
      return normalizedTokenAAmount.mul(PRECISION);
    }
    return normalizedTokenAAmount;
  }

  private downscaleTokenA(tokenAAmount: BN): BN {
    const { tokenAMultiplier } = this.tokenMultiplier;
    const denormalizedTokenAAmount = tokenAAmount.div(tokenAMultiplier);
    if (!this.depeg.depegType['none']) {
      return denormalizedTokenAAmount.div(PRECISION);
    }
    return denormalizedTokenAAmount;
  }

  private upscaleTokenB(tokenBAmount: BN): BN {
    const { tokenBMultiplier } = this.tokenMultiplier;
    const normalizedTokenBAmount = tokenBAmount.mul(tokenBMultiplier);
    if (!this.depeg.depegType['none']) {
      return normalizedTokenBAmount.mul(this.depeg.baseVirtualPrice);
    }
    return normalizedTokenBAmount;
  }

  private downscaleTokenB(tokenBAmount: BN): BN {
    const { tokenBMultiplier } = this.tokenMultiplier;
    const denormalizedTokenBAmount = tokenBAmount.div(tokenBMultiplier);
    if (!this.depeg.depegType['none']) {
      return denormalizedTokenBAmount.div(this.depeg.baseVirtualPrice);
    }
    return denormalizedTokenBAmount;
  }

  private computeOutAmountWithoutSlippage(
    sourceAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN,
    invariantD: BN,
  ): BN {
    const SIXTEEN = new BN(16);
    const FOUR = new BN(4);
    const TWO = new BN(2);
    const amp = new BN(this.amp);
    const a = amp.mul(SIXTEEN);
    const b = a;
    const c = invariantD.mul(FOUR).sub(invariantD.mul(amp).mul(SIXTEEN));

    const numerator = TWO.mul(a)
      .mul(swapSourceAmount)
      .add(b.mul(swapDestinationAmount))
      .add(c)
      .mul(swapDestinationAmount);

    const denominator = a.mul(swapSourceAmount).add(TWO.mul(b).mul(swapDestinationAmount).add(c)).mul(swapSourceAmount);

    return sourceAmount.mul(numerator).div(denominator);
  }

  computeOutAmount(
    sourceAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN,
    tradeDirection: TradeDirection,
  ): OutResult {
    this.updateDepegInfoIfExpired();
    const [upscaledSourceAmount, upscaledSwapSourceAmount, upscaledSwapDestinationAmount] =
      tradeDirection == TradeDirection.AToB
        ? [
            this.upscaleTokenA(sourceAmount),
            this.upscaleTokenA(swapSourceAmount),
            this.upscaleTokenB(swapDestinationAmount),
          ]
        : [
            this.upscaleTokenB(sourceAmount),
            this.upscaleTokenB(swapSourceAmount),
            this.upscaleTokenA(swapDestinationAmount),
          ];

    const invariantD = computeD(
      JSBI.BigInt(this.amp),
      JSBI.BigInt(upscaledSwapSourceAmount.toString()),
      JSBI.BigInt(upscaledSwapDestinationAmount.toString()),
    );

    const newSwapSourceAmount = JSBI.add(
      JSBI.BigInt(upscaledSwapSourceAmount.toString()),
      JSBI.BigInt(upscaledSourceAmount.toString()),
    );
    const newSwapDestinationAmount = computeY(JSBI.BigInt(this.amp), newSwapSourceAmount, invariantD);

    let outAmount = upscaledSwapDestinationAmount.sub(new BN(newSwapDestinationAmount.toString())).sub(new BN(1));

    let outAmountWithoutSlippage = this.computeOutAmountWithoutSlippage(
      upscaledSourceAmount,
      upscaledSwapSourceAmount,
      upscaledSwapDestinationAmount,
      new BN(invariantD.toString()),
    );

    [outAmount, outAmountWithoutSlippage] =
      tradeDirection == TradeDirection.AToB
        ? [this.downscaleTokenB(outAmount), this.downscaleTokenB(outAmountWithoutSlippage)]
        : [this.downscaleTokenA(outAmount), this.downscaleTokenA(outAmountWithoutSlippage)];

    return {
      outAmount,
      priceImpact: getPriceImpact(outAmount, outAmountWithoutSlippage),
    };
  }

  computeD(tokenAAmount: BN, tokenBAmount: BN): BN {
    this.updateDepegInfoIfExpired();
    const upscaledTokenAAmount = this.upscaleTokenA(tokenAAmount);
    const upscaledTokenBAmount = this.upscaleTokenB(tokenBAmount);
    const invariantD = new BN(
      computeD(
        JSBI.BigInt(this.amp),
        JSBI.BigInt(upscaledTokenAAmount.toString()),
        JSBI.BigInt(upscaledTokenBAmount.toString()),
      ).toString(),
    );
    if (!this.depeg.depegType['none']) {
      return invariantD.div(PRECISION);
    }
    return invariantD;
  }

  computeInAmount(destAmount: BN, swapSourceAmount: BN, swapDestinationAmount: BN, tradeDirection: TradeDirection): BN {
    this.updateDepegInfoIfExpired();
    const [upscaledDestAmount, upscaledSwapSourceAmount, upscaledSwapDestinationAmount] =
      tradeDirection == TradeDirection.AToB
        ? [
            this.upscaleTokenB(destAmount),
            this.upscaleTokenA(swapSourceAmount),
            this.upscaleTokenB(swapDestinationAmount),
          ]
        : [
            this.upscaleTokenA(destAmount),
            this.upscaleTokenB(swapSourceAmount),
            this.upscaleTokenA(swapDestinationAmount),
          ];

    const invariantD = computeD(
      JSBI.BigInt(this.amp),
      JSBI.BigInt(upscaledSwapSourceAmount.toString()),
      JSBI.BigInt(upscaledSwapDestinationAmount.toString()),
    );

    const newSwapDestAmount = JSBI.subtract(
      JSBI.BigInt(upscaledSwapDestinationAmount.toString()),
      JSBI.BigInt(upscaledDestAmount.toString()),
    );
    const newSwapSourceAmount = computeY(JSBI.BigInt(this.amp), newSwapDestAmount, invariantD);
    const inAmount = new BN(newSwapSourceAmount.toString()).sub(swapSourceAmount);

    return tradeDirection == TradeDirection.AToB ? this.downscaleTokenA(inAmount) : this.downscaleTokenB(inAmount);
  }

  computeImbalanceDeposit(
    depositAAmount: BN,
    depositBAmount: BN,
    swapTokenAAmount: BN,
    swapTokenBAmount: BN,
    lpSupply: BN,
    fees: PoolFees,
  ): BN {
    this.updateDepegInfoIfExpired();

    const [upscaledDepositAAmount, upscaledDepositBAmount, upscaledSwapTokenAAmount, upscaledSwapTokenBAmount] = [
      this.upscaleTokenA(depositAAmount),
      this.upscaleTokenB(depositBAmount),
      this.upscaleTokenA(swapTokenAAmount),
      this.upscaleTokenB(swapTokenBAmount),
    ];
    const { mintAmount } = calculateEstimatedMintAmount(
      JSBI.BigInt(this.amp),
      Helper.toFees(fees),
      JSBI.BigInt(lpSupply.toString()),
      [JSBI.BigInt(upscaledSwapTokenAAmount.toString()), JSBI.BigInt(upscaledSwapTokenBAmount.toString())],
      JSBI.BigInt(upscaledDepositAAmount.toString()),
      JSBI.BigInt(upscaledDepositBAmount.toString()),
    );

    return new BN(mintAmount.toString());
  }

  computeWithdrawOne(
    lpAmount: BN,
    lpSupply: BN,
    swapTokenAAmount: BN,
    swapTokenBAmount: BN,
    fees: PoolFees,
    tradeDirection: TradeDirection,
  ): BN {
    this.updateDepegInfoIfExpired();
    const [upscaledSwapTokenAAmount, upscaledSwapTokenBAmount] = [
      this.upscaleTokenA(swapTokenAAmount),
      this.upscaleTokenB(swapTokenBAmount),
    ];

    const { withdrawAmountBeforeFees } = calculateEstimatedWithdrawOneAmount({
      ampFactor: JSBI.BigInt(this.amp),
      feeInfo: Helper.toFees(fees),
      lpTotalSupply: JSBI.BigInt(lpSupply.toString()),
      poolTokenAmount: JSBI.BigInt(lpAmount.toString()),
      reserves: [JSBI.BigInt(upscaledSwapTokenAAmount.toString()), JSBI.BigInt(upscaledSwapTokenBAmount.toString())],
      tradeDirection,
    });

    // Before withdrawal fee
    return tradeDirection == TradeDirection.AToB
      ? this.downscaleTokenB(new BN(withdrawAmountBeforeFees.toString()))
      : this.downscaleTokenA(new BN(withdrawAmountBeforeFees.toString()));
  }

  getRemainingAccounts() {
    let accounts: Array<{
      pubkey: PublicKey;
      isWritable: boolean;
      isSigner: boolean;
    }> = [];

    if ('marinade' in this.depeg.depegType) {
      accounts.push({
        pubkey: CURVE_TYPE_ACCOUNTS.marinade,
        isWritable: false,
        isSigner: false,
      });
    }

    if ('lido' in this.depeg.depegType) {
      accounts.push({
        pubkey: CURVE_TYPE_ACCOUNTS.lido,
        isWritable: false,
        isSigner: false,
      });
    }

    if (!this.stakePoolPubkey.equals(PublicKey.default)) {
      accounts.push({
        pubkey: this.stakePoolPubkey,
        isWritable: false,
        isSigner: false,
      });
    }

    return accounts;
  }
}

function calculateEstimatedWithdrawOneAmount({
  ampFactor,
  feeInfo,
  lpTotalSupply,
  reserves,
  poolTokenAmount,
  tradeDirection,
}: {
  ampFactor: JSBI;
  feeInfo: Fees;
  lpTotalSupply: JSBI;
  reserves: [JSBI, JSBI];
  poolTokenAmount: JSBI;
  tradeDirection: TradeDirection;
}): {
  withdrawAmount: JSBI;
  withdrawAmountBeforeFees: JSBI;
  swapFee: JSBI;
  withdrawFee: JSBI;
  lpSwapFee: JSBI;
  lpWithdrawFee: JSBI;
  adminSwapFee: JSBI;
  adminWithdrawFee: JSBI;
} {
  if (JSBI.equal(poolTokenAmount, ZERO)) {
    return {
      withdrawAmount: ZERO,
      withdrawAmountBeforeFees: ZERO,
      swapFee: ZERO,
      withdrawFee: ZERO,
      lpSwapFee: ZERO,
      lpWithdrawFee: ZERO,
      adminSwapFee: ZERO,
      adminWithdrawFee: ZERO,
    };
  }

  const [baseReserves, quoteReserves] =
    tradeDirection == TradeDirection.BToA ? [reserves[0], reserves[1]] : [reserves[1], reserves[0]];

  const d_0 = computeD(ampFactor, baseReserves, quoteReserves);
  const d_1 = JSBI.subtract(d_0, JSBI.divide(JSBI.multiply(poolTokenAmount, d_0), lpTotalSupply));

  const new_y = computeY(ampFactor, quoteReserves, d_1);

  // expected_base_amount = swap_base_amount * d_1 / d_0 - new_y;
  const expected_base_amount = JSBI.subtract(JSBI.divide(JSBI.multiply(baseReserves, d_1), d_0), new_y);
  // expected_quote_amount = swap_quote_amount - swap_quote_amount * d_1 / d_0;
  const expected_quote_amount = JSBI.subtract(quoteReserves, JSBI.divide(JSBI.multiply(quoteReserves, d_1), d_0));
  // new_base_amount = swap_base_amount - expected_base_amount * fee / fee_denominator;
  const new_base_amount = new Fraction(baseReserves.toString(), 1).subtract(
    normalizedTradeFee(feeInfo, N_COINS, expected_base_amount),
  );
  // new_quote_amount = swap_quote_amount - expected_quote_amount * fee / fee_denominator;
  const new_quote_amount = new Fraction(quoteReserves.toString(), 1).subtract(
    normalizedTradeFee(feeInfo, N_COINS, expected_quote_amount),
  );
  const dy = new_base_amount.subtract(computeY(ampFactor, JSBI.BigInt(new_quote_amount.toFixed(0)), d_1).toString());
  const dy_0 = JSBI.subtract(baseReserves, new_y);

  // lp fees
  const swapFee = new Fraction(dy_0.toString(), 1).subtract(dy);
  const withdrawFee = dy.multiply(feeInfo.withdraw.asFraction);

  // admin fees
  const adminSwapFee = swapFee.multiply(feeInfo.adminTrade.asFraction);
  const adminWithdrawFee = withdrawFee.multiply(feeInfo.adminWithdraw.asFraction);

  // final LP fees
  const lpSwapFee = swapFee.subtract(adminSwapFee);
  const lpWithdrawFee = withdrawFee.subtract(adminWithdrawFee);

  // final withdraw amount
  const withdrawAmount = dy.subtract(withdrawFee).subtract(swapFee);

  // final quantities
  return {
    withdrawAmount: JSBI.BigInt(withdrawAmount.toFixed(0)),
    withdrawAmountBeforeFees: JSBI.BigInt(dy.toFixed(0)),
    swapFee: JSBI.BigInt(swapFee.toFixed(0)),
    withdrawFee: JSBI.BigInt(withdrawFee.toFixed(0)),
    lpSwapFee: JSBI.BigInt(lpSwapFee.toFixed(0)),
    lpWithdrawFee: JSBI.BigInt(lpWithdrawFee.toFixed(0)),
    adminSwapFee: JSBI.BigInt(adminSwapFee.toFixed(0)),
    adminWithdrawFee: JSBI.BigInt(adminWithdrawFee.toFixed(0)),
  };
}

function calculateEstimatedMintAmount(
  ampFactor: JSBI,
  feeInfo: Fees,
  lpTotalSupply: JSBI,
  reserves: [JSBI, JSBI],
  depositAmountA: JSBI,
  depositAmountB: JSBI,
): {
  mintAmountBeforeFees: JSBI;
  mintAmount: JSBI;
  fees: JSBI;
} {
  if (JSBI.equal(depositAmountA, ZERO) && JSBI.equal(depositAmountB, ZERO)) {
    return {
      mintAmountBeforeFees: ZERO,
      mintAmount: ZERO,
      fees: ZERO,
    };
  }

  const amp = ampFactor;
  const [reserveA, reserveB] = reserves;
  const d0 = computeD(amp, reserveA, reserveB);

  const d1 = computeD(amp, JSBI.add(reserveA, depositAmountA), JSBI.add(reserveB, depositAmountB));
  if (JSBI.lessThan(d1, d0)) {
    throw new Error('New D cannot be less than previous D');
  }

  const oldBalances = reserves.map((r) => r);
  const newBalances = [JSBI.add(reserveA, depositAmountA), JSBI.add(reserveB, depositAmountB)] as const;
  const adjustedBalances = newBalances.map((newBalance, i) => {
    const oldBalance = oldBalances[i] as JSBI;
    const idealBalance = new Fraction(d1, d0).multiply(oldBalance);
    const difference = idealBalance.subtract(newBalance);
    const diffAbs = difference.greaterThan(0) ? difference : difference.multiply(-1);
    const fee = normalizedTradeFee(feeInfo, N_COINS, JSBI.BigInt(diffAbs.toFixed(0)));
    return JSBI.subtract(newBalance, JSBI.BigInt(fee.toFixed(0)));
  }) as [JSBI, JSBI];
  const d2 = computeD(amp, adjustedBalances[0], adjustedBalances[1]);

  const lpSupply = lpTotalSupply;
  const mintAmountRaw = JSBI.divide(JSBI.multiply(lpSupply, JSBI.subtract(d2, d0)), d0);
  const mintAmountRawBeforeFees = JSBI.divide(JSBI.multiply(lpSupply, JSBI.subtract(d1, d0)), d0);

  const fees = JSBI.subtract(mintAmountRawBeforeFees, mintAmountRaw);

  return {
    mintAmount: mintAmountRaw,
    mintAmountBeforeFees: mintAmountRawBeforeFees,
    fees,
  };
}

// Helper class to convert the type to the type from saber stable calculator
class Helper {
  public static toFees(fees: PoolFees): Fees {
    return {
      adminTrade: new Percent(fees.protocolTradeFeeNumerator, fees.protocolTradeFeeDenominator),
      trade: new Percent(fees.tradeFeeNumerator, fees.tradeFeeDenominator),
      adminWithdraw: new Percent(0, 100),
      withdraw: new Percent(0, 100),
    };
  }
}
