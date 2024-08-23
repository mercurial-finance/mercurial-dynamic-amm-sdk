use crate::constants::seeds::CONFIG_PREFIX;
use crate::state::Config;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ConfigParameters {
    pub trade_fee_numerator: u64,
    pub protocol_trade_fee_numerator: u64,
    pub activation_duration: u64,
    pub pool_creator_authority: Pubkey,
    pub activation_type: u8,
    pub index: u64,
}

#[derive(Accounts)]
#[instruction(config_parameters: ConfigParameters)]
pub struct CreateConfig<'info> {
    #[account(
        init,
        seeds = [
            CONFIG_PREFIX,
            config_parameters.index.to_le_bytes().as_ref()
        ],
        bump,
        payer = admin,
        space = 8 + Config::INIT_SPACE
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}
