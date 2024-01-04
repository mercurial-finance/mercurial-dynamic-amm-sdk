//! Event module includes information about events of the program
use anchor_lang::prelude::*;
use crate::curve::fees::PoolFees;
use crate::curve::curve_type::CurveType;
use crate::state::{Padding, PoolType};

/// Add liquidity event
#[event]
#[derive(Debug, Clone, Copy)]
pub struct AddLiquidity {
    /// LP amount user received upon add liquidity.
    pub lp_mint_amount: u64,
    /// Amount of token A user deposited.
    pub token_a_amount: u64,
    /// Amount of token B user deposited.
    pub token_b_amount: u64,
}

/// Remove liquidity event
#[event]
#[derive(Debug, Clone, Copy)]
pub struct RemoveLiquidity {
    /// LP amount burned from user upon add remove liquidity.
    pub lp_unmint_amount: u64,
    /// Amount of token A user received.
    pub token_a_out_amount: u64,
    /// Amount of token B user received.
    pub token_b_out_amount: u64,
}

/// Swap event
#[event]
#[derive(Debug, Clone, Copy)]
pub struct Swap {
    /// Token amount user deposited to the pool for token exchange.
    pub in_amount: u64,
    /// Token amount user received from the pool.
    pub out_amount: u64,
    /// Trading fee charged for liquidity provider.
    pub trade_fee: u64,
    /// Trading fee charged for admin.
    pub admin_fee: u64,
    /// Host fee charged
    pub host_fee: u64,
}

/// Pool info event
#[event]
#[derive(Debug, Clone, Copy)]
pub struct PoolInfo {
    /// Total token A amount in the pool
    pub token_a_amount: u64,
    /// Total token B amount in the pool
    pub token_b_amount: u64,
    /// Current virtual price
    pub virtual_price: f64,
    /// Current unix timestamp
    pub current_timestamp: u64,
}

/// New pool created event
#[event]
pub struct PoolCreated {
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
    /// Padding for future pool field
    pub padding: Padding, // 512 Refer: curve_type.rs for the test
    /// The type of the swap curve supported by the pool.
    // Leaving curve_type as last field give us the flexibility to add specific curve information / new curve type
    pub curve_type: CurveType, //9
}