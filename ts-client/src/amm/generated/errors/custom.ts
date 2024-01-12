export type CustomError =
  | MathOverflow
  | InvalidFee
  | InvalidInvariant
  | FeeCalculationFailure
  | ExceededSlippage
  | InvalidCalculation
  | ZeroTradingTokens
  | ConversionError
  | FaultyLpMint
  | MismatchedTokenMint
  | MismatchedLpMint
  | MismatchedOwner
  | InvalidVaultAccount
  | InvalidVaultLpAccount
  | InvalidPoolLpMintAccount
  | PoolDisabled
  | InvalidAdminAccount
  | InvalidAdminFeeAccount
  | SameAdminAccount
  | IdenticalSourceDestination
  | ApyCalculationError
  | InsufficientSnapshot
  | NonUpdatableCurve
  | MisMatchedCurve
  | InvalidAmplification
  | UnsupportedOperation
  | ExceedMaxAChanges
  | InvalidRemainingAccountsLen
  | InvalidRemainingAccounts
  | MismatchedDepegMint
  | InvalidApyAccount
  | InvalidTokenMultiplier
  | InvalidDepegInformation
  | UpdateTimeConstraint
  | ExceedMaxFeeBps
  | OwnerFeeOverHalfOfTradeFee
  | InvalidAdmin
  | PoolIsNotPermissioned
  | InvalidDepositAmount
  | InvalidFeeOwner
  | NonDepletedPool
  | AmountNotPeg

export class MathOverflow extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "MathOverflow"
  readonly msg = "Math operation overflow"

  constructor(readonly logs?: string[]) {
    super("6000: Math operation overflow")
  }
}

export class InvalidFee extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "InvalidFee"
  readonly msg = "Invalid fee setup"

  constructor(readonly logs?: string[]) {
    super("6001: Invalid fee setup")
  }
}

export class InvalidInvariant extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "InvalidInvariant"
  readonly msg = "Invalid invariant d"

  constructor(readonly logs?: string[]) {
    super("6002: Invalid invariant d")
  }
}

export class FeeCalculationFailure extends Error {
  static readonly code = 6003
  readonly code = 6003
  readonly name = "FeeCalculationFailure"
  readonly msg = "Fee calculation failure"

  constructor(readonly logs?: string[]) {
    super("6003: Fee calculation failure")
  }
}

export class ExceededSlippage extends Error {
  static readonly code = 6004
  readonly code = 6004
  readonly name = "ExceededSlippage"
  readonly msg = "Exceeded slippage tolerance"

  constructor(readonly logs?: string[]) {
    super("6004: Exceeded slippage tolerance")
  }
}

export class InvalidCalculation extends Error {
  static readonly code = 6005
  readonly code = 6005
  readonly name = "InvalidCalculation"
  readonly msg = "Invalid curve calculation"

  constructor(readonly logs?: string[]) {
    super("6005: Invalid curve calculation")
  }
}

export class ZeroTradingTokens extends Error {
  static readonly code = 6006
  readonly code = 6006
  readonly name = "ZeroTradingTokens"
  readonly msg = "Given pool token amount results in zero trading tokens"

  constructor(readonly logs?: string[]) {
    super("6006: Given pool token amount results in zero trading tokens")
  }
}

export class ConversionError extends Error {
  static readonly code = 6007
  readonly code = 6007
  readonly name = "ConversionError"
  readonly msg = "Math conversion overflow"

  constructor(readonly logs?: string[]) {
    super("6007: Math conversion overflow")
  }
}

export class FaultyLpMint extends Error {
  static readonly code = 6008
  readonly code = 6008
  readonly name = "FaultyLpMint"
  readonly msg =
    "LP mint authority must be 'A' vault lp, without freeze authority, and 0 supply"

  constructor(readonly logs?: string[]) {
    super(
      "6008: LP mint authority must be 'A' vault lp, without freeze authority, and 0 supply"
    )
  }
}

export class MismatchedTokenMint extends Error {
  static readonly code = 6009
  readonly code = 6009
  readonly name = "MismatchedTokenMint"
  readonly msg = "Token mint mismatched"

  constructor(readonly logs?: string[]) {
    super("6009: Token mint mismatched")
  }
}

export class MismatchedLpMint extends Error {
  static readonly code = 6010
  readonly code = 6010
  readonly name = "MismatchedLpMint"
  readonly msg = "LP mint mismatched"

  constructor(readonly logs?: string[]) {
    super("6010: LP mint mismatched")
  }
}

export class MismatchedOwner extends Error {
  static readonly code = 6011
  readonly code = 6011
  readonly name = "MismatchedOwner"
  readonly msg = "Invalid lp token owner"

  constructor(readonly logs?: string[]) {
    super("6011: Invalid lp token owner")
  }
}

export class InvalidVaultAccount extends Error {
  static readonly code = 6012
  readonly code = 6012
  readonly name = "InvalidVaultAccount"
  readonly msg = "Invalid vault account"

  constructor(readonly logs?: string[]) {
    super("6012: Invalid vault account")
  }
}

export class InvalidVaultLpAccount extends Error {
  static readonly code = 6013
  readonly code = 6013
  readonly name = "InvalidVaultLpAccount"
  readonly msg = "Invalid vault lp account"

  constructor(readonly logs?: string[]) {
    super("6013: Invalid vault lp account")
  }
}

export class InvalidPoolLpMintAccount extends Error {
  static readonly code = 6014
  readonly code = 6014
  readonly name = "InvalidPoolLpMintAccount"
  readonly msg = "Invalid pool lp mint account"

  constructor(readonly logs?: string[]) {
    super("6014: Invalid pool lp mint account")
  }
}

export class PoolDisabled extends Error {
  static readonly code = 6015
  readonly code = 6015
  readonly name = "PoolDisabled"
  readonly msg = "Pool disabled"

  constructor(readonly logs?: string[]) {
    super("6015: Pool disabled")
  }
}

export class InvalidAdminAccount extends Error {
  static readonly code = 6016
  readonly code = 6016
  readonly name = "InvalidAdminAccount"
  readonly msg = "Invalid admin account"

  constructor(readonly logs?: string[]) {
    super("6016: Invalid admin account")
  }
}

export class InvalidAdminFeeAccount extends Error {
  static readonly code = 6017
  readonly code = 6017
  readonly name = "InvalidAdminFeeAccount"
  readonly msg = "Invalid admin fee account"

  constructor(readonly logs?: string[]) {
    super("6017: Invalid admin fee account")
  }
}

export class SameAdminAccount extends Error {
  static readonly code = 6018
  readonly code = 6018
  readonly name = "SameAdminAccount"
  readonly msg = "Same admin account"

  constructor(readonly logs?: string[]) {
    super("6018: Same admin account")
  }
}

export class IdenticalSourceDestination extends Error {
  static readonly code = 6019
  readonly code = 6019
  readonly name = "IdenticalSourceDestination"
  readonly msg = "Identical user source and destination token account"

  constructor(readonly logs?: string[]) {
    super("6019: Identical user source and destination token account")
  }
}

export class ApyCalculationError extends Error {
  static readonly code = 6020
  readonly code = 6020
  readonly name = "ApyCalculationError"
  readonly msg = "Apy calculation error"

  constructor(readonly logs?: string[]) {
    super("6020: Apy calculation error")
  }
}

export class InsufficientSnapshot extends Error {
  static readonly code = 6021
  readonly code = 6021
  readonly name = "InsufficientSnapshot"
  readonly msg = "Insufficient virtual price snapshot"

  constructor(readonly logs?: string[]) {
    super("6021: Insufficient virtual price snapshot")
  }
}

export class NonUpdatableCurve extends Error {
  static readonly code = 6022
  readonly code = 6022
  readonly name = "NonUpdatableCurve"
  readonly msg = "Current curve is non-updatable"

  constructor(readonly logs?: string[]) {
    super("6022: Current curve is non-updatable")
  }
}

export class MisMatchedCurve extends Error {
  static readonly code = 6023
  readonly code = 6023
  readonly name = "MisMatchedCurve"
  readonly msg = "New curve is mismatched with old curve"

  constructor(readonly logs?: string[]) {
    super("6023: New curve is mismatched with old curve")
  }
}

export class InvalidAmplification extends Error {
  static readonly code = 6024
  readonly code = 6024
  readonly name = "InvalidAmplification"
  readonly msg = "Amplification is invalid"

  constructor(readonly logs?: string[]) {
    super("6024: Amplification is invalid")
  }
}

export class UnsupportedOperation extends Error {
  static readonly code = 6025
  readonly code = 6025
  readonly name = "UnsupportedOperation"
  readonly msg = "Operation is not supported"

  constructor(readonly logs?: string[]) {
    super("6025: Operation is not supported")
  }
}

export class ExceedMaxAChanges extends Error {
  static readonly code = 6026
  readonly code = 6026
  readonly name = "ExceedMaxAChanges"
  readonly msg = "Exceed max amplification changes"

  constructor(readonly logs?: string[]) {
    super("6026: Exceed max amplification changes")
  }
}

export class InvalidRemainingAccountsLen extends Error {
  static readonly code = 6027
  readonly code = 6027
  readonly name = "InvalidRemainingAccountsLen"
  readonly msg = "Invalid remaining accounts length"

  constructor(readonly logs?: string[]) {
    super("6027: Invalid remaining accounts length")
  }
}

export class InvalidRemainingAccounts extends Error {
  static readonly code = 6028
  readonly code = 6028
  readonly name = "InvalidRemainingAccounts"
  readonly msg = "Invalid remaining account"

  constructor(readonly logs?: string[]) {
    super("6028: Invalid remaining account")
  }
}

export class MismatchedDepegMint extends Error {
  static readonly code = 6029
  readonly code = 6029
  readonly name = "MismatchedDepegMint"
  readonly msg = "Token mint B doesn't matches depeg type token mint"

  constructor(readonly logs?: string[]) {
    super("6029: Token mint B doesn't matches depeg type token mint")
  }
}

export class InvalidApyAccount extends Error {
  static readonly code = 6030
  readonly code = 6030
  readonly name = "InvalidApyAccount"
  readonly msg = "Invalid APY account"

  constructor(readonly logs?: string[]) {
    super("6030: Invalid APY account")
  }
}

export class InvalidTokenMultiplier extends Error {
  static readonly code = 6031
  readonly code = 6031
  readonly name = "InvalidTokenMultiplier"
  readonly msg = "Invalid token multiplier"

  constructor(readonly logs?: string[]) {
    super("6031: Invalid token multiplier")
  }
}

export class InvalidDepegInformation extends Error {
  static readonly code = 6032
  readonly code = 6032
  readonly name = "InvalidDepegInformation"
  readonly msg = "Invalid depeg information"

  constructor(readonly logs?: string[]) {
    super("6032: Invalid depeg information")
  }
}

export class UpdateTimeConstraint extends Error {
  static readonly code = 6033
  readonly code = 6033
  readonly name = "UpdateTimeConstraint"
  readonly msg = "Update time constraint violated"

  constructor(readonly logs?: string[]) {
    super("6033: Update time constraint violated")
  }
}

export class ExceedMaxFeeBps extends Error {
  static readonly code = 6034
  readonly code = 6034
  readonly name = "ExceedMaxFeeBps"
  readonly msg = "Exceeded max fee bps"

  constructor(readonly logs?: string[]) {
    super("6034: Exceeded max fee bps")
  }
}

export class OwnerFeeOverHalfOfTradeFee extends Error {
  static readonly code = 6035
  readonly code = 6035
  readonly name = "OwnerFeeOverHalfOfTradeFee"
  readonly msg = "Owner fee exceed half of trade fee"

  constructor(readonly logs?: string[]) {
    super("6035: Owner fee exceed half of trade fee")
  }
}

export class InvalidAdmin extends Error {
  static readonly code = 6036
  readonly code = 6036
  readonly name = "InvalidAdmin"
  readonly msg = "Invalid admin"

  constructor(readonly logs?: string[]) {
    super("6036: Invalid admin")
  }
}

export class PoolIsNotPermissioned extends Error {
  static readonly code = 6037
  readonly code = 6037
  readonly name = "PoolIsNotPermissioned"
  readonly msg = "Pool is not permissioned"

  constructor(readonly logs?: string[]) {
    super("6037: Pool is not permissioned")
  }
}

export class InvalidDepositAmount extends Error {
  static readonly code = 6038
  readonly code = 6038
  readonly name = "InvalidDepositAmount"
  readonly msg = "Invalid deposit amount"

  constructor(readonly logs?: string[]) {
    super("6038: Invalid deposit amount")
  }
}

export class InvalidFeeOwner extends Error {
  static readonly code = 6039
  readonly code = 6039
  readonly name = "InvalidFeeOwner"
  readonly msg = "Invalid fee owner"

  constructor(readonly logs?: string[]) {
    super("6039: Invalid fee owner")
  }
}

export class NonDepletedPool extends Error {
  static readonly code = 6040
  readonly code = 6040
  readonly name = "NonDepletedPool"
  readonly msg = "Pool is not depleted"

  constructor(readonly logs?: string[]) {
    super("6040: Pool is not depleted")
  }
}

export class AmountNotPeg extends Error {
  static readonly code = 6041
  readonly code = 6041
  readonly name = "AmountNotPeg"
  readonly msg = "Token amount is not 1:1"

  constructor(readonly logs?: string[]) {
    super("6041: Token amount is not 1:1")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new MathOverflow(logs)
    case 6001:
      return new InvalidFee(logs)
    case 6002:
      return new InvalidInvariant(logs)
    case 6003:
      return new FeeCalculationFailure(logs)
    case 6004:
      return new ExceededSlippage(logs)
    case 6005:
      return new InvalidCalculation(logs)
    case 6006:
      return new ZeroTradingTokens(logs)
    case 6007:
      return new ConversionError(logs)
    case 6008:
      return new FaultyLpMint(logs)
    case 6009:
      return new MismatchedTokenMint(logs)
    case 6010:
      return new MismatchedLpMint(logs)
    case 6011:
      return new MismatchedOwner(logs)
    case 6012:
      return new InvalidVaultAccount(logs)
    case 6013:
      return new InvalidVaultLpAccount(logs)
    case 6014:
      return new InvalidPoolLpMintAccount(logs)
    case 6015:
      return new PoolDisabled(logs)
    case 6016:
      return new InvalidAdminAccount(logs)
    case 6017:
      return new InvalidAdminFeeAccount(logs)
    case 6018:
      return new SameAdminAccount(logs)
    case 6019:
      return new IdenticalSourceDestination(logs)
    case 6020:
      return new ApyCalculationError(logs)
    case 6021:
      return new InsufficientSnapshot(logs)
    case 6022:
      return new NonUpdatableCurve(logs)
    case 6023:
      return new MisMatchedCurve(logs)
    case 6024:
      return new InvalidAmplification(logs)
    case 6025:
      return new UnsupportedOperation(logs)
    case 6026:
      return new ExceedMaxAChanges(logs)
    case 6027:
      return new InvalidRemainingAccountsLen(logs)
    case 6028:
      return new InvalidRemainingAccounts(logs)
    case 6029:
      return new MismatchedDepegMint(logs)
    case 6030:
      return new InvalidApyAccount(logs)
    case 6031:
      return new InvalidTokenMultiplier(logs)
    case 6032:
      return new InvalidDepegInformation(logs)
    case 6033:
      return new UpdateTimeConstraint(logs)
    case 6034:
      return new ExceedMaxFeeBps(logs)
    case 6035:
      return new OwnerFeeOverHalfOfTradeFee(logs)
    case 6036:
      return new InvalidAdmin(logs)
    case 6037:
      return new PoolIsNotPermissioned(logs)
    case 6038:
      return new InvalidDepositAmount(logs)
    case 6039:
      return new InvalidFeeOwner(logs)
    case 6040:
      return new NonDepletedPool(logs)
    case 6041:
      return new AmountNotPeg(logs)
  }

  return null
}
