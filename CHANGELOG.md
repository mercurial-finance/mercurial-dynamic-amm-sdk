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
- New lock escrow mechanism supported by program
- `AmmImpl.getLockedAtaAmount`: get locked lp amounts from ata mechanism (old mechanism)
- `AmmImpl.getLockedLpAmount`: get locked lp amounts on 2 versions of locking: ata (old) and escrow (new), then sum them
- `AmmImpl.getUserLockEscrow`: get user's lock escrow state
- `AmmImpl.lockLiquidity`: do lock user's lp into lock escrow
- `AmmImpl.claimLockFee`: do claim fee from locked lps in lock escrow
