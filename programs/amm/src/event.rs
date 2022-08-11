//! Event module includes information about events of the program
use anchor_lang::prelude::*;

/// Add liquidity event
#[event]
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
pub struct PoolInfo {
    /// Total token A amount in the pool
    pub token_a_amount: u64,
    /// Total token B amount in the pool
    pub token_b_amount: u64,
    /// Current virtual price
    pub virtual_price: f64,
    /// Oldest virtual price from historical snapshots
    pub first_virtual_price: f64,
    /// Unix timestamp of oldest virtual price snapshot was token
    pub first_timestamp: u64,
    /// Current unix timestamp
    pub current_timestamp: u64,
    /// Pool APY
    pub apy: f64,
}
