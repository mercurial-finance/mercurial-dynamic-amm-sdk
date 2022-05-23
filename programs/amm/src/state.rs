use anchor_lang::prelude::*;

const MAX: usize = 28;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Copy)]
pub struct PrecisionFactor {
    pub token_multiplier: Option<TokenMultiplier>, // 1 option byte + 17 - token multiplier
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Copy)]
pub struct TokenMultiplier {
    pub token_a_multiplier: u64, // 8
    pub token_b_multiplier: u64, // 8
    pub precision_factor: u8,    // 1
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Default, Clone, Copy)]
pub struct VirtualPrice {
    pub price: u64,     // 8
    pub timestamp: i64, // 8
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
pub struct SnapShot {
    pub pointer: u64,                        // 8
    pub virtual_prices: [VirtualPrice; MAX], // 16 * 28 = 448
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct PoolFees {
    pub trade_fee_numerator: u64,
    pub trade_fee_denominator: u64,

    pub owner_trade_fee_numerator: u64,
    pub owner_trade_fee_denominator: u64,
}

#[derive(Clone, Debug, AnchorDeserialize, AnchorSerialize)]
pub enum CurveType {
    /// Uniswap-style constant product curve, invariant = token_a_amount * token_b_amount
    ConstantProduct,
    /// Stable, like uniswap, but with wide zone of 1:1 instead of one point
    Stable { amp: u64 },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct PoolBumps {
    pub pool_bump: u8,
    pub a_vault_lp_bump: u8,
    pub b_vault_lp_bump: u8,
}

#[account]
#[derive(Debug)]
pub struct Pool {
    pub base: Pubkey,    //32
    pub lp_mint: Pubkey, //32

    pub token_a_mint: Pubkey, //32
    pub token_b_mint: Pubkey, //32

    pub a_vault: Pubkey, //32
    pub b_vault: Pubkey, //32

    pub a_vault_lp: Pubkey, //32
    pub b_vault_lp: Pubkey, //32

    pub bumps: PoolBumps, //3

    pub enabled: bool,             //1
    pub admin_token_a_fee: Pubkey, //32
    pub admin_token_b_fee: Pubkey, //32
    pub admin: Pubkey,             //32

    pub fees: PoolFees,        //48
    pub curve_type: CurveType, //9

    pub precision_factor: PrecisionFactor, // 18
    pub snapshot: SnapShot,                // 456
}
