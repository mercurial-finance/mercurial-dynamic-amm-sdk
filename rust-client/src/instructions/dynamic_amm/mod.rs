use crate::*;
pub mod create_pool;
pub use create_pool::*;
pub mod deposit;
pub use deposit::*;
pub mod withdraw;
pub use withdraw::*;

pub mod swap;
pub use swap::*;

pub mod quote;
pub use quote::*;

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
    /// Quote
    Quote(QuoteDynamicAmmArgs),
}
