use anchor_lang::prelude::Result;
use mercurial_vault::state::Vault;

use crate::error::PoolError;

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
