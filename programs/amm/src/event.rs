use anchor_lang::prelude::*;

#[event]
pub struct AddLiquidity {
    pub lp_mint_amount: u64,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
}

#[event]
pub struct RemoveLiquidity {
    pub lp_unmint_amount: u64,
    pub token_a_out_amount: u64,
    pub token_b_out_amount: u64,
}

#[event]
pub struct Swap {
    pub in_amount: u64,
    pub out_amount: u64,
    pub trade_fee: u64,
    pub admin_fee: u64,
}

#[event]
#[derive(Default)]
pub struct SetPoolFees {
    pub trade_fee_numerator: u64,
    pub trade_fee_denominator: u64,
    pub owner_trade_fee_numerator: u64,
    pub owner_trade_fee_denominator: u64,
    pub owner_withdraw_fee_numerator: u64,
    pub owner_withdraw_fee_denominator: u64,
    pub host_fee_numerator: u64,
    pub host_fee_denominator: u64,
}

#[event]
pub struct PoolInfo {
    pub token_a_amount: u64,
    pub token_b_amount: u64,
    pub virtual_price: f64,
    pub apy: f64,
}

#[event]
pub struct TransferAdmin {
    pub admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct SetAdminFeeAccount {
    pub admin_token_a_fee: Pubkey,
    pub admin_token_b_fee: Pubkey,
    pub new_admin_token_a_fee: Pubkey,
    pub new_admin_token_b_fee: Pubkey,
}
