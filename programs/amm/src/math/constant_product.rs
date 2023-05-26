use super::*;
use spl_token_swap::curve::{calculator::SwapWithoutFeesResult, constant_product::swap};

pub struct ConstantProduct {}

impl SwapCurve for ConstantProduct {
    fn swap(
        &self,
        source_amount: u64,
        swap_source_amount: u64,
        swap_destination_amount: u64,
        _trade_direction: TradeDirection,
    ) -> Option<SwapResult> {
        let source_amount: u128 = source_amount.into();
        let swap_source_amount: u128 = swap_source_amount.into();
        let swap_destination_amount: u128 = swap_destination_amount.into();

        let SwapWithoutFeesResult {
            source_amount_swapped,
            destination_amount_swapped,
        } = swap(source_amount, swap_source_amount, swap_destination_amount)?;

        Some(SwapResult {
            new_swap_source_amount: swap_source_amount.checked_add(source_amount_swapped)?,
            new_swap_destination_amount: swap_destination_amount
                .checked_sub(destination_amount_swapped)?,
            source_amount_swapped,
            destination_amount_swapped,
        })
    }
}
