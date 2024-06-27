use anchor_lang::prelude::*;

/// Accounts for swap instruction
#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    /// CHECK: Pool account (PDA)
    pub pool: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: User token account. Token from this account will be transfer into the vault by the pool in exchange for another token of the pool.
    pub user_source_token: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: User token account. The exchanged token will be transfer into this account from the pool.
    pub user_destination_token: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.
    pub a_vault: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.
    pub b_vault: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Token vault account of vault A
    pub a_token_vault: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Token vault account of vault B
    pub b_token_vault: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Lp token mint of vault a
    pub a_vault_lp_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Lp token mint of vault b
    pub b_vault_lp_mint: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Protocol fee token account. Used to receive trading fee. It's mint field must matched with user_source_token mint field.
    pub protocol_token_fee: UncheckedAccount<'info>,

    /// CHECK: User account. Must be owner of user_source_token.
    pub user: Signer<'info>,

    /// CHECK: Vault program. the pool will deposit/withdraw liquidity from the vault.
    pub vault_program: UncheckedAccount<'info>,
    /// CHECK: Token program.
    pub token_program: UncheckedAccount<'info>,
}
