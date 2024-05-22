use anchor_lang::prelude::*;
/// Accounts for lock instruction
#[derive(Accounts)]
pub struct Lock<'info> {
    /// CHECK: Pool account
    #[account(mut)]
    pub pool: UncheckedAccount<'info>,

    /// CHECK: LP token mint of the pool
    pub lp_mint: UncheckedAccount<'info>,

    /// CHECK: Lock account
    #[account(mut)]
    pub lock_escrow: UncheckedAccount<'info>,

    /// CHECK: Owner of lock account
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: owner lp token account
    #[account(mut)]
    pub source_tokens: UncheckedAccount<'info>,

    /// CHECK: Escrow vault
    #[account(mut)]
    pub escrow_vault: UncheckedAccount<'info>,

    /// CHECK: Token program.
    pub token_program: UncheckedAccount<'info>,

    /// CHECK: Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    pub a_vault: UncheckedAccount<'info>,
    /// CHECK: Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    pub b_vault: UncheckedAccount<'info>,
    /// CHECK: LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: UncheckedAccount<'info>,
    /// CHECK: LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: UncheckedAccount<'info>,
    /// CHECK: LP token mint of vault a
    pub a_vault_lp_mint: UncheckedAccount<'info>,
    /// CHECK: LP token mint of vault b
    pub b_vault_lp_mint: UncheckedAccount<'info>,
}
