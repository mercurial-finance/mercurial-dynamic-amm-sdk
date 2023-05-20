use super::state::*;
use amm::{
    constants::depeg,
    curve::{
        curve_type::{CurveType, DepegType},
        fees::PoolFees,
    },
    state::Pool,
};
use anchor_lang::prelude::Pubkey;
use anyhow::{bail, Context, Result};
use rust_decimal::Decimal;
use spl_token_swap::curve::calculator::TradeDirection;
use std::collections::HashMap;
use std::convert::{TryFrom, TryInto};

const PRECISION: u128 = depeg::PRECISION as u128;

pub struct QuoteParams {
    pub in_amount: u64,
    pub input_mint: Pubkey,
    pub output_mint: Pubkey,
}

#[derive(Debug, Default, Clone, Copy)]
pub struct Quote {
    pub not_enough_liquidity: bool,
    pub min_in_amount: Option<u64>,
    pub min_out_amount: Option<u64>,
    pub in_amount: u64,
    pub out_amount: u64,
    pub fee_amount: u64,
    pub fee_mint: Pubkey,
    pub fee_pct: Decimal,
    pub price_impact_pct: Decimal,
}

pub struct Math<'a> {
    pub pool: &'a Pool,
    pub meteora_data: &'a MeteoraData,
    pub depeg_accounts: &'a HashMap<Pubkey, Vec<u8>>,
    pub depeg_account: Option<&'a Pubkey>,
    pub stable_curve: Option<&'a StableCurve>,
}

impl<'a> Math<'a> {
    pub fn calculate_quote(&self, quote_params: &QuoteParams) -> Result<Quote> {
        let MeteoraData {
            vault_a,
            vault_b,
            pool_a_vault_lp_amount,
            pool_b_vault_lp_amount,
            vault_a_lp_total_supply,
            vault_b_lp_total_supply,
            vault_a_reserve,
            vault_b_reserve,
            current_time,
            ..
        } = self.meteora_data;
        let pool_a_vault_lp_amount = *pool_a_vault_lp_amount;
        let pool_b_vault_lp_amount = *pool_b_vault_lp_amount;
        let vault_a_lp_total_supply = *vault_a_lp_total_supply;
        let vault_b_lp_total_supply = *vault_b_lp_total_supply;
        let vault_a_reserve = *vault_a_reserve;
        let vault_b_reserve = *vault_b_reserve;
        let current_time = *current_time;

        /*
         * calculateWithdrawableAmount + getAmountByShare
         */
        let token_a_amount = vault_a
            .get_amount_by_share(
                current_time,
                pool_a_vault_lp_amount,
                vault_a_lp_total_supply,
            )
            .context("Failed to get token_a_amount")?;

        let token_b_amount = vault_b
            .get_amount_by_share(
                current_time,
                pool_b_vault_lp_amount,
                vault_b_lp_total_supply,
            )
            .context("Failed to get token_b_amount")?;

        /*
         * Decide trade directions
         */
        let is_from_a_to_b = quote_params.input_mint == self.pool.token_a_mint;
        let (
            source_amount,
            swap_source_vault,
            swap_destination_vault,
            swap_source_vault_lp_supply,
            swap_destination_vault_lp_supply,
            trade_direction,
            // For Swap Result Calculations
            input_index,
        ) = if is_from_a_to_b {
            (
                quote_params.in_amount,
                vault_a,
                vault_b,
                vault_a_lp_total_supply,
                vault_b_lp_total_supply,
                TradeDirection::AtoB,
                0usize,
            )
        } else {
            (
                quote_params.in_amount,
                vault_b,
                vault_a,
                vault_b_lp_total_supply,
                vault_a_lp_total_supply,
                TradeDirection::BtoA,
                1usize,
            )
        };

        let (admin_fee, trade_fee) = get_fees(self.pool.fees, source_amount)?;

        /*
         * Source: calculateWithdrawableAmount + getUnmintAmount
         */
        let source_vault_lp = swap_source_vault
            .getunmint_amount(
                current_time,
                source_amount
                    .checked_sub(admin_fee)
                    .context("Failed to calculate out_token")?,
                swap_source_vault_lp_supply,
            )
            .context("Failed to get source_vault_lp")?;

        // Get actual source amount
        let actual_source_amount = swap_source_vault
            .get_amount_by_share(current_time, source_vault_lp, swap_source_vault_lp_supply)
            .context("Failed to get actual_source_amount")?;

        let source_amount_with_fee = actual_source_amount
            .checked_sub(trade_fee)
            .context("Failed to calculate source_amount_without_fee")?;

        let input_tokens: [u128; 2] = [token_a_amount.into(), token_b_amount.into()];

        /*
         */
        let (swap_result, output_amount): (SwapResult, u64) = match self.pool.curve_type {
            CurveType::Stable {
                amp,
                token_multiplier,
                depeg,
                last_amp_updated_timestamp,
            } => {
                let stable_curve = self
                    .stable_curve
                    .as_ref()
                    .context("Failed to get stable_curve")?;
                let updated_virtual_price = self
                    .get_depeg_base_virtual_price(&stable_curve, self.meteora_data.current_time);

                let source_amount_without_fee_upscaled: u128 =
                    if quote_params.input_mint == self.pool.token_a_mint {
                        upscale_token_a(&stable_curve, source_amount_with_fee.into())?
                    } else {
                        upscale_token_b(
                            &stable_curve,
                            source_amount_with_fee.into(),
                            updated_virtual_price,
                        )?
                    };

                let token_a_amount_upscaled =
                    upscale_token_a(&stable_curve, token_a_amount.into())?;
                let token_b_amount_upscaled =
                    upscale_token_b(&stable_curve, token_b_amount.into(), updated_virtual_price)?;

                let input_tokens_upscaled: [u128; 2] =
                    [token_a_amount_upscaled, token_b_amount_upscaled];

                let stable = Stable::new(stable_curve.amp, Fees::new(0, 0, 0, 0));

                let swap_result = stable
                    .exchange(
                        &input_tokens_upscaled,
                        source_amount_without_fee_upscaled,
                        input_index,
                        None,
                    )
                    .context("Failed to calculate swap_results")?;

                let output_amount_downscaled: u128 =
                    if quote_params.output_mint == self.pool.token_b_mint {
                        downscale_token_b(
                            stable_curve,
                            swap_result.expected_output_amount,
                            updated_virtual_price,
                        )?
                    } else {
                        downscale_token_a(stable_curve, swap_result.expected_output_amount)?
                    };

                let output_amount = u64::try_from(output_amount_downscaled)?;

                (swap_result, output_amount)
            }
            CurveType::ConstantProduct => {
                let constant_product = ConstantProduct::new(Fees::new(0, 0, 0, 0), false);

                let swap_result = constant_product
                    .exchange(
                        &input_tokens,
                        source_amount_with_fee.into(),
                        input_index,
                        None,
                    )
                    .context("Failed to calculate swap_results")?;

                let output_amount = swap_result.expected_output_amount.try_into()?;

                (swap_result, output_amount)
            }
        };

        /*
         * Destination: calculateWithdrawableAmount + getUnmintAmount
         */
        let destination_vault_lp = swap_destination_vault
            .getunmint_amount(
                current_time,
                output_amount,
                swap_destination_vault_lp_supply,
            )
            .context("Failed to get destination_vault_lp")?;

        // Get actual destination amount
        let actual_destination_amount = swap_destination_vault
            .get_amount_by_share(
                current_time,
                destination_vault_lp,
                swap_destination_vault_lp_supply,
            )
            .context("Failed to get actual_destination_amount")?;

        /*
         * Max Swap Out Amount Check
         */
        let max_swap_out_amount: u64 = calculate_max_swap_out_amount(
            trade_direction,
            token_a_amount,
            token_b_amount,
            vault_a_reserve,
            vault_b_reserve,
        )?;

        if max_swap_out_amount.lt(&actual_destination_amount) {
            bail!("Out amount > vault reserve");
        }

        let fees = Fees::new(
            self.pool.fees.trade_fee_numerator,
            self.pool.fees.trade_fee_denominator,
            self.pool.fees.owner_trade_fee_numerator,
            self.pool.fees.owner_trade_fee_denominator,
        );
        let fee_pct = fees.fee_pct().context("Failed to calculate fee_pct")?;
        let fee_amount = admin_fee
            .checked_add(trade_fee)
            .context("Failed to calculate fee_amount")?;

        Ok(Quote {
            in_amount: quote_params.in_amount,
            out_amount: actual_destination_amount.try_into()?,
            price_impact_pct: swap_result.price_impact,
            fee_pct,
            fee_mint: quote_params.output_mint,
            fee_amount,
            not_enough_liquidity: false,
            ..Quote::default()
        })
    }

    fn get_base_virtual_price(&self, depeg: DepegType) -> Option<u64> {
        let account = self.depeg_accounts.get(self.depeg_account?)?;

        match depeg {
            DepegType::Marinade => marinade::get_virtual_price(account),
            DepegType::Lido => solido::get_virtual_price(account),
            DepegType::SplStake => spl_stake::get_virtual_price(account),
            DepegType::None => None,
        }
    }

    fn get_depeg_base_virtual_price(
        &self,
        stable_curve: &StableCurve,
        current_time: u64,
    ) -> Option<u64> {
        if stable_curve.depeg.depeg_type != DepegType::None {
            let expired = current_time
                > stable_curve
                    .depeg
                    .base_cache_updated
                    .checked_add(depeg::BASE_CACHE_EXPIRES)?;

            if expired {
                return self.get_base_virtual_price(stable_curve.depeg.depeg_type);
            }
        }

        None
    }
}

fn calculate_max_swap_out_amount(
    trade_direction: TradeDirection,
    token_a_amount: u64,
    token_b_amount: u64,
    vault_a_reserve: u64,
    vault_b_reserve: u64,
) -> Result<u64> {
    let (out_total_amount, out_reserve_balance): (u64, u64) = match trade_direction {
        TradeDirection::AtoB => (token_b_amount.try_into()?, vault_b_reserve),
        TradeDirection::BtoA => (token_a_amount.try_into()?, vault_a_reserve),
    };

    if out_total_amount.gt(&out_reserve_balance) {
        Ok(out_reserve_balance)
    } else {
        Ok(out_total_amount)
    }
}

fn get_fees(fees: PoolFees, source_amount: u64) -> Result<(u64, u64)> {
    let admin_fee = u64::try_from(
        fees.owner_trading_fee(source_amount.into())
            .context("Failed to calculate admin_fee")?,
    )?;

    let trade_fee = u64::try_from(
        fees.trading_fee(source_amount.into())
            .context("Failed to calculate trade_fee")?,
    )?;

    Ok((admin_fee, trade_fee))
}

fn upscale_token_a(stable_curve: &StableCurve, token_amount: u128) -> Result<u128> {
    let normalized_token_amount = token_amount
        .checked_mul(stable_curve.token_multiplier.token_a_multiplier.into())
        .context("Failed to normalize upscale token")?;

    if stable_curve.depeg.depeg_type != DepegType::None {
        Ok(normalized_token_amount
            .checked_mul(PRECISION)
            .context("Failed to upscale token")?)
    } else {
        Ok(normalized_token_amount)
    }
}

fn downscale_token_a(stable_curve: &StableCurve, token_amount: u128) -> Result<u128> {
    let denormalized_token_amount = token_amount
        .checked_div(stable_curve.token_multiplier.token_a_multiplier.into())
        .context("Failed to normalize downscale token")?;

    if stable_curve.depeg.depeg_type != DepegType::None {
        Ok(denormalized_token_amount
            .checked_div(PRECISION)
            .context("Failed to downscale token")?)
    } else {
        Ok(denormalized_token_amount)
    }
}

fn upscale_token_b(
    stable_curve: &StableCurve,
    token_amount: u128,
    virtual_price: Option<u64>,
) -> Result<u128> {
    let normalized_token_amount = token_amount
        .checked_mul(stable_curve.token_multiplier.token_b_multiplier.into())
        .context("Failed to normalize upscale token")?;

    if stable_curve.depeg.depeg_type != DepegType::None {
        if let Some(virtual_price) = virtual_price {
            println!(
                "virtual_price: {} another_virtual_price: {}",
                virtual_price, stable_curve.depeg.base_virtual_price
            );
            Ok(normalized_token_amount
                .checked_mul(virtual_price as u128)
                .context("Failed to upscale token")?)
        } else {
            bail!("Failed to get virtual_price");
        }
    } else {
        Ok(normalized_token_amount)
    }
}

fn downscale_token_b(
    stable_curve: &StableCurve,
    token_amount: u128,
    virtual_price: Option<u64>,
) -> Result<u128> {
    let denormalized_token_amount = token_amount
        .checked_div(stable_curve.token_multiplier.token_b_multiplier.into())
        .context("Failed to normalize downscale token")?;

    if stable_curve.depeg.depeg_type != DepegType::None {
        if let Some(virtual_price) = virtual_price {
            Ok(denormalized_token_amount
                .checked_div(virtual_price as u128)
                .context("Failed to downscale token")?)
        } else {
            bail!("Failed to get virtual_price");
        }
    } else {
        Ok(denormalized_token_amount)
    }
}
