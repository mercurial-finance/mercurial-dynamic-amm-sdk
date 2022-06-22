import { AnchorProvider, Wallet } from "@project-serum/anchor";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { Pool, StableSwap } from "../index";
import { ConstantProductSwap } from "../src/curve/constant-product";
import { ParsedClockState, StableSwapCurve } from "../src/types/pool_state";

const USDT_MINT = new PublicKey("9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9");
const USDC_MINT = new PublicKey("zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA");
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

const stableSwapCurve = {
  stable: {
    amp: new BN(30),
  },
};

const constantProductCurve = {
  constantProduct: {},
};

const KEYPAIR = Keypair.generate();
const PROVIDER = new AnchorProvider(
  new Connection(clusterApiUrl("devnet")),
  new Wallet(KEYPAIR),
  {}
);

const AMM_PROGRAM = Pool.createProgram(PROVIDER);

describe("computePoolAccount", () => {
  it("should correctly compute the pool account", async () => {
    const poolAddress = Pool.computePoolAddress(
      USDC_MINT,
      USDT_MINT,
      stableSwapCurve
    );
    expect(poolAddress.toBase58()).toEqual(
      "612wjkPj8nVreur2FsoQBsHkJgRarihkthjGRxrabGbH"
    );
  });

  it("should correctly compute the same pool account regardless of the token order", async () => {
    const poolAddressOne = Pool.computePoolAddress(
      USDC_MINT,
      USDT_MINT,
      stableSwapCurve
    );
    const poolAddressTwo = Pool.computePoolAddress(
      USDT_MINT,
      USDC_MINT,
      stableSwapCurve
    );
    expect(poolAddressOne.toBase58()).toEqual(poolAddressTwo.toBase58());
  });

  it("should compute different pool account when curve type is different", async () => {
    const poolAddress = Pool.computePoolAddress(
      USDC_MINT,
      USDT_MINT,
      constantProductCurve
    );
    expect(poolAddress.toBase58()).toEqual(
      "5cyvaW1WqTkZ1Y6pK7zV66mTV5e5TsM49fhsXKBS45ZM"
    );
  });
});

describe("stable-swap pool", () => {
  let pool: Pool;

  describe("load", () => {
    it("should load the pool state", async () => {
      const poolUSDC_USDT = Pool.computePoolAddress(
        USDC_MINT,
        USDT_MINT,
        stableSwapCurve
      );
      pool = await Pool.load(KEYPAIR.publicKey, AMM_PROGRAM, poolUSDC_USDT);
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
      const curveType = pool.state.curveType as StableSwapCurve;
      const stableSwap = new StableSwap(curveType.stable.amp.toNumber());
      const totalLiquidity = stableSwap.computeD(tokenABalance, tokenBBalance);
      console.log("totalLiquidity", totalLiquidity.toString());
      expect(totalLiquidity.toNumber()).toBeGreaterThan(0);
    });
  });

  describe("getOutAmount", () => {
    it("should return USDC out amount", async () => {
      const outAmount = pool.getOutAmount(USDT_MINT, new BN(1_000_000_000));
      console.log(outAmount.toString());
    });

    it("should return USDT out amount", async () => {
      const outAmount = pool.getOutAmount(USDC_MINT, new BN(1_000_000));
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
});

describe("constant-product pool", () => {
  let pool: Pool;

  describe("load", () => {
    it("should load the pool state", async () => {
      const poolWSOL_USDT = Pool.computePoolAddress(
        WSOL_MINT,
        USDT_MINT,
        constantProductCurve
      );
      pool = await Pool.load(KEYPAIR.publicKey, AMM_PROGRAM, poolWSOL_USDT);
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
      const constantProductSwap = new ConstantProductSwap();
      const totalLiquidity = constantProductSwap.computeD(
        tokenABalance,
        tokenBBalance
      );
      console.log("totalLiquidity", totalLiquidity.toString());
      expect(totalLiquidity.toNumber()).toBeGreaterThan(0);
    });
  });

  describe("getOutAmount", () => {
    it("should return USDT out amount", async () => {
      const outAmount = pool.getOutAmount(WSOL_MINT, new BN(1_000_000_000));
      console.log(outAmount.toString());
    });

    it("should return WSOL out amount", async () => {
      const outAmount = pool.getOutAmount(USDT_MINT, new BN(100_000_000_000));
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
});

describe("read unix timestamp onchain", () => {
  const connection = new Connection(clusterApiUrl("devnet"), "processed");
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
