use super::*;
use meteora_stable_swap_client::fees::Fees as SaberFees;
use meteora_stable_swap_math::curve::StableSwap as SaberStableSwap;
use prog_dynamic_amm::constants::{depeg::PRECISION, fee::FEE_DENOMINATOR};
use prog_dynamic_amm::state::{Depeg, DepegType, TokenMultiplier};

/// Stable swap curve
#[derive(Clone, Copy, Debug)]
pub struct StableSwap {
    pub amp: u64,
    pub token_multiplier: TokenMultiplier,
    pub depeg: Depeg,
    pub last_amp_updated_timestamp: u64,
}

impl StableSwap {
    fn upscale_token_a(&self, token_amount: u128) -> Option<u128> {
        let normalized_token_amount = self.token_multiplier.upscale_token_a(token_amount)?;

        if self.depeg.depeg_type != DepegType::None {
            normalized_token_amount.checked_mul(PRECISION.into())
        } else {
            Some(normalized_token_amount)
        }
    }

    fn downscale_token_a(&self, token_amount: u128) -> Option<u128> {
        let denormalized_token_amount = self.token_multiplier.downscale_token_a(token_amount)?;

        if self.depeg.depeg_type != DepegType::None {
            denormalized_token_amount.checked_div(PRECISION.into())
        } else {
            Some(denormalized_token_amount)
        }
    }

    fn upscale_token_b(&self, token_amount: u128) -> Option<u128> {
        let normalized_token_amount = self.token_multiplier.upscale_token_b(token_amount)?;

        if self.depeg.depeg_type != DepegType::None {
            normalized_token_amount.checked_mul(self.depeg.base_virtual_price.into())
        } else {
            Some(normalized_token_amount)
        }
    }

    fn downscale_token_b(&self, token_amount: u128) -> Option<u128> {
        let denormalized_token_amount = self.token_multiplier.downscale_token_b(token_amount)?;

        if self.depeg.depeg_type != DepegType::None {
            denormalized_token_amount.checked_div(self.depeg.base_virtual_price.into())
        } else {
            Some(denormalized_token_amount)
        }
    }
}

impl SwapCurve for StableSwap {
    fn swap(
        &self,
        source_amount: u64,
        swap_source_amount: u64,
        swap_destination_amount: u64,
        trade_direction: TradeDirection,
    ) -> Option<SwapResult> {
        let (upscaled_source_amount, upscaled_swap_source_amount, upscaled_swap_destination_amount) =
            match trade_direction {
                TradeDirection::AtoB => (
                    self.upscale_token_a(source_amount.into())?,
                    self.upscale_token_a(swap_source_amount.into())?,
                    self.upscale_token_b(swap_destination_amount.into())?,
                ),
                TradeDirection::BtoA => (
                    self.upscale_token_b(source_amount.into())?,
                    self.upscale_token_b(swap_source_amount.into())?,
                    self.upscale_token_a(swap_destination_amount.into())?,
                ),
            };

        let saber_stable_swap: SaberStableSwap = self.into();
        let result = saber_stable_swap.swap_to2(
            upscaled_source_amount,
            upscaled_swap_source_amount,
            upscaled_swap_destination_amount,
            &SaberFees {
                admin_trade_fee_denominator: FEE_DENOMINATOR,
                admin_withdraw_fee_denominator: FEE_DENOMINATOR,
                trade_fee_denominator: FEE_DENOMINATOR,
                withdraw_fee_denominator: FEE_DENOMINATOR,
                ..Default::default()
            },
        )?;

        let downscaled_destination_amount_swapped = match trade_direction {
            TradeDirection::AtoB => self.downscale_token_b(result.amount_swapped)?,
            TradeDirection::BtoA => self.downscale_token_a(result.amount_swapped)?,
        };

        let swap_source_amount: u128 = swap_source_amount.into();
        let swap_destination_amount: u128 = swap_destination_amount.into();
        let source_amount_swapped: u128 = source_amount.into();

        let new_swap_source_amount: u128 = swap_source_amount.checked_add(source_amount_swapped)?;
        let new_swap_destination_amount =
            swap_destination_amount.checked_sub(downscaled_destination_amount_swapped)?;

        Some(SwapResult {
            source_amount_swapped,
            destination_amount_swapped: downscaled_destination_amount_swapped,
            new_swap_source_amount,
            new_swap_destination_amount,
        })
    }
}

impl From<&StableSwap> for SaberStableSwap {
    fn from(stable_swap: &StableSwap) -> Self {
        SaberStableSwap::new(stable_swap.amp, stable_swap.amp, 0, 0, 0)
    }
}
