use crate::constants;
use crate::error::PoolError;
use crate::utils::form_composite_key;
use crate::{state::Pool, vault_utils::MercurialVault};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mercurial_vault::state::Vault;
use std::fmt::Debug;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug)]
pub struct PoolBumps {
    pub pool_bump: u8,
    pub a_vault_lp_bump: u8,
    pub b_vault_lp_bump: u8,
}

#[derive(Accounts)]
#[instruction(bumps: PoolBumps)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = [
            constants::seeds::POOL_PREFIX.as_bytes(),
            &form_composite_key(token_a_mint.key().to_bytes(), token_b_mint.key().to_bytes()),
            base.key().as_ref()
        ],
        bump,
        payer = admin,
        // 8 - discriminator + 887 - pool + 1024 - extra byte
        // Rent-exempt minimum: 0.010962 SOL
        space = 8 + 887 + 1024
    )]
    pub pool: Box<Account<'info, Pool>>,
    #[account(
        mut,
        constraint = lp_mint.mint_authority.unwrap() == pool.key() &&
            lp_mint.supply == 0 && lp_mint.freeze_authority.is_none() @ PoolError::FaultyLpMint
    )]
    pub lp_mint: Box<Account<'info, Mint>>,

    pub token_a_mint: Box<Account<'info, Mint>>,
    pub token_b_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = a_vault.token_mint == token_a_mint.key() @ PoolError::MismatchedTokenMint
    )]
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(
        mut,
        constraint = b_vault.token_mint == token_b_mint.key() @ PoolError::MismatchedTokenMint
    )]
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub b_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = a_vault_lp_mint.key() == a_vault.lp_mint @ PoolError::MismatchedLpMint
    )]
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        constraint = b_vault_lp_mint.key() == b_vault.lp_mint @ PoolError::MismatchedLpMint
    )]
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        seeds = [
            a_vault.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = a_vault_lp_mint,
        token::authority = pool
    )]
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,
    #[account(
        init,
        seeds = [
            b_vault.key().as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = admin,
        token::mint = b_vault_lp_mint,
        token::authority = pool
    )]
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = admin_token_a.mint == a_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    pub admin_token_a: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = admin_token_b.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    pub admin_token_b: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = admin_pool_lp.owner == admin.key() @ PoolError::MismatchedOwner
    )]
    pub admin_pool_lp: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = admin_token_a_fee.mint == a_vault.token_mint @ PoolError::MismatchedTokenMint,
        constraint = admin_token_a_fee.owner == admin.key() @ PoolError::MismatchedOwner
    )]
    pub admin_token_a_fee: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = admin_token_b_fee.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint,
        constraint = admin_token_b_fee.owner == admin.key() @ PoolError::MismatchedOwner
    )]
    pub admin_token_b_fee: Box<Account<'info, TokenAccount>>,

    #[account(signer, mut)]
    /// CHECK: Admin of the pool. This is not dangerous because we don't read or write from this account
    pub admin: AccountInfo<'info>,
    pub base: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,

    pub vault_program: Program<'info, MercurialVault>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RemoveLiquiditySingleSide<'info> {
    #[account(
        mut,
        has_one = a_vault @ PoolError::InvalidVaultAccount,
        has_one = b_vault @ PoolError::InvalidVaultAccount,
        has_one = a_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = b_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = lp_mint @ PoolError::InvalidPoolLpMintAccount,
        constraint = a_vault_lp.mint == a_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = b_vault_lp.mint == b_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = pool.enabled @ PoolError::PoolDisabled
    )]
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_pool_lp: Account<'info, TokenAccount>,

    #[account(mut)]
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(mut)]
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub b_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub user_destination_token: Account<'info, TokenAccount>,
    pub user: Signer<'info>,

    pub vault_program: Program<'info, MercurialVault>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AddOrRemoveBalanceLiquidity<'info> {
    #[account(
        mut,
        has_one = a_vault @ PoolError::InvalidVaultAccount,
        has_one = b_vault @ PoolError::InvalidVaultAccount,
        has_one = a_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = b_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = lp_mint @ PoolError::InvalidPoolLpMintAccount,
        constraint = a_vault_lp.mint == a_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = b_vault_lp.mint == b_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = pool.enabled @ PoolError::PoolDisabled
    )]
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_pool_lp: Account<'info, TokenAccount>,

    #[account(mut)]
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(mut)]
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub b_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub user_a_token: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_b_token: Account<'info, TokenAccount>,
    pub user: Signer<'info>,

    pub vault_program: Program<'info, MercurialVault>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SyncApy<'info> {
    #[account(
        mut,
        has_one = a_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = b_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = a_vault @ PoolError::InvalidVaultAccount,
        has_one = b_vault @ PoolError::InvalidVaultAccount,
        has_one = lp_mint @ PoolError::InvalidPoolLpMintAccount,
        constraint = a_vault_lp.mint == a_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = b_vault_lp.mint == b_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub lp_mint: Box<Account<'info, Mint>>,
    pub a_vault_lp: Account<'info, TokenAccount>,
    pub b_vault_lp: Account<'info, TokenAccount>,
    pub a_vault: Box<Account<'info, Vault>>,
    pub b_vault: Box<Account<'info, Vault>>,
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,
    pub vault_program: Program<'info, MercurialVault>,
}

#[derive(Accounts)]
pub struct GetPoolInfo<'info> {
    #[account(
        has_one = a_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = b_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = a_vault @ PoolError::InvalidVaultAccount,
        has_one = b_vault @ PoolError::InvalidVaultAccount,
        has_one = lp_mint @ PoolError::InvalidPoolLpMintAccount,
        constraint = a_vault_lp.mint == a_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = b_vault_lp.mint == b_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub lp_mint: Box<Account<'info, Mint>>,
    pub a_vault_lp: Account<'info, TokenAccount>,
    pub b_vault_lp: Account<'info, TokenAccount>,
    pub a_vault: Box<Account<'info, Vault>>,
    pub b_vault: Box<Account<'info, Vault>>,
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,
    pub vault_program: Program<'info, MercurialVault>,
}

#[derive(Accounts)]
pub struct SetPoolFees<'info> {
    #[account(
        mut,
        has_one = admin @ PoolError::InvalidAdminAccount
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct OverrideCurveParam<'info> {
    #[account(
        mut,
        has_one = admin @ PoolError::InvalidAdminAccount
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(
        mut,
        has_one = admin @ PoolError::InvalidAdminAccount,
        constraint = *new_admin.key != pool.admin @ PoolError::SameAdminAccount
    )]
    pub pool: Box<Account<'info, Pool>>,
    pub admin: Signer<'info>,
    /// CHECK: New admin of the pool. This is not dangerous because we don't read or write from this account
    pub new_admin: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SetAdminFeeAccount<'info> {
    #[account(
        mut,
        has_one = admin @ PoolError::InvalidAdminAccount,
    )]
    pub pool: Box<Account<'info, Pool>>,
    #[account(
        mut,
        constraint = new_admin_token_a_fee.mint == pool.token_a_mint @ PoolError::MismatchedTokenMint,
    )]
    pub new_admin_token_a_fee: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = new_admin_token_b_fee.mint == pool.token_b_mint @ PoolError::MismatchedTokenMint,
    )]
    pub new_admin_token_b_fee: Box<Account<'info, TokenAccount>>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(
        mut,
        has_one = a_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = b_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = a_vault @ PoolError::InvalidVaultAccount,
        has_one = b_vault @ PoolError::InvalidVaultAccount,
        constraint = a_vault_lp.mint == a_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = b_vault_lp.mint == b_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = pool.enabled @ PoolError::PoolDisabled
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        mut,
        constraint = user_source_token.mint != user_destination_token.mint @ PoolError::IdenticalSourceDestination,
        constraint = user_source_token.mint == a_vault.token_mint || user_source_token.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    pub user_source_token: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user_destination_token.mint == a_vault.token_mint || user_destination_token.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    pub user_destination_token: Account<'info, TokenAccount>,

    #[account(mut)]
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(mut)]
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub b_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub a_vault_lp: Account<'info, TokenAccount>,
    #[account(mut)]
    pub b_vault_lp: Account<'info, TokenAccount>,

    #[account(mut)]
    pub admin_token_fee: Box<Account<'info, TokenAccount>>,

    pub user: Signer<'info>,

    pub vault_program: Program<'info, MercurialVault>,
    pub token_program: Program<'info, Token>,
}
