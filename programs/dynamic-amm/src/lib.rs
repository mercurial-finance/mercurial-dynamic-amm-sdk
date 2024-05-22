//! Mercurial Dynamic AMM
#![deny(rustdoc::all)]
#![allow(rustdoc::missing_doc_code_examples)]
#![warn(clippy::unwrap_used)]
#![warn(clippy::integer_arithmetic)]
#![allow(warnings)]

pub mod event;
pub mod instructions;
pub mod state;

use crate::state::CurveType;
use anchor_lang::prelude::*;
use instructions::*;

#[cfg(feature = "staging")]
declare_id!("ammbh4CQztZ6txJ8AaQgPsWjd6o7GhmvopS2JAo5bCB");

#[cfg(not(feature = "staging"))]
declare_id!("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");

/// Program for AMM
#[program]
pub mod dynamic_amm {
    use super::*;

    /// Initialize a new permissionless pool with customized fee tier
    pub fn initialize_permissionless_pool_with_fee_tier(
        ctx: Context<InitializePermissionlessPoolWithFeeTier>,
        curve_type: CurveType,
        trade_fee_bps: u64,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Withdraw only single token from the pool. Only supported by pool with stable swap curve.
    pub fn remove_liquidity_single_side(
        ctx: Context<RemoveLiquiditySingleSide>,
        pool_token_amount: u64,
        minimum_out_amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Deposit tokens to the pool in an imbalance ratio. Only supported by pool with stable swap curve.
    pub fn add_imbalance_liquidity(
        ctx: Context<AddOrRemoveBalanceLiquidity>,
        minimum_pool_token_amount: u64,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Swap token A to B, or vice versa. An amount of trading fee will be charged for liquidity provider, and the admin of the pool.
    pub fn swap<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, Swap<'info>>,
        in_amount: u64,
        minimum_out_amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Withdraw tokens from the pool in a balanced ratio. User will still able to withdraw from pool even the pool is disabled. This allow user to exit their liquidity when there's some unforeseen event happen.
    pub fn remove_balance_liquidity(
        ctx: Context<AddOrRemoveBalanceLiquidity>,
        pool_token_amount: u64,
        minimum_a_token_out: u64,
        minimum_b_token_out: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Deposit tokens to the pool in a balanced ratio.
    pub fn add_balance_liquidity(
        ctx: Context<AddOrRemoveBalanceLiquidity>,
        pool_token_amount: u64,
        maximum_token_a_amount: u64,
        maximum_token_b_amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Get the general information of the pool.
    pub fn get_pool_info(ctx: Context<GetPoolInfo>) -> Result<()> {
        Ok(())
    }

    /// Bootstrap the pool when liquidity is depleted.
    pub fn bootstrap_liquidity(
        ctx: Context<BootstrapLiquidity>,
        token_a_amount: u64,
        token_b_amount: u64,
    ) -> Result<()> {
        Ok(())
    }

    /// Create lock account
    pub fn create_lock_escrow(ctx: Context<CreateLockEscrow>) -> Result<()> {
        Ok(())
    }

    /// Lock Lp token
    pub fn lock(ctx: Context<Lock>, amount: u64) -> Result<()> {
        Ok(())
    }

    /// Claim fee
    pub fn claim_fee(ctx: Context<ClaimFee>, max_amount: u64) -> Result<()> {
        Ok(())
    }
}
