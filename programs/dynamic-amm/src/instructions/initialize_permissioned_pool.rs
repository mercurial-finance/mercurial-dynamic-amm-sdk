// use crate::macros::pool_seeds;

use crate::get_lp_mint;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

/// Permissioned Initialize
/// Accounts for initialize new pool instruction
#[derive(Accounts)]
pub struct InitializePermissionedPool<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + std::mem::size_of::<Pool>()
    )]
    /// Pool account (arbitrary address)
    pub pool: Box<Account<'info, Pool>>,

    /// LP token mint of the pool
    #[account(
        init,
        seeds = [
            "lp_mint".as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        mint::decimals = get_lp_mint(token_a_mint.decimals, token_b_mint.decimals),
        mint::authority = a_vault_lp
    )]
    pub lp_mint: Box<Account<'info, Mint>>,

    /// Token A mint of the pool. Eg: USDT
    pub token_a_mint: Box<Account<'info, Mint>>,
    /// Token B mint of the pool. Eg: USDC
    pub token_b_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// CHECK: Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.
    pub a_vault: AccountInfo<'info>,
    #[account(mut)]
    /// CHECK: Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.
    pub b_vault: AccountInfo<'info>,

    #[account(mut)]
    /// LP token mint of vault A
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    /// LP token mint of vault B
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    #[account(
        init,
        seeds = [
            a_vault.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = a_vault_lp_mint,
        token::authority = a_vault_lp
    )]
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,
    /// LP token account of vault B. Used to receive/burn vault LP upon deposit/withdraw from the vault.
    #[account(
        init,
        seeds = [
            b_vault.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = b_vault_lp_mint,
        token::authority = a_vault_lp
    )]
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    /// Admin token account for pool token A mint. Used to bootstrap the pool with initial liquidity.
    pub admin_token_a: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// Admin token account for pool token B mint. Used to bootstrap the pool with initial liquidity.
    pub admin_token_b: Box<Account<'info, TokenAccount>>,

    /// Admin pool LP token account. Used to receive LP during first deposit (initialize pool)
    #[account(
        init,
        payer = admin,
        associated_token::mint = lp_mint,
        associated_token::authority = admin
    )]
    /// Admin pool LP token account. Used to receive LP during first deposit (initialize pool)
    pub admin_pool_lp: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        seeds = [
            "fee".as_ref(),
            token_a_mint.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = token_a_mint,
        token::authority = a_vault_lp
    )]
    /// Protocol fee token account for token A. Used to receive trading fee.
    pub protocol_token_a_fee: Box<Account<'info, TokenAccount>>,

    /// Protocol fee token account for token B. Used to receive trading fee.
    #[account(
        init,
        seeds = [
            "fee".as_ref(),
            token_b_mint.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = token_b_mint,
        token::authority = a_vault_lp
    )]
    pub protocol_token_b_fee: Box<Account<'info, TokenAccount>>,

    /// Admin account. This account will be the admin of the pool, and the payer for PDA during initialize pool.
    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Fee owner will be a_vault_lp
    #[allow(deprecated)]
    pub fee_owner: UncheckedAccount<'info>,

    /// Rent account.
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: LP mint metadata PDA. Metaplex do the checking.
    #[account(mut)]
    pub mint_metadata: UncheckedAccount<'info>,

    /// CHECK: Metadata program    
    pub metadata_program: UncheckedAccount<'info>,

    /// CHECK: Vault program. The pool will deposit/withdraw liquidity from the vault.
    pub vault_program: AccountInfo<'info>,
    /// Token program.
    pub token_program: Program<'info, Token>,

    /// Associated token program.
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// System program.
    pub system_program: Program<'info, System>,
}
