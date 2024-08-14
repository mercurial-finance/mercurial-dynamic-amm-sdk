use crate::{error::PoolError, state::Pool};
use anchor_lang::prelude::*;

/// Accounts for update activation point
#[derive(Accounts)]
pub struct UpdateActivationPoint<'info> {
    #[account(mut)]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// Admin account.
    pub admin: Signer<'info>,
}
