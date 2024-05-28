use crate::state::Pool;
use anchor_lang::prelude::*;

/// Accounts for set pool fees instruction
#[derive(Accounts)]
pub struct SetPoolFees<'info> {
    #[account(
        mut,
        has_one = admin ,
    )]
    /// Pool account (PDA)
    pub pool: Box<Account<'info, Pool>>,
    /// Admin account. Must be owner of the pool.
    pub admin: Signer<'info>,
}
