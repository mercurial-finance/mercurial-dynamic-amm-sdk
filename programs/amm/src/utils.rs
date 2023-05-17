use anchor_lang::prelude::{Pubkey, Result};
use mercurial_vault::state::Vault;

use crate::{
    context::{get_curve_type, get_first_key, get_second_key, get_trade_fee_bps_bytes},
    curve::curve_type::CurveType,
    error::PoolError,
};

pub struct VaultInfo {
    /// Amount of vault lp hold by the pool
    pub lp_amount: u64,
    /// Vault lp mint supply
    pub lp_supply: u64,
    /// Vault state
    pub vault: Vault,
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
