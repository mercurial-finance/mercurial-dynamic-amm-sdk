import * as RoundDirection from "./RoundDirection"
import * as TradeDirection from "./TradeDirection"
import * as NewCurveType from "./NewCurveType"
import * as CurveType from "./CurveType"
import * as DepegType from "./DepegType"
import * as PoolType from "./PoolType"

export { TokenMultiplier } from "./TokenMultiplier"
export type {
  TokenMultiplierFields,
  TokenMultiplierJSON,
} from "./TokenMultiplier"
export { PoolFees } from "./PoolFees"
export type { PoolFeesFields, PoolFeesJSON } from "./PoolFees"
export { Depeg } from "./Depeg"
export type { DepegFields, DepegJSON } from "./Depeg"
export { Padding } from "./Padding"
export type { PaddingFields, PaddingJSON } from "./Padding"
export { RoundDirection }

/** Rounding direction */
export type RoundDirectionKind = RoundDirection.Floor | RoundDirection.Ceiling
export type RoundDirectionJSON =
  | RoundDirection.FloorJSON
  | RoundDirection.CeilingJSON

export { TradeDirection }

/** Trade (swap) direction */
export type TradeDirectionKind = TradeDirection.AtoB | TradeDirection.BtoA
export type TradeDirectionJSON =
  | TradeDirection.AtoBJSON
  | TradeDirection.BtoAJSON

export { NewCurveType }

/** Type of the swap curve */
export type NewCurveTypeKind =
  | NewCurveType.ConstantProduct
  | NewCurveType.Stable
  | NewCurveType.NewCurve
export type NewCurveTypeJSON =
  | NewCurveType.ConstantProductJSON
  | NewCurveType.StableJSON
  | NewCurveType.NewCurveJSON

export { CurveType }

/** Type of the swap curve */
export type CurveTypeKind = CurveType.ConstantProduct | CurveType.Stable
export type CurveTypeJSON = CurveType.ConstantProductJSON | CurveType.StableJSON

export { DepegType }

/** Type of depeg pool */
export type DepegTypeKind =
  | DepegType.None
  | DepegType.Marinade
  | DepegType.Lido
  | DepegType.SplStake
export type DepegTypeJSON =
  | DepegType.NoneJSON
  | DepegType.MarinadeJSON
  | DepegType.LidoJSON
  | DepegType.SplStakeJSON

export { PoolType }

/** Pool type */
export type PoolTypeKind = PoolType.Permissioned | PoolType.Permissionless
export type PoolTypeJSON =
  | PoolType.PermissionedJSON
  | PoolType.PermissionlessJSON
