import { SwapCurve, TradeDirection } from '.';
import { BN, BorshCoder, Idl } from '@project-serum/anchor';
import {
  computeY,
  computeD,
  calculateEstimatedMintAmount,
  Fees,
  IReserve,
  calculateEstimatedWithdrawOneAmount,
  IExchangeInfo,
} from '@saberhq/stableswap-sdk';
import JSBI from 'jsbi';
import { Token, TokenAmount, Percent, ChainId } from '@saberhq/token-utils';
import { AccountInfo, Connection, Keypair, PublicKey } from '@solana/web3.js';
import MarinadeIDL from '../marinade-finance.json';
import { CURVE_TYPE_ACCOUNTS } from '../constants';
import { Depeg, DepegType, PoolFees, TokenMultiplier } from '../types';

// Precision for base pool virtual price
const PRECISION = new BN(1_000_000);
const BASE_CACHE_EXPIRE = new BN(60 * 10);

export class StableSwap implements SwapCurve {
  constructor(
    private amp: number,
    private tokenMultiplier: TokenMultiplier,
    private depeg: Depeg,
    private extraAccounts: Map<String, AccountInfo<Buffer>>,
    private onChainTime: number,
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
    throw new Error('UnsupportedBasePool');
  }

  private async updateDepegInfoIfExpired() {
    if (!this.depeg.depegType['none']) {
      const expired = this.onChainTime > this.depeg.baseCacheUpdated.add(BASE_CACHE_EXPIRE).toNumber();
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

  computeOutAmount(
    sourceAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN,
    tradeDirection: TradeDirection,
  ): BN {
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
    const outAmount = upscaledSwapDestinationAmount.sub(new BN(newSwapDestinationAmount.toString()));
    return tradeDirection == TradeDirection.AToB ? this.downscaleTokenB(outAmount) : this.downscaleTokenA(outAmount);
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
      Helper.toExchange(this.amp, upscaledSwapTokenAAmount, upscaledSwapTokenBAmount, lpSupply, fees),
      JSBI.BigInt(upscaledDepositAAmount.toString()),
      JSBI.BigInt(upscaledDepositBAmount.toString()),
    );
    return mintAmount.toU64();
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
    const exchange = Helper.toExchange(this.amp, upscaledSwapTokenAAmount, upscaledSwapTokenBAmount, lpSupply, fees);
    const withdrawToken =
      tradeDirection == TradeDirection.BToA ? exchange.reserves[0].amount.token : exchange.reserves[1].amount.token;
    const { withdrawAmountBeforeFees } = calculateEstimatedWithdrawOneAmount({
      exchange,
      poolTokenAmount: Helper.toTokenAmount(lpAmount),
      withdrawToken,
    });
    // Before withdrawal fee
    return tradeDirection == TradeDirection.AToB
      ? this.downscaleTokenB(withdrawAmountBeforeFees.toU64())
      : this.downscaleTokenA(withdrawAmountBeforeFees.toU64());
  }
}
// Helper class to convert the type to the type from saber stable calculator
class Helper {
  public static toExchange(
    amp: number,
    swapTokenAAmount: BN,
    swapTokenBAmount: BN,
    lpSupply: BN,
    fees: PoolFees,
  ): IExchangeInfo {
    return {
      ampFactor: JSBI.BigInt(amp),
      fees: this.toFees(fees),
      lpTotalSupply: this.toTokenAmount(lpSupply),
      reserves: [this.toReserve(swapTokenAAmount), this.toReserve(swapTokenBAmount)],
    };
  }
  public static toFees(fees: PoolFees): Fees {
    return {
      adminTrade: new Percent(fees.ownerTradeFeeNumerator, fees.ownerTradeFeeDenominator),
      trade: new Percent(fees.tradeFeeNumerator, fees.tradeFeeDenominator),
      adminWithdraw: new Percent(0, 100),
      withdraw: new Percent(0, 100),
    };
  }
  public static toTokenAmount(amount: BN): TokenAmount {
    return new TokenAmount(
      // Only amount, address, and chainId are necessary for the calculation
      new Token({
        address: Keypair.generate().publicKey.toBase58(),
        chainId: ChainId.MainnetBeta,
        decimals: 0,
        name: '',
        symbol: '',
      }),
      amount,
    );
  }
  public static toReserve(amount: BN): IReserve {
    // Only amount is necessary for the calculation
    return {
      adminFeeAccount: PublicKey.default,
      amount: this.toTokenAmount(amount),
      reserveAccount: PublicKey.default,
    };
  }
}
