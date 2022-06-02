import { SwapCurve } from ".";
import { BN } from "@project-serum/anchor";
import { computeY, computeD } from "@saberhq/stableswap-sdk";
import JSBI from "jsbi";

export class StableSwap implements SwapCurve {
  amp: number;

  constructor(amp: number) {
    this.amp = amp;
  }

  computeOutAmount(
    sourceAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN
  ): BN {
    const invariantD = computeD(
      JSBI.BigInt(this.amp),
      JSBI.BigInt(swapSourceAmount.toString()),
      JSBI.BigInt(swapDestinationAmount.toString())
    );
    const newSwapSourceAmount = JSBI.add(
      JSBI.BigInt(swapSourceAmount.toString()),
      JSBI.BigInt(sourceAmount.toString())
    );
    const newSwapDestinationAmount = computeY(
      JSBI.BigInt(this.amp),
      newSwapSourceAmount,
      invariantD
    );
    return swapDestinationAmount.sub(
      new BN(newSwapDestinationAmount.toString())
    );
  }

  computeD(tokenAAmount: BN, tokenBAmount: BN): BN {
    const invariantD = computeD(
      JSBI.BigInt(this.amp),
      JSBI.BigInt(tokenAAmount.toString()),
      JSBI.BigInt(tokenBAmount.toString())
    );
    return new BN(invariantD.toString());
  }

  computeInAmount(
    destAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN
  ): BN {
    const invariantD = computeD(
      JSBI.BigInt(this.amp),
      JSBI.BigInt(swapSourceAmount.toString()),
      JSBI.BigInt(swapDestinationAmount.toString())
    );
    
    const newSwapDestAmount = JSBI.subtract(
      JSBI.BigInt(swapDestinationAmount.toString()),
      JSBI.BigInt(destAmount.toString())
    );
    const newSwapSourceAmount = computeY(
      JSBI.BigInt(this.amp),
      newSwapDestAmount,
      invariantD
    );
    return new BN(newSwapSourceAmount.toString()).sub(
      swapSourceAmount
    );
  }
}
