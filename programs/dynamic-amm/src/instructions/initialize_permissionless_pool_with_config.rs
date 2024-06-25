use crate::{error::PoolError, get_lp_mint_decimal};
use crate::{get_first_key, get_second_key, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

#[derive(Accounts)]
pub struct InitializePermissionlessConstantProductPoolWithConfig<'info> {
    #[account(
        init,
        seeds = [
            get_first_key(token_a_mint.key(), token_b_mint.key()).as_ref(),
            get_second_key(token_a_mint.key(), token_b_mint.key()).as_ref(),
            config.key().as_ref()
        ],
        bump,
        payer = payer,
        space = 8 + std::mem::size_of::<Pool>()
    )]
    /// Pool account (PDA address)
    pub pool: Box<Account<'info, Pool>>,

    pub config: Box<Account<'info, Config>>,

    /// LP token mint of the pool
    #[account(
        init,
        seeds = [
            "lp_mint".as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = payer,
        mint::decimals = get_lp_mint_decimal(token_a_mint.decimals, token_b_mint.decimals),
        mint::authority = a_vault_lp,
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
    /// Token vault account of vault A
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// Token vault account of vault B
    pub b_token_vault: Box<Account<'info, TokenAccount>>,

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
        payer = payer,
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
        payer = payer,
        token::mint = b_vault_lp_mint,
        token::authority = a_vault_lp
    )]
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    /// Payer token account for pool token A mint. Used to bootstrap the pool with initial liquidity.
    pub payer_token_a: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    /// Admin token account for pool token B mint. Used to bootstrap the pool with initial liquidity.
    pub payer_token_b: Box<Account<'info, TokenAccount>>,

    /// CHECK: Payer pool LP token account. Used to receive LP during first deposit (initialize pool)
    #[account(
        init,
        payer = payer,
        associated_token::mint = lp_mint,
        associated_token::authority = payer,
    )]
    pub payer_pool_lp: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        seeds = [
            "fee".as_ref(),
            token_a_mint.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = payer,
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
        payer = payer,
        token::mint = token_b_mint,
        token::authority = a_vault_lp
    )]
    pub protocol_token_b_fee: Box<Account<'info, TokenAccount>>,

    /// Admin account. This account will be the admin of the pool, and the payer for PDA during initialize pool.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Rent account.
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: LP mint metadata PDA. Metaplex do the checking.
    #[account(mut)]
    pub mint_metadata: UncheckedAccount<'info>,

    /// CHECK: Metadata program
    pub metadata_program: UncheckedAccount<'info>,

    /// CHECK: Vault program. The pool will deposit/withdraw liquidity from the vault.
    pub vault_program: UncheckedAccount<'info>,
    /// Token program.
    pub token_program: Program<'info, Token>,
    /// Associated token program.
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// System program.
    pub system_program: Program<'info, System>,
}

pub fn initialize_permissionless_constant_product_pool_with_config(
    ctx: Context<InitializePermissionlessConstantProductPoolWithConfig>,
    token_a_amount: u64,
    token_b_amount: u64,
) -> Result<()> {
    Ok(())
}
