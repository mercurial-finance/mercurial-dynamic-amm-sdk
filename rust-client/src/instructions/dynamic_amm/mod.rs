use crate::*;
pub mod create_pool;
pub use create_pool::*;

// pub mod check_pool_info;
// pub use check_pool_info::*;

pub mod deposit;
pub use deposit::*;
pub mod withdraw;
pub use withdraw::*;

pub mod swap;
pub use swap::*;

pub mod pda;
pub use pda::*;

#[derive(Debug, Parser, Clone)]
pub enum DynamicAmmCommands {
    /// Create pool
    CreatePool(CreateDynamicAmmPoolArgs),
    /// Deposit
    Deposit(DepositDynamicAmmArgs),
    /// Withdraw
    Withdraw(WithdrawDynamicAmmArgs),
    /// Swap
    Swap(SwapDynamicAmmArgs),
    // /// Swap
    // CheckPool(CheckDynamicAmmPoolArgs),
}
