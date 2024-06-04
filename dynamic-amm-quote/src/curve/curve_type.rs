//! Curve type
use anchor_lang::prelude::*;

use prog_dynamic_amm::constants::fee::*;
use prog_dynamic_amm::state::PoolFees;

pub const PERMISSIONLESS_AMP: u64 = 100;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default, Copy, Eq, PartialEq)]
/// Multiplier for the pool token. Used to normalized token with different decimal into the same precision.
pub struct TokenMultiplier {
    /// Multiplier for token A of the pool.
    pub token_a_multiplier: u64, // 8
    /// Multiplier for token B of the pool.
    pub token_b_multiplier: u64, // 8
    /// Record the highest token decimal in the pool. For example, Token A is 6 decimal, token B is 9 decimal. This will save value of 9.
    pub precision_factor: u8, // 1
}

impl TokenMultiplier {
    /// Upscale the token amount using token_a_multiplier.
    pub fn upscale_token_a(&self, token_amount: u128) -> Option<u128> {
        token_amount.checked_mul(self.token_a_multiplier.into())
    }
    /// Upscale the token amount using token_b_multiplier.
    pub fn upscale_token_b(&self, token_amount: u128) -> Option<u128> {
        token_amount.checked_mul(self.token_b_multiplier.into())
    }

    /// Downscale the token amount using token_a_multiplier
    pub fn downscale_token_a(&self, token_amount: u128) -> Option<u128> {
        token_amount.checked_div(self.token_a_multiplier.into())
    }
    /// Downscale the token amount using token_b_multiplier
    pub fn downscale_token_b(&self, token_amount: u128) -> Option<u128> {
        token_amount.checked_div(self.token_b_multiplier.into())
    }
}

/// Type of depeg pool
#[derive(Clone, Copy, Debug, AnchorDeserialize, AnchorSerialize, PartialEq)]
pub enum DepegType {
    /// Indicate that it is not a depeg pool
    None,
    /// A depeg pool belongs to marinade finance
    Marinade,
    /// A depeg pool belongs to solido
    Lido,
    /// A depeg pool belongs to SPL stake pool program
    SplStake,
}

impl DepegType {
    /// Check whether the pool is a depeg pool or not
    pub fn is_none(&self) -> bool {
        matches!(self, DepegType::None)
    }
}

impl Default for DepegType {
    fn default() -> Self {
        Self::None
    }
}

/// Contains information for depeg pool
#[derive(Clone, Copy, Debug, Default, AnchorSerialize, AnchorDeserialize)]
pub struct Depeg {
    /// The virtual price of staking / interest bearing token
    pub base_virtual_price: u64,
    /// The virtual price of staking / interest bearing token
    pub base_cache_updated: u64,
    /// Type of the depeg pool
    pub depeg_type: DepegType,
}

#[derive(Clone, Copy, Debug, AnchorDeserialize, AnchorSerialize)]
/// Type of the swap curve
pub enum CurveType {
    /// Uniswap-style constant product curve, invariant = token_a_amount * token_b_amount
    ConstantProduct,
    /// Stable, like uniswap, but with wide zone of 1:1 instead of one point
    Stable {
        /// Amplification coefficient
        amp: u64,
        /// Multiplier for the pool token. Used to normalized token with different decimal into the same precision.
        token_multiplier: TokenMultiplier,
        /// Depeg pool information. Contains functions to allow token amount to be repeg using stake / interest bearing token virtual price
        depeg: Depeg,
        /// The last amp updated timestamp. Used to prevent update_curve_info called infinitely many times within a short period
        last_amp_updated_timestamp: u64,
    },
}

impl Default for CurveType {
    fn default() -> Self {
        Self::Stable {
            amp: PERMISSIONLESS_AMP,
            token_multiplier: TokenMultiplier::default(),
            depeg: Depeg::default(),
            last_amp_updated_timestamp: 0,
        }
    }
}

impl CurveType {
    /// Determine whether the curve type is the same regardless of the curve parameters.
    pub fn is_same_type(&self, other: &CurveType) -> bool {
        matches!(
            (self, other),
            (CurveType::Stable { .. }, CurveType::Stable { .. })
                | (
                    CurveType::ConstantProduct { .. },
                    CurveType::ConstantProduct { .. }
                )
        )
    }
    /// Get default fee settings
    pub fn get_default_fee(&self) -> PoolFees {
        match self {
            CurveType::ConstantProduct {} => PoolFees {
                trade_fee_numerator: CONSTANT_PRODUCT_TRADE_FEE_NUMERATOR,
                trade_fee_denominator: FEE_DENOMINATOR,
                protocol_trade_fee_numerator: CONSTANT_PRODUCT_PROTOCOL_TRADE_FEE_NUMERATOR,
                protocol_trade_fee_denominator: FEE_DENOMINATOR,
            },
            CurveType::Stable { .. } => PoolFees {
                trade_fee_numerator: STABLE_SWAP_TRADE_FEE_NUMERATOR,
                trade_fee_denominator: FEE_DENOMINATOR,
                protocol_trade_fee_numerator: STABLE_SWAP_PROTOCOL_TRADE_FEE_NUMERATOR,
                protocol_trade_fee_denominator: FEE_DENOMINATOR,
            },
        }
    }

    /// Get allowed trade fee bps
    pub fn get_allowed_trade_fee_bps(&self) -> &[u64] {
        match self {
            CurveType::ConstantProduct {} => &[25, 100, 400, 600],
            CurveType::Stable { .. } => &[1, 4, 10, 100],
        }
    }
}
