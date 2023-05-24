use std::collections::HashMap;

use anchor_lang::prelude::{Clock, Pubkey, Result};
use anchor_spl::token::{Mint, TokenAccount};
use anyhow::{ensure, Context};
use mercurial_vault::state::Vault;
use spl_token_swap::curve::calculator::TradeDirection;

use crate::{
    context::{get_curve_type, get_first_key, get_second_key, get_trade_fee_bps_bytes},
    curve::curve_type::CurveType,
    depeg::update_base_virtual_price,
    error::PoolError,
    math::{get_swap_curve, SwapResult},
    state::Pool,
};

pub struct VaultInfo {
    /// Amount of vault lp hold by the pool
    pub lp_amount: u64,
    /// Vault lp mint supply
    pub lp_supply: u64,
    /// Vault state
    pub vault: Vault,
}

pub struct QuoteData {
    /// Pool state to swap
    pub pool: Pool,
    /// Vault state of vault A
    pub vault_a: Vault,
    /// Vault state of vault B
    pub vault_b: Vault,
    /// Pool vault A LP token
    pub pool_vault_a_lp_token: TokenAccount,
    /// Pool vault B LP token
    pub pool_vault_b_lp_token: TokenAccount,
    /// Lp mint of vault A
    pub vault_a_lp_mint: Mint,
    /// Lp mint of vault B
    pub vault_b_lp_mint: Mint,
    /// Token account of vault A
    pub vault_a_token: TokenAccount,
    /// Token account of vault B
    pub vault_b_token: TokenAccount,
    /// Clock account
    pub clock: Clock,
    /// Stake account data. Only for depeg pools
    pub stake_data: HashMap<Pubkey, Vec<u8>>,
}

pub struct QuoteResult {
    /// Swap out amount
    pub out_amount: u64,
    /// Total fee amount. Fee is charged based on in token mint.
    pub fee: u64,
}

pub fn compute_quote(
    in_token_mint: Pubkey,
    in_amount: u64,
    quote_data: QuoteData,
) -> anyhow::Result<QuoteResult> {
    let QuoteData {
        mut pool,
        vault_a,
        vault_b,
        pool_vault_a_lp_token,
        pool_vault_b_lp_token,
        vault_a_lp_mint,
        vault_b_lp_mint,
        vault_a_token,
        vault_b_token,
        clock,
        stake_data,
    } = quote_data;

    update_base_virtual_price(&mut pool, &clock, stake_data)?;

    let current_time: u64 = clock.unix_timestamp.try_into()?;

    ensure!(
        in_token_mint == pool.token_a_mint || in_token_mint == pool.token_b_mint,
        "In token mint not matches with pool token mints"
    );

    let token_a_amount = vault_a
        .get_amount_by_share(
            current_time,
            pool_vault_a_lp_token.amount,
            vault_a_lp_mint.supply,
        )
        .context("Fail to get token a amount")?;

    let token_b_amount = vault_b
        .get_amount_by_share(
            current_time,
            pool_vault_b_lp_token.amount,
            vault_b_lp_mint.supply,
        )
        .context("Fail to get token b amount")?;

    let trade_direction = if in_token_mint == pool.token_a_mint {
        TradeDirection::AtoB
    } else {
        TradeDirection::BtoA
    };

    let (
        in_vault,
        out_vault,
        in_vault_lp_mint,
        out_vault_lp_mint,
        out_vault_token_account,
        in_token_total_amount,
        out_token_total_amount,
    ) = match trade_direction {
        TradeDirection::AtoB => (
            vault_a,
            vault_b,
            vault_a_lp_mint,
            vault_b_lp_mint,
            vault_b_token,
            token_a_amount,
            token_b_amount,
        ),
        TradeDirection::BtoA => (
            vault_b,
            vault_a,
            vault_b_lp_mint,
            vault_a_lp_mint,
            vault_a_token,
            token_b_amount,
            token_a_amount,
        ),
    };

    let trade_fee = pool
        .fees
        .trading_fee(in_amount.into())
        .context("Fail to calculate trading fee")?;

    let owner_fee = pool
        .fees
        .owner_trading_fee(in_amount.into())
        .context("Fail to calculate owner trading fee")?;

    let in_amount_after_owner_fee = in_amount
        .checked_sub(owner_fee.try_into()?)
        .context("Fail to calculate in_amount_after_owner_fee")?;

    let in_vault_lp = in_vault
        .getunmint_amount(
            current_time,
            in_amount_after_owner_fee,
            in_vault_lp_mint.supply,
        )
        .context("Fail to get in_vault_lp")?;

    let actual_in_amount = in_vault
        .get_amount_by_share(current_time, in_vault_lp, in_vault_lp_mint.supply)
        .context("Fail to get actual_in_amount")?;

    let actual_in_amount_after_fee = actual_in_amount
        .checked_sub(trade_fee.try_into()?)
        .context("Fail to calculate in_amount_after_fee")?;

    let swap_curve = get_swap_curve(pool.curve_type);

    let SwapResult {
        destination_amount_swapped,
        ..
    } = swap_curve
        .swap(
            actual_in_amount_after_fee,
            in_token_total_amount,
            out_token_total_amount,
            trade_direction,
        )
        .context("Fail to get swap result")?;

    let out_vault_lp = out_vault
        .getunmint_amount(
            current_time,
            destination_amount_swapped.try_into()?,
            out_vault_lp_mint.supply,
        )
        .context("Fail to get out_vault_lp")?;

    let out_amount = out_vault
        .get_amount_by_share(current_time, out_vault_lp, out_vault_lp_mint.supply)
        .context("Fail to get out_amount")?;

    ensure!(
        out_amount < out_vault_token_account.amount,
        "Out amount > vault reserve"
    );

    let total_fee = trade_fee
        .checked_add(owner_fee)
        .context("Fail to calculate total fee")?;

    Ok(QuoteResult {
        fee: total_fee.try_into()?,
        out_amount,
    })
}

// Compute the underlying token A, B in the pool
pub fn compute_pool_tokens(
    current_time: u64,
    vault_a: VaultInfo,
    vault_b: VaultInfo,
) -> Result<(u64, u64)> {
    let token_a_amount = vault_a
        .vault
        .get_amount_by_share(current_time, vault_a.lp_amount, vault_a.lp_supply)
        .ok_or(PoolError::MathOverflow)?;
    let token_b_amount = vault_b
        .vault
        .get_amount_by_share(current_time, vault_b.lp_amount, vault_b.lp_supply)
        .ok_or(PoolError::MathOverflow)?;
    Ok((token_a_amount, token_b_amount))
}

pub fn derive_admin_token_fee(token_mint: Pubkey, pool: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &["fee".as_ref(), token_mint.as_ref(), pool.as_ref()],
        &crate::ID,
    )
}

pub fn derive_vault_lp(vault: Pubkey, pool: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[vault.as_ref(), pool.as_ref()], &crate::ID)
}

pub fn derive_lp_mint(pool: Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&["lp_mint".as_ref(), pool.as_ref()], &crate::ID)
}

#[deprecated(note = "use derive_permissionless_pool_with_fee_tier")]
pub fn derive_permissionless_pool(
    curve_type: CurveType,
    token_a_mint: Pubkey,
    token_b_mint: Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            &get_curve_type(curve_type).to_le_bytes(),
            get_first_key(token_a_mint, token_b_mint).as_ref(),
            get_second_key(token_a_mint, token_b_mint).as_ref(),
        ],
        &crate::ID,
    )
}

pub fn derive_permissionless_pool_with_fee_tier(
    curve_type: CurveType,
    token_a_mint: Pubkey,
    token_b_mint: Pubkey,
    trade_fee_bps: u64,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            &get_curve_type(curve_type).to_le_bytes(),
            get_first_key(token_a_mint, token_b_mint).as_ref(),
            get_second_key(token_a_mint, token_b_mint).as_ref(),
            get_trade_fee_bps_bytes(curve_type, trade_fee_bps)
                .unwrap()
                .as_ref(),
        ],
        &crate::ID,
    )
}
