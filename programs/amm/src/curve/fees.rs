//! Fees module includes information about fee charges
use crate::constants;
use crate::constants::fee::DEFAULT_FEE_DENOMINATOR;
use crate::error::PoolError;
use anchor_lang::prelude::*;
use std::convert::TryFrom;

/// Information regarding fee charges
#[derive(Copy, Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct PoolFees {
    /// Trade fees are extra token amounts that are held inside the token
    /// accounts during a trade, making the value of liquidity tokens rise.
    /// Trade fee numerator
    pub trade_fee_numerator: u64,
    /// Trade fee denominator
    pub trade_fee_denominator: u64,

    /// Owner trading fees are extra token amounts that are held inside the token
    /// accounts during a trade, with the equivalent in pool tokens minted to
    /// the owner of the program.
    /// Owner trade fee numerator
    pub owner_trade_fee_numerator: u64,
    /// Owner trade fee denominator
    pub owner_trade_fee_denominator: u64,
}

impl PoolFees {
    /// Return space for rental
    pub fn space() -> usize {
        32
    }
}

impl Default for PoolFees {
    fn default() -> Self {
        PoolFees {
            trade_fee_denominator: DEFAULT_FEE_DENOMINATOR,
            owner_trade_fee_denominator: DEFAULT_FEE_DENOMINATOR,
            trade_fee_numerator: 0,
            owner_trade_fee_numerator: 0,
        }
    }
}

/// Helper function for calculating swap fee
pub fn calculate_fee(
    token_amount: u128,
    fee_numerator: u128,
    fee_denominator: u128,
) -> Option<u128> {
    if fee_numerator == 0 || token_amount == 0 {
        Some(0)
    } else {
        let fee = token_amount
            .checked_mul(fee_numerator)?
            .checked_div(fee_denominator)?;
        if fee == 0 {
            Some(1) // minimum fee of one token
        } else {
            Some(fee)
        }
    }
}

fn validate_fraction(numerator: u64, denominator: u64) -> Result<()> {
    if denominator == 0 || numerator >= denominator {
        Err(PoolError::InvalidFee.into())
    } else {
        Ok(())
    }
}

impl PoolFees {
    /// Calculate the host trading fee in trading tokens
    pub fn host_trading_fee(&self, trading_tokens: u128) -> Option<u128> {
        calculate_fee(
            trading_tokens,
            u128::try_from(constants::fee::HOST_TRADE_FEE_NUMERATOR).ok()?,
            u128::try_from(constants::fee::DEFAULT_FEE_DENOMINATOR).ok()?,
        )
    }

    /// Calculate the trading fee in trading tokens
    pub fn trading_fee(&self, trading_tokens: u128) -> Option<u128> {
        calculate_fee(
            trading_tokens,
            u128::try_from(self.trade_fee_numerator).ok()?,
            u128::try_from(self.trade_fee_denominator).ok()?,
        )
    }

    /// Calculate the owner trading fee in trading tokens
    pub fn owner_trading_fee(&self, trading_tokens: u128) -> Option<u128> {
        calculate_fee(
            trading_tokens,
            u128::try_from(self.owner_trade_fee_numerator).ok()?,
            u128::try_from(self.owner_trade_fee_denominator).ok()?,
        )
    }

    /// Validate that the fees are reasonable
    pub fn validate(&self) -> Result<()> {
        validate_fraction(self.trade_fee_numerator, self.trade_fee_denominator)?;
        validate_fraction(
            self.owner_trade_fee_numerator,
            self.owner_trade_fee_denominator,
        )?;
        Ok(())
    }
}
