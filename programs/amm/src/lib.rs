pub mod constants;
pub mod context;
pub mod curve;
pub mod error;
pub mod event;
pub mod state;
pub mod utils;
pub mod vault_utils;

use crate::context::*;
use anchor_lang::prelude::*;

declare_id!("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");

#[program]
pub mod amm {

    use super::*;
    /// Swap token A to B, or vice versa. An amount of trading fee will be charged for liquidity provider, and the admin of the pool.
    pub fn swap<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, Swap<'info>>,
        in_amount: u64,
        minimum_out_amount: u64,
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

    /// Withdraw tokens from the pool in a balanced ratio.
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

    /// Synchronize APY of the pool. This function snapshot the virtual price of the pool upon invoke. The historical virtual price will be used to calculate the pool APY. APY can be retrieved by simulating get_pool_info function.
    pub fn sync_apy(ctx: Context<SyncApy>) -> Result<()> {
        Ok(())
    }

    /// Get the general information of the pool by using simulate.
    pub fn get_pool_info(ctx: Context<GetPoolInfo>) -> Result<()> {
        Ok(())
    }
}
