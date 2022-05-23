pub mod constants;
pub mod context;
pub mod error;
pub mod event;
pub mod state;
pub mod utils;
pub mod vault_utils;

use anchor_lang::prelude::*;
use std::str::FromStr;

declare_id!("Beij2k6WeaG8mpriaKDgfbkHm8HJqiizcBTrV57VTCVq");

pub fn get_base_key() -> Pubkey {
    Pubkey::from_str("H9NnqW5Thn9dUzW3DRXe2xDhKjwZd4qbjngnZwEvnDuC").unwrap()
}

#[program]
pub mod amm {
    use super::*;
}
