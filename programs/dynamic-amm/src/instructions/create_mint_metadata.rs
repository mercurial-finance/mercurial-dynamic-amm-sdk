use crate::state::Pool;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct CreateMintMetadata<'info> {
    /// Pool account
    pub pool: Box<Account<'info, Pool>>,

    /// LP mint account of the pool
    pub lp_mint: Box<Account<'info, Mint>>,

    /// Vault A LP account of the pool
    pub a_vault_lp: Box<Account<'info, TokenAccount>>,

    /// CHECK: LP mint metadata PDA. Metaplex do the checking
    // https://github.com/metaplex-foundation/mpl-token-metadata/blob/4e5bcca44000f151fe64682826bbe2eb61cd7b87/programs/token-metadata/program/src/utils/metadata.rs#L108
    #[account(mut)]
    pub mint_metadata: UncheckedAccount<'info>,

    /// CHECK: Metadata program
    pub metadata_program: UncheckedAccount<'info>,

    /// System program.
    pub system_program: Program<'info, System>,

    /// Payer
    #[account(mut)]
    pub payer: Signer<'info>,
}
