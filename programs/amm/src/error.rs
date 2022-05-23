use anchor_lang::prelude::*;

#[error_code]
pub enum PoolError {
    #[msg("Math operation overflow")]
    MathOverflow,

    #[msg("Invalid fee setup")]
    InvalidFee,

    #[msg("Fee calculation failure")]
    FeeCalculationFailure,

    #[msg("Exceeded slippage tolerance")]
    ExceededSlippage,

    #[msg("Invalid curve calculation")]
    InvalidCalculation,

    #[msg("Given pool token amount results in zero trading tokens")]
    ZeroTradingTokens,

    #[msg("Math conversion overflow")]
    ConversionError,

    #[msg("LP mint authority must be pool, without freeze authority, and 0 supply")]
    FaultyLpMint,

    #[msg("Token mint mismatched")]
    MismatchedTokenMint,

    #[msg("LP mint mismatched")]
    MismatchedLpMint,

    #[msg("Invalid lp token owner")]
    MismatchedOwner,

    #[msg("Invalid vault account")]
    InvalidVaultAccount,

    #[msg("Invalid vault lp account")]
    InvalidVaultLpAccount,

    #[msg("Invalid pool lp mint account")]
    InvalidPoolLpMintAccount,

    #[msg("Pool disabled")]
    PoolDisabled,

    #[msg("Invalid admin account")]
    InvalidAdminAccount,

    #[msg("Invalid admin fee account")]
    InvalidAdminFeeAccount,

    #[msg("Same admin account")]
    SameAdminAccount,

    #[msg("Identical user source and destination token account")]
    IdenticalSourceDestination,

    #[msg("Apy calculation error")]
    ApyCalculationError,

    #[msg("Insufficient virtual price snapshot")]
    InsufficientSnapshot,

    #[msg("Current curve is non-updatable")]
    NonUpdatableCurve,

    #[msg("New curve is mismatched with old curve")]
    MisMatchedCurve,

    #[msg("Amplification is invalid")]
    InvalidAmplification,

    #[msg("Operation is not supported")]
    UnsupportedOperation,
}
