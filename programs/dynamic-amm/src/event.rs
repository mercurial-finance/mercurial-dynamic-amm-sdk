//! Event module includes information about events of the program
use anchor_lang::prelude::*;

use crate::state::PoolType;

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

/// Bootstrap liquidity event
#[event]
pub struct BootstrapLiquidity {
    /// LP amount user received upon add liquidity.
    pub lp_mint_amount: u64,
    /// Amount of token A user deposited.
    pub token_a_amount: u64,
    /// Amount of token B user deposited.
    pub token_b_amount: u64,
    /// Pool address
    pub pool: Pubkey,
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
    /// Trading fee charged for the protocol.
    pub protocol_fee: u64,
    /// Host fee charged
    pub host_fee: u64,
}

/// Set pool fees event
#[event]
pub struct SetPoolFees {
    /// New trade fee numerator
    pub trade_fee_numerator: u64,
    /// New trade fee denominator
    pub trade_fee_denominator: u64,
    /// New protocol fee numerator
    pub protocol_trade_fee_numerator: u64,
    /// New protocol fee denominator
    pub protocol_trade_fee_denominator: u64,
    /// Pool address
    pub pool: Pubkey,
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
    /// Current unix timestamp
    pub current_timestamp: u64,
}

/// Transfer admin event
#[event]
pub struct TransferAdmin {
    /// Old admin of the pool
    pub admin: Pubkey,
    /// New admin of the pool
    pub new_admin: Pubkey,
    /// Pool address
    pub pool: Pubkey,
}

/// Override curve param event
#[event]
pub struct OverrideCurveParam {
    /// The new amplification for stable curve
    pub new_amp: u64,
    /// Updated timestamp
    pub updated_timestamp: u64,
    /// Pool address
    pub pool: Pubkey,
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
    /// Pool type
    pub pool_type: PoolType,
    /// Pool address
    pub pool: Pubkey,
}

/// Pool enabled state change event
#[event]
pub struct PoolEnabled {
    /// Pool address
    pub pool: Pubkey,
    /// Pool enabled state
    pub enabled: bool,
}

/// Create lock escrow
#[event]
pub struct CreateLockEscrow {
    /// Pool address
    pub pool: Pubkey,
    /// Owner of lock escrow
    pub owner: Pubkey,
}

/// Lock
#[event]
pub struct Lock {
    /// Pool address
    pub pool: Pubkey,
    /// Owner of lock escrow
    pub owner: Pubkey,
    /// Locked amount
    pub amount: u64,
}

/// Claim fee
#[event]
pub struct ClaimFee {
    /// Pool address
    pub pool: Pubkey,
    /// Owner of lock escrow
    pub owner: Pubkey,
    /// Lp amount
    pub amount: u64,
    /// A fee
    pub a_fee: u64,
    /// B fee
    pub b_fee: u64,
}

/// Create config
#[event]
pub struct CreateConfig {
    /// New trade fee numerator
    pub trade_fee_numerator: u64,
    /// New protocol fee numerator
    pub protocol_trade_fee_numerator: u64,
    /// Config pubkey
    pub config: Pubkey,
}

/// Close config
#[event]
pub struct CloseConfig {
    /// Config pubkey
    pub config: Pubkey,
}
