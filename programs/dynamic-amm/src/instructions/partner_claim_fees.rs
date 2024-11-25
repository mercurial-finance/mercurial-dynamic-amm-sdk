use crate::{error::PoolError, event::PartnerClaimFees as PartnerClaimFeesEvent, state::Pool};
use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

/// Accounts for partner to claim fees
#[derive(Accounts)]
pub struct PartnerClaimFees<'info> {
    #[account(
        mut,
        has_one = protocol_token_a_fee,
        has_one = protocol_token_b_fee,
        has_one = a_vault_lp,
        constraint = pool.partner_info.partner_authority == partner_authority.key() @ PoolError::InvalidFeeOwner,
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,

    pub a_vault_lp: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub protocol_token_a_fee: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub protocol_token_b_fee: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub partner_token_a: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub partner_token_b: Box<Account<'info, TokenAccount>>,

    pub token_program: Program<'info, Token>,

    pub partner_authority: Signer<'info>,
}
