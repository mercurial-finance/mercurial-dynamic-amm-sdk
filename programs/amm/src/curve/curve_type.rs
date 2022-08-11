//! Curve type
use anchor_lang::prelude::*;

// full bytes size reserved for curve data, which includes the buffer
const PADDING_SIZE: usize = 512;

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
    /// Return space for rental
    pub const fn space() -> usize {
        17
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
}

impl Default for DepegType {
    fn default() -> Self {
        Self::None
    }
}

impl DepegType {
    /// Return space for rental
    pub fn space() -> usize {
        1
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

impl Depeg {
    /// Return space for rental
    pub fn space() -> usize {
        16 + DepegType::space()
    }
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
    },
}

impl Default for CurveType {
    fn default() -> Self {
        Self::Stable {
            amp: 60,
            token_multiplier: TokenMultiplier::default(),
            depeg: Depeg::default(),
        }
    }
}

impl CurveType {
    /// Get space for rental
    pub fn space() -> usize {
        1 + PADDING_SIZE
    }

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
}
