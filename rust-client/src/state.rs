use amm::curve::{curve_type::TokenMultiplier, depeg::Depeg};
use anchor_lang::AccountDeserialize;
use anyhow::Result;
use mercurial_vault::state::Vault;
use solana_sdk::{clock::Clock, program_pack::Pack};
use spl_token::state::{Account as SplToken, Mint as SplMint};

#[derive(Debug, Clone)]
pub struct MeteoraData {
    pub vault_a: Vault,
    pub vault_b: Vault,
    pub pool_a_vault_lp_amount: u64,
    pub pool_b_vault_lp_amount: u64,
    pub pool_lp_total_supply: u64,
    pub vault_a_lp_total_supply: u64,
    pub vault_b_lp_total_supply: u64,
    pub vault_a_reserve: u64,
    pub vault_b_reserve: u64,
    pub current_time: u64,
}

#[derive(Clone, Debug)]
pub struct StableCurve {
    pub amp: u64,
    pub token_multiplier: TokenMultiplier,
    pub depeg: Depeg,
    pub last_amp_updated_timestamp: u64,
}

impl MeteoraData {
    pub fn load(
        vault_a: &mut &[u8],
        vault_b: &mut &[u8],
        pool_a_vault_lp: &[u8],
        pool_b_vault_lp: &[u8],
        pool_lp_mint: &[u8],
        vault_lp_mint_a: &[u8],
        vault_lp_mint_b: &[u8],
        vault_token_a: &[u8],
        vault_token_b: &[u8],
        clock_data: &[u8],
    ) -> Result<Self> {
        let meteora_data = MeteoraData {
            vault_a: Vault::try_deserialize(vault_a)?,
            vault_b: Vault::try_deserialize(vault_b)?,
            pool_a_vault_lp_amount: SplToken::unpack(pool_a_vault_lp)?.amount,
            pool_b_vault_lp_amount: SplToken::unpack(pool_b_vault_lp)?.amount,
            pool_lp_total_supply: SplMint::unpack(pool_lp_mint)?.supply,
            vault_a_lp_total_supply: SplMint::unpack(vault_lp_mint_a)?.supply,
            vault_b_lp_total_supply: SplMint::unpack(vault_lp_mint_b)?.supply,
            vault_a_reserve: SplToken::unpack(vault_token_a)?.amount,
            vault_b_reserve: SplToken::unpack(vault_token_b)?.amount,
            current_time: {
                let clock: Clock = bincode::deserialize(clock_data)?;
                clock.unix_timestamp as u64
            },
        };

        Ok(meteora_data)
    }
}
