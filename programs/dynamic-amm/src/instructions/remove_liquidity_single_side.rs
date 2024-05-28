use anchor_lang::prelude::*;
/// Accounts for remove liquidity single sided instruction
#[derive(Accounts)]
pub struct RemoveLiquiditySingleSide<'info> {
    #[account(mut)]
    /// CHECK: Pool account (PDA)
    pub pool: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: LP token mint of the pool
    pub lp_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: User pool lp token account. LP will be burned from this account upon success liquidity removal.
    pub user_pool_lp: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.
    pub a_vault: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.
    pub b_vault: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: LP token mint of vault A
    pub a_vault_lp_mint: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: LP token mint of vault B
    pub b_vault_lp_mint: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: Token vault account of vault A
    pub a_token_vault: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: Token vault account of vault B
    pub b_token_vault: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: User token account to receive token upon success liquidity removal.
    pub user_destination_token: UncheckedAccount<'info>,
    /// CHECK: User account. Must be owner of the user_pool_lp account.
    pub user: Signer<'info>,

    /// CHECK: Vault program. The pool will deposit/withdraw liquidity from the vault.
    pub vault_program: UncheckedAccount<'info>,
    /// CHECK: Token program.
    pub token_program: UncheckedAccount<'info>,
}
