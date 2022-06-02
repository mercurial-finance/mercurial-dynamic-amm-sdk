import { BN } from "@project-serum/anchor";

export interface SwapCurve {
  computeOutAmount(
    sourceAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN
  ): BN;

  computeD(tokenAAmount: BN, tokenBAmount: BN): BN;

  computeInAmount(
    destAmount: BN,
    swapSourceAmount: BN,
    swapDestinationAmount: BN
  ): BN;
}

export * from "./stable-swap";
