use prog_dynamic_amm::constants::depeg;
use std::convert::TryInto;

pub fn get_virtual_price(bytes: &[u8]) -> Option<u64> {
    let mut stsol_supply_byte = [0u8; 8];
    let mut stol_balance_bytes = [0u8; 8];

    stsol_supply_byte.copy_from_slice(&bytes[73..81]);
    stol_balance_bytes.copy_from_slice(&bytes[81..89]);

    let stsol_supply = u64::from_le_bytes(stsol_supply_byte);
    let sol_balance = u64::from_le_bytes(stol_balance_bytes);

    let stsol_price = (sol_balance as u128)
        .checked_mul(depeg::PRECISION as u128)?
        .checked_div(stsol_supply as u128)?;

    stsol_price.try_into().ok()
}

pub mod stake {
    use anchor_lang::prelude::declare_id;
    declare_id!("49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn");
}
