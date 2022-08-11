//! Context module includes information for instruction accounts

use crate::constants;
use crate::error::PoolError;
use crate::state::Apy;
use crate::{state::Pool, vault_utils::MercurialVault};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mercurial_vault::state::Vault;

/// Accounts for remove liquidity single sided instruction
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
        constraint = pool.enabled @ PoolError::PoolDisabled // user need to call remove liquidity in balanced ratio
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    /// LP token mint of the pool
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    /// User pool lp token account. LP will be burned from this account upon success liquidity removal.
    pub user_pool_lp: Account<'info, TokenAccount>,

    #[account(mut)]
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    /// Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(mut)]
    /// Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    /// LP token mint of vault A
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    /// LP token mint of vault B
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// Token vault account of vault A
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// Token vault account of vault B
    pub b_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// User token account to receive token upon success liquidity removal.
    pub user_destination_token: Account<'info, TokenAccount>,
    /// User account. Must be owner of the user_pool_lp account.
    pub user: Signer<'info>,

    /// Vault program. The pool will deposit/withdraw liquidity from the vault.
    pub vault_program: Program<'info, MercurialVault>,
    /// Token program.
    pub token_program: Program<'info, Token>,
}

/// Accounts for add or remove balanced liquidity instruction
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
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    #[account(mut)]
    /// LP token mint of the pool
    pub lp_mint: Account<'info, Mint>,
    #[account(mut)]
    /// user pool lp token account. lp will be burned from this account upon success liquidity removal.
    pub user_pool_lp: Account<'info, TokenAccount>,

    #[account(mut)]
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    /// Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(mut)]
    /// Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    /// LP token mint of vault a
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    /// LP token mint of vault b
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// Token vault account of vault A
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// Token vault account of vault B
    pub b_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.
    pub user_a_token: Account<'info, TokenAccount>,
    #[account(mut)]
    /// User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.
    pub user_b_token: Account<'info, TokenAccount>,
    /// User account. Must be owner of user_a_token, and user_b_token.
    pub user: Signer<'info>,

    /// Vault program. the pool will deposit/withdraw liquidity from the vault.
    pub vault_program: Program<'info, MercurialVault>,
    /// Token program.
    pub token_program: Program<'info, Token>,
}

/// Accounts for sync apy instruction

#[derive(Accounts)]
pub struct SyncApy<'info> {
    #[account(
        has_one = a_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = b_vault_lp @ PoolError::InvalidVaultLpAccount,
        has_one = a_vault @ PoolError::InvalidVaultAccount,
        has_one = b_vault @ PoolError::InvalidVaultAccount,
        has_one = lp_mint @ PoolError::InvalidPoolLpMintAccount,
        constraint = a_vault_lp.mint == a_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
        constraint = b_vault_lp.mint == b_vault_lp_mint.key() @ PoolError::MismatchedLpMint,
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// LP token mint of the pool
    pub lp_mint: Box<Account<'info, Mint>>,
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Account<'info, TokenAccount>,
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Account<'info, TokenAccount>,
    /// Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Box<Account<'info, Vault>>,
    /// Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Box<Account<'info, Vault>>,
    /// LP token mint of vault a
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    /// LP token mint of vault b
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,
    /// Apy account (PDA). Store all the virtual price snapshots required for APY calculation
    #[account(
        mut,
        has_one = pool @ PoolError::InvalidApyAccount
    )]
    pub apy: Box<Account<'info, Apy>>,
}

/// Accounts for get pool info instruction
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
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// LP token mint of the pool
    pub lp_mint: Box<Account<'info, Mint>>,
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Account<'info, TokenAccount>,
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Account<'info, TokenAccount>,
    /// Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Box<Account<'info, Vault>>,
    /// Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Box<Account<'info, Vault>>,
    /// LP token mint of vault a
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    /// LP token mint of vault b
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,
    /// Apy account (PDA). Store all the virtual price snapshots required for APY calculation
    #[account(
        has_one = pool @ PoolError::InvalidApyAccount
    )]
    pub apy: Box<Account<'info, Apy>>,
}
/// Accounts for swap instruction
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
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        mut,
        constraint = user_source_token.mint != user_destination_token.mint @ PoolError::IdenticalSourceDestination,
        constraint = user_source_token.mint == a_vault.token_mint || user_source_token.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    /// User token account. Token from this account will be transfer into the vault by the pool in exchange for another token of the pool.
    pub user_source_token: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = user_destination_token.mint == a_vault.token_mint || user_destination_token.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    /// User token account. The exchanged token will be transfer into this account from the pool.
    pub user_destination_token: Account<'info, TokenAccount>,

    #[account(mut)]
    /// Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(mut)]
    /// Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    /// Token vault account of vault A
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// Token vault account of vault B
    pub b_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    /// Lp token mint of vault a
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(mut)]
    /// Lp token mint of vault b
    pub b_vault_lp_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Account<'info, TokenAccount>,
    #[account(mut)]
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Account<'info, TokenAccount>,

    #[account(mut)]
    /// Admin fee token account. Used to receive trading fee. It's mint field must matched with user_source_token mint field.
    pub admin_token_fee: Box<Account<'info, TokenAccount>>,

    /// User account. Must be owner of user_source_token.
    pub user: Signer<'info>,

    /// Vault program. the pool will deposit/withdraw liquidity from the vault.
    pub vault_program: Program<'info, MercurialVault>,
    /// Token program.
    pub token_program: Program<'info, Token>,
}
