use anchor_lang::prelude::*;

/// Accounts for claim fee instruction
#[derive(Accounts)]
pub struct ClaimFee<'info> {
    /// CHECK: Pool account
    #[account(mut)]
    pub pool: UncheckedAccount<'info>,

    /// CHECK: LP token mint of the pool
    #[account(mut)]
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

    #[account(mut)]
    /// CHECK: Token vault account of vault A
    pub a_token_vault: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Token vault account of vault B
    pub b_token_vault: UncheckedAccount<'info>,

    /// CHECK: Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    #[account(mut)]
    pub a_vault: UncheckedAccount<'info>,
    /// CHECK: Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    #[account(mut)]
    pub b_vault: UncheckedAccount<'info>,
    /// CHECK: LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    #[account(mut)]
    pub a_vault_lp: UncheckedAccount<'info>,
    /// CHECK: LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    #[account(mut)]
    pub b_vault_lp: UncheckedAccount<'info>,
    /// CHECK: LP token mint of vault a
    #[account(mut)]
    pub a_vault_lp_mint: UncheckedAccount<'info>,
    /// CHECK: LP token mint of vault b
    #[account(mut)]
    pub b_vault_lp_mint: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.
    pub user_a_token: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.
    pub user_b_token: UncheckedAccount<'info>,

    /// CHECK: Vault program. the pool will deposit/withdraw liquidity from the vault.
    pub vault_program: UncheckedAccount<'info>,
}
