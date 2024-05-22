use crate::state::LockEscrow;
use anchor_lang::prelude::*;

/// Accounts for create lock account instruction
#[derive(Accounts)]
pub struct CreateLockEscrow<'info> {
    /// CHECK:
    pub pool: UncheckedAccount<'info>,

    /// CHECK: Lock account
    #[account(
        init,
        seeds = [
            "lock_escrow".as_ref(),
            pool.key().as_ref(),
            owner.key().as_ref(),
        ],
        space = 8 + std::mem::size_of::<LockEscrow>(),
        bump,
        payer = payer,
    )]
    pub lock_escrow: UncheckedAccount<'info>,

    /// CHECK: Owner account
    pub owner: UncheckedAccount<'info>,

    /// CHECK: LP token mint of the pool
    pub lp_mint: UncheckedAccount<'info>,

    /// CHECK: Payer account
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: System program.
    pub system_program: UncheckedAccount<'info>,
}
