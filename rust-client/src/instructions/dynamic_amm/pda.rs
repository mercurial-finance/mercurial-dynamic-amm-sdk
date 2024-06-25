use crate::*;
use prog_dynamic_amm::{instructions::*, state::CurveType};

pub fn derive_vault_address(token_mint: &Pubkey) -> Pubkey {
    let (vault, _bump) = Pubkey::find_program_address(
        &[
            prog_dynamic_vault::seed::VAULT_PREFIX.as_ref(),
            token_mint.as_ref(),
            prog_dynamic_vault::get_base_address().as_ref(),
        ],
        &prog_dynamic_vault::id(),
    );
    vault
}

pub fn derive_token_vault_address(vault: &Pubkey) -> Pubkey {
    let (token_vault, _bump) = Pubkey::find_program_address(
        &[
            prog_dynamic_vault::seed::TOKEN_VAULT_PREFIX.as_ref(),
            vault.as_ref(),
        ],
        &prog_dynamic_vault::id(),
    );
    token_vault
}

pub fn derive_vault_lp_mint_address(vault: &Pubkey) -> Pubkey {
    let (lp_mint, _bump) = Pubkey::find_program_address(
        &[
            prog_dynamic_vault::seed::LP_MINT_PREFIX.as_ref(),
            vault.as_ref(),
        ],
        &prog_dynamic_vault::id(),
    );
    lp_mint
}

pub fn derive_pool_address(
    token_a_mint: Pubkey,
    token_b_mint: Pubkey,
    trade_fee_bps: u64,
) -> Pubkey {
    let (pool, _bump) = Pubkey::find_program_address(
        &[
            &get_curve_type(CurveType::ConstantProduct).to_le_bytes(),
            get_first_key(token_a_mint, token_b_mint).as_ref(),
            get_second_key(token_a_mint, token_b_mint).as_ref(),
            get_trade_fee_bps_bytes(trade_fee_bps).as_ref(), // Do not include owner trade fee
        ],
        &prog_dynamic_amm::id(),
    );
    pool
}

pub fn derive_constant_product_pool_with_config(
    token_a_mint: Pubkey,
    token_b_mint: Pubkey,
    config: Pubkey,
) -> Pubkey {
    let (pool, _bump) = Pubkey::find_program_address(
        &[
            get_first_key(token_a_mint, token_b_mint).as_ref(),
            get_second_key(token_a_mint, token_b_mint).as_ref(),
            config.as_ref(),
        ],
        &prog_dynamic_amm::id(),
    );

    pool
}

pub fn derive_pool_lp_mint_address(pool: Pubkey) -> Pubkey {
    let (lp_mint, _bump) = Pubkey::find_program_address(
        &[b"lp_mint".as_ref(), pool.as_ref()],
        &prog_dynamic_amm::id(),
    );
    lp_mint
}

pub fn derive_vault_lp_token_address(vault: Pubkey, pool: Pubkey) -> Pubkey {
    let (vault_lp, _bump) =
        Pubkey::find_program_address(&[vault.as_ref(), pool.as_ref()], &prog_dynamic_amm::id());
    vault_lp
}

pub fn derive_pool_fee_token_address(token_mint: Pubkey, pool: Pubkey) -> Pubkey {
    let (token_fee, _bump) = Pubkey::find_program_address(
        &[b"fee".as_ref(), token_mint.as_ref(), pool.as_ref()],
        &prog_dynamic_amm::id(),
    );
    token_fee
}
