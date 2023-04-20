//! Context module includes information for instruction accounts

use std::str::FromStr;

use crate::curve::curve_type::CurveType;
use crate::error::PoolError;
use crate::{state::Pool, vault_utils::MercurialVault};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mercurial_vault::state::Vault;

/// get first key
pub fn get_first_key(key1: Pubkey, key2: Pubkey) -> Pubkey {
    if key1 > key2 {
        return key1;
    }
    key2
}
/// get second key
pub fn get_second_key(key1: Pubkey, key2: Pubkey) -> Pubkey {
    if key1 > key2 {
        return key2;
    }
    key1
}

/// get curve type
pub fn get_curve_type(curve_type: CurveType) -> u8 {
    match curve_type {
        CurveType::ConstantProduct {} => 0,
        _ => 1,
    }
}

/// get admin
pub fn get_admin(_payer: Pubkey) -> Pubkey {
    Pubkey::from_str("5unTfT2kssBuNvHPY6LbJfJpLqEcdMxGYLWHwShaeTLi").unwrap()
}

/// get fee owner
pub fn get_fee_owner() -> Pubkey {
    Pubkey::from_str("6WaLrrRfReGKBYUSkmx2K6AuT21ida4j8at2SUiZdXu8").unwrap()
}

/// get_lp_mint
pub fn get_lp_mint(token_a_mint_decimals: u8, token_b_mint_decimals: u8) -> u8 {
    if token_a_mint_decimals > token_b_mint_decimals {
        return token_a_mint_decimals;
    }
    token_b_mint_decimals
}

/// Bootstrap pool with zero liquidity
/// Accounts for bootstrap pool instruction
#[derive(Accounts)]
pub struct BootstrapLiquidity<'info> {
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
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    #[account(
        mut,
        constraint = lp_mint.supply == 0 @ PoolError::NonDepletedPool
    )]
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

/// Permissionless Initialize
/// Accounts for initialize new pool instruction
#[derive(Accounts)]
#[instruction(curve_type: CurveType)]
pub struct InitializePermissionlessPool<'info> {
    #[account(
        init,
        seeds = [
            &get_curve_type(curve_type).to_le_bytes(),
            get_first_key(token_a_mint.key(), token_b_mint.key()).as_ref(),
            get_second_key(token_a_mint.key(), token_b_mint.key()).as_ref(),
        ],
        bump,
        payer = payer,
        // No point to rent for max 10 MB, as when deserialize it will hit stack limit
        space = 8 + std::mem::size_of::<Pool>()
    )]
    /// Pool account (PDA address)
    pub pool: Box<Account<'info, Pool>>,

    /// LP token mint of the pool
    #[account(
        init,
        seeds = [
            "lp_mint".as_ref(),
            pool.key().as_ref()
        ],
        bump,
        payer = payer,
        mint::decimals = get_lp_mint(token_a_mint.decimals, token_b_mint.decimals),
        mint::authority = a_vault_lp
    )]
    pub lp_mint: Box<Account<'info, Mint>>,

    /// Token A mint of the pool. Eg: USDT
    pub token_a_mint: Box<Account<'info, Mint>>,
    /// Token B mint of the pool. Eg: USDC
    #[account(
        constraint = token_b_mint.key() != token_a_mint.key() @ PoolError::MismatchedTokenMint
    )]
    pub token_b_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = a_vault.token_mint == token_a_mint.key() @ PoolError::MismatchedTokenMint
    )]
    /// Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Box<Account<'info, Vault>>,
    #[account(
        mut,
        constraint = b_vault.token_mint == token_b_mint.key() @ PoolError::MismatchedTokenMint
    )]
    /// Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Box<Account<'info, Vault>>,

    #[account(mut)]
    /// Token vault account of vault A
    pub a_token_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    /// Token vault account of vault B
    pub b_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = a_vault_lp_mint.key() == a_vault.lp_mint @ PoolError::MismatchedLpMint
    )]
    /// LP token mint of vault A
    pub a_vault_lp_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        constraint = b_vault_lp_mint.key() == b_vault.lp_mint @ PoolError::MismatchedLpMint
    )]
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

    #[account(
        mut,
        constraint = payer_token_a.mint == a_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
    /// Payer token account for pool token A mint. Used to bootstrap the pool with initial liquidity.
    pub payer_token_a: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = payer_token_b.mint == b_vault.token_mint @ PoolError::MismatchedTokenMint
    )]
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
        token::authority = fee_owner
    )]
    /// Admin fee token account for token A. Used to receive trading fee.
    pub admin_token_a_fee: Box<Account<'info, TokenAccount>>,

    /// Admin fee token account for token B. Used to receive trading fee.
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
        token::authority = fee_owner
    )]
    pub admin_token_b_fee: Box<Account<'info, TokenAccount>>,

    /// Admin account. This account will be the admin of the pool, and the payer for PDA during initialize pool.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: fee owner
    #[account(constraint = fee_owner.key() == get_fee_owner() @ PoolError::InvalidFeeOwner)]
    pub fee_owner: UncheckedAccount<'info>,

    /// Rent account.
    pub rent: Sysvar<'info, Rent>,

    /// Vault program. The pool will deposit/withdraw liquidity from the vault.
    pub vault_program: Program<'info, MercurialVault>,
    /// Token program.
    pub token_program: Program<'info, Token>,
    /// Associated token program.
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// System program.
    pub system_program: Program<'info, System>,
}

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
