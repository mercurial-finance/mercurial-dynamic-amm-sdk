use crate::state::Pool;
use anchor_lang::prelude::*;

/// Accounts for transfer admin instruction
#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(
        mut,
        has_one = admin,
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// Admin account. Must be owner of the pool.
    pub admin: Signer<'info>,
    /// New admin account.
    pub new_admin: Signer<'info>,
}
