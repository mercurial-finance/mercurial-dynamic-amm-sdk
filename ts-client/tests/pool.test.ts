import { AnchorProvider, BN, Wallet } from "@project-serum/anchor";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { Pool } from "../index";
import { ParsedClockState } from "../src/types/pool_state";

const USDT_MINT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const STSOL_MINT = new PublicKey(
  "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj"
);

const USDC_USDT_POOL = new PublicKey(
  "32D4zRxNc1EssbJieVHfPhZM3rH6CzfUPrWUuWxD9prG"
);
const USDC_SOL_POOL = new PublicKey(
  "5yuefgbJJpmFNK2iiYbLSpv1aZXq7F9AUKkZKErTYCvs"
);
const SOL_STSOL_POOL = new PublicKey(
  "7EJSgV2pthhDfb4UiER9vzTqe2eojei9GEQAQnkqJ96e"
);

const KEYPAIR = Keypair.generate();
const PROVIDER = new AnchorProvider(
  new Connection(clusterApiUrl("mainnet-beta")),
  new Wallet(KEYPAIR),
  {}
);

const AMM_PROGRAM = Pool.createProgram(PROVIDER);

describe("stable-swap pool", () => {
  let pool: Pool;

  describe("load", () => {
    it("should load the pool state", async () => {
      pool = await Pool.load(KEYPAIR.publicKey, AMM_PROGRAM, USDC_USDT_POOL);
      expect(pool.state).not.toBeUndefined();
    });
  });

  describe("getTokensBalance", () => {
    it("should load the pool tokens balance", async () => {
      const [tokenABalance, tokenBBalance] = pool
        .getTokensBalance()
        .map((b) => b.toNumber());
      console.log(
        `tokenABalance ${tokenABalance}, tokenBBalance ${tokenBBalance}`
      );
      expect(tokenABalance).toBeGreaterThan(0);
      expect(tokenBBalance).toBeGreaterThan(0);
    });
  });

  describe("getMaxSwappableOutAmount", () => {
    it("should return maximum swap out amount", async () => {
      const [_, tokenBBalance] = pool
        .getTokensBalance()
        .map((b) => b.toNumber());
      const maxSwapableAmount = pool
        .getMaxSwappableOutAmount(pool.state.tokenBMint)
        .toNumber();
      console.log(
        `maxSwapableAmount ${maxSwapableAmount}, tokenBAmount ${tokenBBalance}`
      );
      expect(maxSwapableAmount).toBeLessThanOrEqual(tokenBBalance);
    });
  });

  describe("computeD", () => {
    it("should return total liquidity", async () => {
      const [tokenABalance, tokenBBalance] = pool.getTokensBalance();
      const stableSwap = pool.swapCurve;
      const totalLiquidity = stableSwap.computeD(tokenABalance, tokenBBalance);
      console.log("totalLiquidity", totalLiquidity.toString());
      expect(totalLiquidity.toNumber()).toBeGreaterThan(0);
    });
  });

  describe("getOutAmount", () => {
    it("should return USDC out amount", async () => {
      const outAmount = pool.getOutAmount(USDT_MINT, new BN(1_000_000));
      console.log("USDC amount", outAmount.toString());
    });

    it("should return USDT out amount", async () => {
      const outAmount = pool.getOutAmount(USDC_MINT, new BN(1_000_000));
      console.log("USDT amount", outAmount.toString());
    });
  });

  describe("getVirtualPrice", () => {
    it("should return virtual price", async () => {
      const virtualPrice = pool.getVirtualPrice();
      console.log(virtualPrice);
    });
  });

  describe("getMaxInAmount", () => {
    it("should return maximum in amount, where the out amount < max out amount", async () => {
      const maxInAmount = pool.getMaxSwappableInAmount(pool.state.tokenAMint);
      console.log("maxInAmount", maxInAmount.toString());
      const outAmount = pool.getOutAmount(pool.state.tokenAMint, maxInAmount);
      const maxOutAmount = pool.getMaxSwappableOutAmount(pool.state.tokenBMint);
      console.log(maxOutAmount.toString(), outAmount.toString());
      console.log("Ratio: ", maxOutAmount.toNumber() / outAmount.toNumber());
      expect(outAmount.toNumber()).toBeLessThanOrEqual(maxOutAmount.toNumber());
    });
  });

  describe("computeImbalanceDeposit", () => {
    it("should return lp amount to receive", async () => {
      const depositAAmount = new BN(1_000_000);
      const depositBAmount = new BN(0);
      const lpAmount = pool.computeImbalanceDeposit(
        depositAAmount,
        depositBAmount
      );
      console.log(
        `lpAmount minted ${lpAmount.toNumber()} after deposit ${depositAAmount.toNumber()}`
      );
    });
  });

  describe("computeWithdrawOne", () => {
    it("should return token amount to receive", async () => {
      const lpAmount = new BN(1_000_000);
      const outAmount = pool.computeWithdrawOne(
        lpAmount,
        pool.state.tokenBMint
      );
      console.log(
        `lpAmount burned ${lpAmount.toNumber()} received ${outAmount.toNumber()}`
      );
    });
  });
});

describe("depeg-stable-swap pool", () => {
  let pool: Pool;

  describe("load", () => {
    it("should load the pool state", async () => {
      pool = await Pool.load(
        KEYPAIR.publicKey,
        AMM_PROGRAM,
        new PublicKey("7EJSgV2pthhDfb4UiER9vzTqe2eojei9GEQAQnkqJ96e")
      );
      expect(pool.state).not.toBeUndefined();
    });
  });

  describe("getTokensBalance", () => {
    it("should load the pool tokens balance", async () => {
      const [tokenABalance, tokenBBalance] = pool
        .getTokensBalance()
        .map((b) => b.toNumber());
      console.log(
        `tokenABalance ${tokenABalance}, tokenBBalance ${tokenBBalance}`
      );
      expect(tokenABalance).toBeGreaterThan(0);
      expect(tokenBBalance).toBeGreaterThan(0);
    });
  });

  describe("getMaxInAmount", () => {
    it("should return maximum in amount, where the out amount < max out amount", async () => {
      const maxInAmount = pool.getMaxSwappableInAmount(pool.state.tokenAMint);
      const outAmount = pool.getOutAmount(pool.state.tokenAMint, maxInAmount);
      const maxOutAmount = pool.getMaxSwappableOutAmount(pool.state.tokenBMint);
      console.log(maxOutAmount.toString(), outAmount.toString());
      console.log("Ratio: ", maxOutAmount.toNumber() / outAmount.toNumber());
      expect(outAmount.toNumber()).toBeLessThanOrEqual(maxOutAmount.toNumber());
    });
  });

  describe("computeD", () => {
    it("should return total liquidity", async () => {
      const [tokenABalance, tokenBBalance] = pool.getTokensBalance();
      const stableSwap = pool.swapCurve;
      const totalLiquidity = stableSwap.computeD(tokenABalance, tokenBBalance);
      console.log("totalLiquidity", totalLiquidity.toString());
      expect(totalLiquidity.toNumber()).toBeGreaterThan(0);
    });
  });

  describe("getVirtualPrice", () => {
    it("should return virtual price", async () => {
      const virtualPrice = pool.getVirtualPrice();
      console.log(virtualPrice);
    });
  });

  describe("getOutAmount", () => {
    it("should return SOL out amount", async () => {
      const outAmount = pool.getOutAmount(STSOL_MINT, new BN(1_000_000_000));
      console.log("SOL amount", outAmount.toString());
    });

    it("should return STSOL out amount", async () => {
      const outAmount = pool.getOutAmount(SOL_MINT, new BN(1_000_000_000));
      console.log("STSOL amount", outAmount.toString());
    });
  });

  describe("computeImbalanceDeposit", () => {
    it("should return lp amount to receive", async () => {
      const depositAAmount = new BN(0);
      const depositBAmount = new BN(1_000_000_000);
      const lpAmount = pool.computeImbalanceDeposit(
        depositAAmount,
        depositBAmount
      );
      console.log(
        `lpAmount minted ${lpAmount.toNumber()} after deposit ${depositBAmount.toNumber()}`
      );
    });
  });

  describe("computeWithdrawOne", () => {
    it("should return token amount to receive", async () => {
      const lpAmount = new BN(1_000_000_000);
      const outAmount = pool.computeWithdrawOne(
        lpAmount,
        pool.state.tokenBMint
      );
      console.log(
        `lpAmount burned ${lpAmount.toNumber()} received ${outAmount.toNumber()}`
      );
    });
  });
});

describe("constant-product pool", () => {
  let pool: Pool;

  describe("load", () => {
    it("should load the pool state", async () => {
      pool = await Pool.load(KEYPAIR.publicKey, AMM_PROGRAM, USDC_SOL_POOL);
      expect(pool.state).not.toBeUndefined();
    });
  });

  describe("getTokensBalance", () => {
    it("should load the pool tokens balance", async () => {
      const [tokenABalance, tokenBBalance] = pool
        .getTokensBalance()
        .map((b) => b.toNumber());
      console.log(
        `tokenABalance ${tokenABalance}, tokenBBalance ${tokenBBalance}`
      );
      expect(tokenABalance).toBeGreaterThan(0);
      expect(tokenBBalance).toBeGreaterThan(0);
    });
  });

  describe("getMaxOutAmount", () => {
    it("should return maximum swapable amount", async () => {
      const [tokenABalance, _] = pool
        .getTokensBalance()
        .map((b) => b.toNumber());
      const maxSwapableAmount = pool
        .getMaxSwappableOutAmount(pool.state.tokenAMint)
        .toNumber();
      console.log(
        `maxSwapableAmount ${maxSwapableAmount}, tokenAAmount ${tokenABalance}`
      );
      expect(maxSwapableAmount).toBeLessThanOrEqual(tokenABalance);
    });
  });

  describe("computeD", () => {
    it("should return total liquidity", async () => {
      const [tokenABalance, tokenBBalance] = pool.getTokensBalance();
      const constantProductSwap = pool.swapCurve;
      const totalLiquidity = constantProductSwap.computeD(
        tokenABalance,
        tokenBBalance
      );
      console.log("totalLiquidity", totalLiquidity.toString());
      expect(totalLiquidity.toNumber()).toBeGreaterThan(0);
    });
  });

  describe("getOutAmount", () => {
    it("should return USDC out amount", async () => {
      const outAmount = pool.getOutAmount(SOL_MINT, new BN(1_000_000_000));
      console.log(outAmount.toString());
    });

    it("should return WSOL out amount", async () => {
      const outAmount = pool.getOutAmount(USDC_MINT, new BN(100_000_000_000));
      console.log(outAmount.toString());
    });
  });

  describe("getVirtualPrice", () => {
    it("should return virtual price", async () => {
      const virtualPrice = pool.getVirtualPrice();
      console.log(virtualPrice);
    });
  });

  describe("getMaxInAmount", () => {
    it("should return maximum in amount, where the out amount < max out amount", async () => {
      const maxInAmount = pool.getMaxSwappableInAmount(pool.state.tokenAMint);
      const outAmount = pool.getOutAmount(pool.state.tokenAMint, maxInAmount);
      const maxOutAmount = pool.getMaxSwappableOutAmount(pool.state.tokenBMint);
      console.log(maxOutAmount.toString(), outAmount.toString());
      console.log("Ratio: ", maxOutAmount.toNumber() / outAmount.toNumber());
      expect(outAmount.toNumber()).toBeLessThanOrEqual(maxOutAmount.toNumber());
    });
  });

  describe("computeImbalanceDeposit", () => {
    it("should not be supported", async () => {
      const depositAAmount = new BN(100_000_000);
      const depositBAmount = new BN(0);
      let error: any = undefined;
      try {
        pool.computeImbalanceDeposit(depositAAmount, depositBAmount);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("computeWithdrawOne", () => {
    it("should not be supported", async () => {
      const lpAmount = new BN(1_000_000_000);
      let error: any = undefined;
      try {
        pool.computeWithdrawOne(lpAmount, pool.state.tokenBMint);
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe("read unix timestamp onchain", () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "processed");
  it("parsed clock account unix timestamp should relatively close to, or same as getBlockTime", async () => {
    const slot = await connection.getSlot();
    const [parsedClock, blockTime] = await Promise.all([
      connection.getParsedAccountInfo(SYSVAR_CLOCK_PUBKEY),
      connection.getBlockTime(slot),
    ]);
    let parsedClockAccount = (parsedClock.value!.data as ParsedAccountData)
      .parsed as ParsedClockState;
    console.log(blockTime, parsedClockAccount.info.unixTimestamp);
    expect(blockTime).toEqual(parsedClockAccount.info.unixTimestamp);
  });
});
