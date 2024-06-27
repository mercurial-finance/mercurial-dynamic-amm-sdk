use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::TokenAccount;

/// get first key, this is same as max(key1, key2)
pub fn get_first_key(key1: Pubkey, key2: Pubkey) -> Pubkey {
    if key1 > key2 {
        return key1;
    }
    key2
}
/// get second key, this is same as min(key1, key2)
pub fn get_second_key(key1: Pubkey, key2: Pubkey) -> Pubkey {
    if key1 > key2 {
        return key2;
    }
    key1
}

/// get_lp_mint
pub fn get_lp_mint_decimal(token_a_mint_decimals: u8, token_b_mint_decimals: u8) -> u8 {
    if token_a_mint_decimals > token_b_mint_decimals {
        return token_a_mint_decimals;
    }
    token_b_mint_decimals
}
/// get curve type
pub fn get_curve_type(curve_type: CurveType) -> u8 {
    match curve_type {
        CurveType::ConstantProduct {} => 0,
        _ => 1,
    }
}

/// Convert fees numerator and denominator to BPS. Minimum 1 bps, Maximum 10_000 bps. 0.01% -> 100%
pub fn to_bps(numerator: u128, denominator: u128) -> Option<u64> {
    let bps = numerator
        .checked_mul(MAX_BASIS_POINT.into())?
        .checked_div(denominator)?;
    bps.try_into().ok()
}

pub static MAX_BASIS_POINT: u64 = 10000;

// 0.25%, 1%, 4%, 6%
//  &[25, 100, 400, 600]
/// get trade fee bps seed for pool pda
pub fn get_trade_fee_bps_bytes(trade_fee_bps: u64) -> Vec<u8> {
    let default_fees = PoolFees {
        trade_fee_numerator: 250,
        trade_fee_denominator: 100000,
        protocol_trade_fee_numerator: 0,
        protocol_trade_fee_denominator: 100000,
    };

    // Unwrap on default configured fee is safe
    let default_trade_fee_bps = to_bps(
        default_fees.trade_fee_numerator.into(),
        default_fees.trade_fee_denominator.into(),
    )
    .unwrap();

    if default_trade_fee_bps == trade_fee_bps {
        return vec![];
    }

    trade_fee_bps.to_le_bytes().to_vec()
}

/// Permissionless initialize
/// Accounts for initialize new pool instruction
#[derive(Accounts)]
#[instruction(curve_type: CurveType)]
#[allow(deprecated)]
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
        mint::decimals = get_lp_mint_decimal(token_a_mint.decimals, token_b_mint.decimals),
        mint::authority = a_vault_lp
    )]
    pub lp_mint: Box<Account<'info, Mint>>,

    /// Token A mint of the pool. Eg: USDT
    pub token_a_mint: Box<Account<'info, Mint>>,
    /// Token B mint of the pool. Eg: USDC
    #[account()]
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

    /// CHECK: fee owner will be a_vault_lp
    pub fee_owner: UncheckedAccount<'info>,

    /// Rent account.
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: LP mint metadata PDA. Metaplex do the checking.
    #[account(mut)]
    pub mint_metadata: UncheckedAccount<'info>,

    /// CHECK: Metadata program    
    pub metadata_program: UncheckedAccount<'info>,

    /// CHECK: Vault program. The pool will deposit/withdraw liquidity from the vault.
    pub vault_program: UncheckedAccount<'info>,
    /// CHECK: Token program.
    pub token_program: UncheckedAccount<'info>,
    /// CHECK: Associated token program.
    pub associated_token_program: UncheckedAccount<'info>,
    /// CHECK: System program.
    pub system_program: UncheckedAccount<'info>,
}

/// Permissionless Initialize with customized fee tier
/// Accounts for initialize new pool instruction
#[derive(Accounts)]
#[instruction(curve_type: CurveType, trade_fee_bps: u64)]
pub struct InitializePermissionlessPoolWithFeeTier<'info> {
    #[account(
        init,
        seeds = [
            &get_curve_type(curve_type).to_le_bytes(),
            get_first_key(token_a_mint.key(), token_b_mint.key()).as_ref(),
            get_second_key(token_a_mint.key(), token_b_mint.key()).as_ref(),
            get_trade_fee_bps_bytes(trade_fee_bps).as_ref(), // Do not include owner trade fee
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

    /// CHECK: fee owner will be a_vault_lp
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
    /// CHECK: Token program.
    pub token_program: AccountInfo<'info>,
    /// CHECK: Associated token program.
    pub associated_token_program: AccountInfo<'info>,
    /// CHECK: System program.
    pub system_program: AccountInfo<'info>,
}
