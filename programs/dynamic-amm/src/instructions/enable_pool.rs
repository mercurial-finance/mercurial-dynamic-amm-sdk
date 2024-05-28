use crate::state::Pool;
use anchor_lang::prelude::*;

/// Accounts for enable or disable pool instruction
#[derive(Accounts)]
#[instruction(enable: bool)]
pub struct EnableOrDisablePool<'info> {
    #[account(
        mut,
        has_one = admin,
        constraint = pool.enabled != enable
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// Admin account. Must be owner of the pool.
    pub admin: Signer<'info>,
}
