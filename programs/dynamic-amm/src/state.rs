//! Pool account state

// use crate::curve::base::SwapCurve;
// use crate::curve::curve_type::CurveType;
// use crate::curve::fees::PoolFees;
// use crate::error::PoolError;
// use crate::math::safe_math::SafeMath;
// use crate::math::u128x128_math::{shl_div, Rounding, SCALE_OFFSET};
// use crate::math::utils_math::safe_mul_div_cast;
// use crate::utils::to_u64;
use anchor_lang::prelude::*;
use std::fmt::Debug;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Debug, Clone, Copy)]
/*
   1. [T; 32], 32 size chosen because it is natively supported by Anchor SeDer, and it support from 1 to 32 continuously without breaking.
      Refer: https://docs.rs/borsh/latest/borsh/de/trait.BorshDeserialize.html#impl-BorshDeserialize-for-%5BT%3B%2032%5D
      Manual implementing of Anchor SeDer causes anchor build failed to generate the IDL
   2. Wrapping the padding in padding struct to make it look nicer when we add new field in the future.
        Eg: struct NewPoolStruct {
            ... old fields
            new_field: u8,
            padding: Padding,
            curve_type: CurveType,
        }
      Because we add a new field with the size of 1 byte, therefore we will have to modify the Padding struct to
      struct Padding {
        pub _1: [u8; 15], // 15
        pub padding: [u128; 31] // 496
      }
      Total remaining padding will be 511
      This allows us to continue to use Anchor SeDer derive, and generate the correct IDL
*/
/// Padding for future pool fields
pub struct Padding {
    /// Padding 0
    pub padding_0: [u8; 7], // 7
    /// Padding 1
    pub padding: [u128; 29], // 464
}

impl Padding {
    /// Space for rental
    pub const SPACE: usize = 471;
}

/// Host fee
pub struct HostFee<'c, 'info> {
    /// Host fee
    pub host_fee: u64,
    /// Account to receive host fee
    pub host_fee_account: &'c AccountInfo<'info>,
}

/// Pool type
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub enum PoolType {
    /// Permissioned
    Permissioned,
    /// Permissionless
    Permissionless,
}
impl Default for PoolType {
    fn default() -> Self {
        PoolType::Permissioned
    }
}

#[account]
#[derive(Debug)]
/// State of pool account
pub struct Pool {
    /// LP token mint of the pool
    pub lp_mint: Pubkey, //32
    /// Token A mint of the pool. Eg: USDT
    pub token_a_mint: Pubkey, //32
    /// Token B mint of the pool. Eg: USDC
    pub token_b_mint: Pubkey, //32
    /// Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Pubkey, //32
    /// Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Pubkey, //32
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Pubkey, //32
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Pubkey, //32
    /// "A" vault lp bump. Used to create signer seeds.
    pub a_vault_lp_bump: u8, //1
    /// Flag to determine whether the pool is enabled, or disabled.
    pub enabled: bool, //1
    /// Admin fee token account for token A. Used to receive trading fee.
    pub admin_token_a_fee: Pubkey, //32
    /// Admin fee token account for token B. Used to receive trading fee.
    pub admin_token_b_fee: Pubkey, //32
    /// Owner of the pool.
    pub admin: Pubkey, //32
    /// Store the fee charges setting.
    pub fees: PoolFees, //48
    /// Pool type
    pub pool_type: PoolType,
    /// Stake pubkey of SPL stake pool
    pub stake: Pubkey,
    /// Total locked lp token
    pub total_locked_lp: u64,
    /// Padding for future pool field
    pub padding: Padding, // 512 Refer: curve_type.rs for the test
    /// The type of the swap curve supported by the pool.
    // Leaving curve_type as last field give us the flexibility to add specific curve information / new curve type
    pub curve_type: CurveType, //9
}

#[account]
#[derive(Default, Debug)]
/// State of lock escrow account
pub struct LockEscrow {
    /// Pool address
    pub pool: Pubkey,
    /// Owner address
    pub owner: Pubkey,
    /// Vault address, store the lock user lock
    pub escrow_vault: Pubkey,
    /// bump, used to sign
    pub bump: u8,
    /// Total locked amount
    pub total_locked_amount: u64,
    /// Lp per token, virtual price of lp token
    pub lp_per_token: u128,
    /// Unclaimed fee pending
    pub unclaimed_fee_pending: u64,
    /// Total a fee claimed so far
    pub a_fee: u64,
    /// Total b fee claimed so far
    pub b_fee: u64,
}

/// Information regarding fee charges
#[derive(Copy, Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct PoolFees {
    /// Trade fees are extra token amounts that are held inside the token
    /// accounts during a trade, making the value of liquidity tokens rise.
    /// Trade fee numerator
    pub trade_fee_numerator: u64,
    /// Trade fee denominator
    pub trade_fee_denominator: u64,

    /// Owner trading fees are extra token amounts that are held inside the token
    /// accounts during a trade, with the equivalent in pool tokens minted to
    /// the owner of the program.
    /// Owner trade fee numerator
    pub owner_trade_fee_numerator: u64,
    /// Owner trade fee denominator
    pub owner_trade_fee_denominator: u64,
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
/// Contains information for depeg pool
#[derive(Clone, Copy, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct Depeg {
    /// The virtual price of staking / interest bearing token
    pub base_virtual_price: u64,
    /// The virtual price of staking / interest bearing token
    pub base_cache_updated: u64,
    /// Type of the depeg pool
    pub depeg_type: DepegType,
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
