//! Pool account state

use crate::curve::curve_type::CurveType;
use crate::curve::fees::PoolFees;
use anchor_lang::prelude::*;
use std::fmt::Debug;

// Maximum of virtual price snapshot stored for APY calculation
const MAX_SNAPSHOT: usize = 28;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Debug, Clone, Copy)]
/// Padding for future pool fields
pub struct Padding {
    /// Padding byte
    pub padding: [u128; 32], // 512
}

impl Padding {
    /// Return space for rental
    pub fn space() -> usize {
        512
    }
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Default, Clone, Copy)]
/// Virtual price snapshot
pub struct VirtualPrice {
    /// Virtual price itself
    pub price: u64, // 8
    /// The unix timestamp when the snapshot was taken
    pub timestamp: i64, // 8
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
/// Store virtual price snapshots. One snapshot will be stored per time window (6 hour). Support up to maximum 1 week (7 days)
pub struct SnapShot {
    /// Keep track of next empty slot for virtual price insertion
    pub pointer: u64, // 8
    /// Virtual price snapshots
    pub virtual_prices: [VirtualPrice; MAX_SNAPSHOT], // 16 * 28 = 448
}

impl Default for SnapShot {
    fn default() -> Self {
        SnapShot {
            pointer: 0,
            virtual_prices: [VirtualPrice::default(); MAX_SNAPSHOT],
        }
    }
}

impl SnapShot {
    /// Return space for rental
    pub fn space() -> usize {
        8 + 448
    }

    /// Return the latest virtual price from snapshot history.
    pub fn last(&self) -> Option<VirtualPrice> {
        let prev = if self.pointer == 0 {
            MAX_SNAPSHOT - 1
        } else {
            (self.pointer - 1) as usize
        };
        let virtual_price = self.virtual_prices[prev];
        if virtual_price.price == 0 {
            return None;
        }
        Some(virtual_price)
    }

    /// Return the oldest virtual price from snapshot history
    pub fn first(&self) -> Option<VirtualPrice> {
        let initial = self.pointer as usize;
        let mut current = initial;

        // While the next element is not starting index
        while (current + 1) % MAX_SNAPSHOT != initial {
            if self.virtual_prices[current].price == 0 {
                current = (current + 1) % MAX_SNAPSHOT;
            } else {
                // Earliest snapshot found
                break;
            }
        }

        let virtual_price = self.virtual_prices[current];
        if virtual_price.price == 0 {
            return None;
        }
        Some(virtual_price)
    }
}

#[account]
#[derive(Default, Debug)]
/// State of pool account
pub struct Pool {
    /// LP token mint of the pool
    pub lp_mint: Pubkey, //32
    /// Token A mint of the pool. Eg: USDT
    pub token_a_mint: Pubkey, //32
    /// Token B mint of the pool. Eg: USDC
    pub token_b_mint: Pubkey, //32
    /// Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.
    pub a_vault: Pubkey, //32
    /// Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.
    pub b_vault: Pubkey, //32
    /// LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub a_vault_lp: Pubkey, //32
    /// LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.
    pub b_vault_lp: Pubkey, //32
    /// "A" vault lp bump. Used to create signer seeds.
    pub a_vault_lp_bump: u8, //1
    /// Flag to determine whether the pool is enabled, or disabled.
    pub enabled: bool, //1
    /// Admin fee token account for token A. Used to receive trading fee.
    pub admin_token_a_fee: Pubkey, //32
    /// Admin fee token account for token B. Used to receive trading fee.
    pub admin_token_b_fee: Pubkey, //32
    /// Owner of the pool.
    pub admin: Pubkey, //32
    /// Store the fee charges setting.
    pub fees: PoolFees, //48
    /// Padding for future pool field
    pub padding: Padding, // 512 Refer: curve_type.rs for the test
    /// The type of the swap curve supported by the pool.
    // Leaving curve_type as last field give us the flexibility to add specific curve information / new curve type
    pub curve_type: CurveType, //9
}

impl Pool {
    /// Return space for rental
    pub fn space() -> usize {
        322 + PoolFees::space() + Padding::space() + CurveType::space()
    }
}
#[account]
#[derive(Default, Debug)]
/// An PDA. Store virtual prices of the pool. Used for APY calculation.
pub struct Apy {
    /// Pool address of the APY
    pub pool: Pubkey, // 32
    /// Virtual price snapshots. One snapshot will be stored per time window (6 hour). Support up to maximum 1 week (7 days)
    pub snapshot: SnapShot, // 456
}

impl Apy {
    /// Return space for rental
    pub fn space() -> usize {
        8 + 32 + SnapShot::space()
    }
}
