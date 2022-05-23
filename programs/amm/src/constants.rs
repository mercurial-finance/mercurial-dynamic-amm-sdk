pub mod seeds {
    pub static POOL_PREFIX: &str = "pool";
}

pub mod snapshot {
    pub static SIX_HOURS: i64 = 60 * 60 * 6;
}

pub mod virtual_price {
    pub const DECIMAL: u8 = 8;
    // Up-scaling, safe
    pub const PRECISION: i32 = 10_i32.pow(DECIMAL as u32);
}
