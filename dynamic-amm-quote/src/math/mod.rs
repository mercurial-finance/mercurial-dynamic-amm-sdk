use spl_token_swap::curve::calculator::TradeDirection;

use prog_dynamic_amm::state::CurveType;

use self::{constant_product::ConstantProduct, stable_swap::StableSwap};

mod constant_product;
mod stable_swap;

/// Encodes all results of swapping
#[derive(Debug, PartialEq)]
pub struct SwapResult {
    /// New amount of source token
    pub new_swap_source_amount: u128,
    /// New amount of destination token
    pub new_swap_destination_amount: u128,
    /// Amount of source token swapped (includes fees)
    pub source_amount_swapped: u128,
    /// Amount of destination token swapped
    pub destination_amount_swapped: u128,
}

pub trait SwapCurve {
    fn swap(
        &self,
        source_amount: u64,
        swap_source_amount: u64,
        swap_destination_amount: u64,
        trade_direction: TradeDirection,
    ) -> Option<SwapResult>;
}

/// Get swap curve for calculation
pub fn get_swap_curve(curve_type: CurveType) -> Box<dyn SwapCurve> {
    match curve_type {
        CurveType::ConstantProduct => Box::new(ConstantProduct {}),
        CurveType::Stable {
            amp,
            token_multiplier,
            depeg,
            last_amp_updated_timestamp,
        } => Box::new(StableSwap {
            amp,
            depeg,
            last_amp_updated_timestamp,
            token_multiplier,
        }),
    }
}
