pub mod marinade;
pub mod solido;
pub mod spl_stake;

use crate::{constants::depeg::BASE_CACHE_EXPIRES, curve::curve_type::DepegType, error::PoolError};
use anchor_lang::prelude::*;

/// Contains information for depeg pool
#[derive(Clone, Copy, Debug, Default, AnchorSerialize, AnchorDeserialize)]
pub struct Depeg {
    /// The virtual price of staking / interest bearing token
    pub base_virtual_price: u64,
    /// The virtual price of staking / interest bearing token
    pub base_cache_updated: u64,
    /// Type of the depeg pool
    pub depeg_type: DepegType,
}

impl Depeg {
    /// Update the base virtual price if expired
    pub fn update_base_virtual_price(&mut self, timestamp: u64, account: &[u8]) -> Result<()> {
        // Only depeg stable swap pool need to update the base virtual price, constant product and stable swap will do nothing
        if self.depeg_type != DepegType::None {
            let cache_expire_time = self
                .base_cache_updated
                .checked_add(BASE_CACHE_EXPIRES)
                .ok_or(PoolError::MathOverflow)?;

            if timestamp > cache_expire_time {
                let virtual_price = match self.depeg_type {
                    DepegType::Marinade => {
                        crate::curve::depeg::marinade::get_virtual_price(account)
                            .ok_or(PoolError::MathOverflow)?
                    }
                    DepegType::Lido => crate::curve::depeg::solido::get_virtual_price(account)
                        .ok_or(PoolError::MathOverflow)?,
                    DepegType::SplStake => {
                        crate::curve::depeg::spl_stake::get_virtual_price(account)
                            .ok_or(PoolError::MathOverflow)?
                    }
                    DepegType::None => {
                        return Err(PoolError::InvalidDepegInformation.into());
                    }
                };

                self.base_cache_updated = timestamp;
                self.base_virtual_price = virtual_price;
            }
        }

        Ok(())
    }
}
