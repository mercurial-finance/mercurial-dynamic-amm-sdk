use crate::state::Config;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CloseConfig<'info> {
    #[account(
        mut,
        close = rent_receiver
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK: Account to receive closed account rental SOL
    #[account(mut)]
    pub rent_receiver: UncheckedAccount<'info>,
}
