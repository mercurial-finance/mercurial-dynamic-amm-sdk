use crate::state::Pool;
use anchor_lang::prelude::*;

/// Accounts for set pool fees instruction
#[derive(Accounts)]
pub struct SetPoolFees<'info> {
    #[account(mut)]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// Fee operator account
    pub fee_operator: Signer<'info>,
}
