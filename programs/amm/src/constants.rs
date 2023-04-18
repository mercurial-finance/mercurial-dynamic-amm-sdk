//! Constants module includes constants value of the program

/// Minimum seconds between last AMP changes
pub static MIN_CHANGE_AMP_DURATION: u64 = 600; // 10 minutes

#[deprecated]
/// Store constants related to PDA seeds
pub mod seeds {
    /// Prefix for apy PDA
    pub static APY_PREFIX: &str = "apy";
}

/// Store constants related to fees
pub mod fee {
    /// Trade fee numerator for constant product swap curve.
    // 25bps, https://docs.uniswap.org/protocol/V2/concepts/advanced-topics/fees
    pub static CONSTANT_PRODUCT_TRADE_FEE_NUMERATOR: u64 = 250;

    /// Trade fee numerator for stable swap curve.
    // 1bps, https://curve.fi/rootfaq
    pub static STABLE_SWAP_TRADE_FEE_NUMERATOR: u64 = 10;

    /// Admin trade fee numerator for constant product swap curve.
    // 5bps, https://docs.uniswap.org/protocol/V2/concepts/advanced-topics/fees
    pub static CONSTANT_PRODUCT_ADMIN_TRADE_FEE_NUMERATOR: u64 = 50;

    /// Admin trade fee numerator for stable swap curve.
    // 2bps, https://curve.fi/rootfaq
    pub static STABLE_SWAP_ADMIN_TRADE_FEE_NUMERATOR: u64 = 5;

    /// Host trade fee numerator
    // 20% of admin trade fee
    pub static HOST_TRADE_FEE_NUMERATOR: u64 = 20000;

    /// Default fee denominator
    pub static FEE_DENOMINATOR: u64 = 100000;
    /// Max fee BPS
    pub static MAX_FEE_BPS: u64 = 1000; // 1%
}

/// Store constants related to virtual price
pub mod virtual_price {
    /// Decimal price of virtual price
    pub const DECIMAL: u8 = 8;
    /// Precision for virtual price calculation
    // Up-scaling, safe
    pub const PRECISION: i32 = 10_i32.pow(DECIMAL as u32);
}

/// Store constants related to stable swap curve

pub mod stable_curve {
    /// Maximum supported amplification coefficient
    pub const MAX_AMP: u64 = 10_000;
    /// Maximum ramping of amplification coefficient
    pub const MAX_A_CHANGE: u64 = MAX_AMP;
}

/// Store constants related to depeg pool
pub mod depeg {
    /// Base virtual time caching time, 10 minutes
    pub const BASE_CACHE_EXPIRES: u64 = 60 * 10;
    /// Precision for depeg pool virtual price calculation, 6 has been chosen because most of the token was 6 d.p
    pub const PRECISION: u64 = 10_u64.pow(6_u32);
}
