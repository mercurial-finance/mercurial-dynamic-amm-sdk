import { Wallet } from "@project-serum/anchor";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  ParsedAccountData,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { expect } from "chai";
import "mocha";
import { ConstantProductSwap } from "../src/curve/constant-product";
import { StableSwap } from "../src/curve/index";
import Pool from "../src/pool";
import {
  ConstantProductCurve,
  ParsedClockState,
  StableSwapCurve,
} from "../src/types/pool_state";

const USDT_MINT = new PublicKey("9NGDi2tZtNmCCp8SVLKNuGjuWAVwNF3Vap5tT8km5er9");
const USDC_MINT = new PublicKey("zVzi5VAf4qMEwzv7NXECVx5v2pQ7xnqVVjCXZwS9XzA");
const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

const stableSwapCurve: StableSwapCurve = {
  stable: {
    amp: new BN(30),
  },
};

const constantProductCurve: ConstantProductCurve = {
  constantProduct: {},
};

describe("computePoolAccount", () => {
  it("should correctly compute the pool account", async () => {
    const poolAddress = await Pool.computePoolAccount(
      USDC_MINT,
      USDT_MINT,
      stableSwapCurve
    );
    expect(poolAddress.toBase58()).to.be.equal(
      "612wjkPj8nVreur2FsoQBsHkJgRarihkthjGRxrabGbH"
    );
  });

  it("should correctly compute the same pool account regardless of the token order", async () => {
    const poolAddressOne = await Pool.computePoolAccount(
      USDC_MINT,
      USDT_MINT,
      stableSwapCurve
    );
    const poolAddressTwo = await Pool.computePoolAccount(
      USDT_MINT,
      USDC_MINT,
      stableSwapCurve
    );
    expect(poolAddressOne.toBase58()).to.be.equal(poolAddressTwo.toBase58());
  });

  it("should compute different pool account when curve type is different", async () => {
    const poolAddress = await Pool.computePoolAccount(
      USDC_MINT,
      USDT_MINT,
      constantProductCurve
    );
    expect(poolAddress.toBase58()).to.be.equal(
      "5cyvaW1WqTkZ1Y6pK7zV66mTV5e5TsM49fhsXKBS45ZM"
    );
  });
});

describe("stable-swap pool", () => {
  const pool = new Pool(
    new Wallet(Keypair.generate()),
    new Connection(clusterApiUrl("devnet"))
  );

  describe("load", () => {
    it("should load the pool state", async () => {
      const poolUSDC_USDT = await Pool.computePoolAccount(
        USDC_MINT,
        USDT_MINT,
        stableSwapCurve
      );
      await pool.load(poolUSDC_USDT);
      expect(pool.state).not.undefined;
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
      expect(tokenABalance).to.be.greaterThan(0);
      expect(tokenBBalance).to.be.greaterThan(0);
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
      expect(maxSwapableAmount).to.be.lessThanOrEqual(tokenBBalance);
    });
  });

  describe("computeD", () => {
    it("should return total liquidity", async () => {
      const [tokenABalance, tokenBBalance] = pool.getTokensBalance();
      const curveType = pool.state.curveType as StableSwapCurve;
      const stableSwap = new StableSwap(curveType.stable.amp.toNumber());
      const totalLiquidity = stableSwap.computeD(tokenABalance, tokenBBalance);
      console.log("totalLiquidity", totalLiquidity.toString());
      expect(totalLiquidity.toNumber()).to.be.greaterThan(0);
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
      expect(outAmount.toNumber()).to.be.lessThanOrEqual(
        maxOutAmount.toNumber()
      );
    });
  });
});

describe("constant-product pool", () => {
  const pool = new Pool(
    new Wallet(Keypair.generate()),
    new Connection(clusterApiUrl("devnet"))
  );

  describe("load", () => {
    it("should load the pool state", async () => {
      const poolWSOL_USDT = await Pool.computePoolAccount(
        WSOL_MINT,
        USDT_MINT,
        constantProductCurve
      );
      await pool.load(poolWSOL_USDT);
      expect(pool.state).not.undefined;
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
      expect(tokenABalance).to.be.greaterThan(0);
      expect(tokenBBalance).to.be.greaterThan(0);
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
      expect(maxSwapableAmount).to.be.lessThanOrEqual(tokenABalance);
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
      expect(totalLiquidity.toNumber()).to.be.greaterThan(0);
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
      expect(outAmount.toNumber()).to.be.lessThanOrEqual(
        maxOutAmount.toNumber()
      );
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
    let parsedClockAccount = (parsedClock.value.data as ParsedAccountData)
      .parsed as ParsedClockState;
    console.log(blockTime, parsedClockAccount.info.unixTimestamp);
    expect(blockTime).to.be.equal(parsedClockAccount.info.unixTimestamp);
  });
});
