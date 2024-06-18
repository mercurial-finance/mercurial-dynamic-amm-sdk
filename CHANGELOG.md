# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## @mercurial-finance/dynamic-amm-sdk [0.4.21] - PR #117

### Added

- Introduced a new lock escrow mechanism supported by the program.
- `AmmImpl.getLockedAtaAmount` to retrieve locked LP amounts from the ATA mechanism (old mechanism).
- `AmmImpl.getLockedLpAmount` to fetch locked LP amounts from two versions of locking: ATA (old) and escrow (new), and then sum them.
- `AmmImpl.getUserLockEscrow` to obtain the user's lock escrow state.
- `AmmImpl.lockLiquidity` to lock the user's LP into the lock escrow.
- `AmmImpl.claimLockFee` to claim fees from locked LPs in the lock escrow.

## dynamic-amm [0.1.1] - PR #125

### Added

- Program endpoint `initialize_permissionless_constant_product_pool_with_config`. Able to create constant product pool based on `config` account.
- Program endpoint `create_config`. Config account store default fee configuration to be used in program endpoint `initialize_permissionless_constant_product_pool_with_config`.
- Program endpoint `remove_config`. Remove unused / misconfigured config account.
- Account `config`. Used to store default fee configuration.

### Changed

- Protocol fee is now part of LP trade fee.
- Rename of all `owner_trade_fee` related variables to `protocol_trade_fee`

### Removed

- `MigrateFeeAccount` and `SetAdminFeeAccount` event

## @mercurial-finance/dynamic-amm-sdk [0.4.22] - PR #117

### Added
- `swap` method param `referrerToken` is non-ATA address.
- `AmmImpl.lockLiquidityNewlyCreatedPool` method to help lock liquidity for pool that haven't been created yet
- `skipAta` flag to help skipping check for create ata when creating the pool in `AmmImpl.createPermissionlessPool`

## @mercurial-finance/dynamic-amm-sdk [0.4.23] - PR #125

### Changed

- Protocol fee is now part of LP trade fee.
- update swap function `referralToken` param to `referralOwner`

### Added

- `AmmImpl.createPermissionlessConstantProductPoolWithConfig` to create constant product pool based on `config` account.
- `AmmImpl.getFeeConfigurations` to get all fee configurations to be used in `AmmImpl.createPermissionlessConstantProductPoolWithConfig`
