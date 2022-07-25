export type Amm = {
  version: '0.4.0';
  name: 'amm';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenAMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenBMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminTokenA';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminTokenB';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminPoolLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminTokenAFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminTokenBFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'apy';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'curveType';
          type: {
            defined: 'CurveType';
          };
        },
        {
          name: 'tokenAAmount';
          type: 'u64';
        },
        {
          name: 'tokenBAmount';
          type: 'u64';
        },
        {
          name: 'invariantD';
          type: 'u64';
        },
      ];
    },
    {
      name: 'enableOrDisablePool';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'enable';
          type: 'bool';
        },
      ];
    },
    {
      name: 'swap';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminTokenFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'inAmount';
          type: 'u64';
        },
        {
          name: 'minimumOutAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'removeLiquiditySingleSide';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'minimumOutAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'addImbalanceLiquidity';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'minimumPoolTokenAmount';
          type: 'u64';
        },
        {
          name: 'tokenAAmount';
          type: 'u64';
        },
        {
          name: 'tokenBAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'removeBalanceLiquidity';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'minimumATokenOut';
          type: 'u64';
        },
        {
          name: 'minimumBTokenOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'addBalanceLiquidity';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'maximumTokenAAmount';
          type: 'u64';
        },
        {
          name: 'maximumTokenBAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setPoolFees';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'fees';
          type: {
            defined: 'PoolFees';
          };
        },
      ];
    },
    {
      name: 'overrideCurveParam';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'curveType';
          type: {
            defined: 'CurveType';
          };
        },
      ];
    },
    {
      name: 'transferAdmin';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'newAdmin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'setAdminFeeAccount';
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'newAdminTokenAFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'newAdminTokenBFee';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'syncApy';
      accounts: [
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'apy';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'getPoolInfo';
      accounts: [
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVaultLp';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bVaultLp';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'aVaultLpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'bVaultLpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'apy';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'pool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpMint';
            type: 'publicKey';
          },
          {
            name: 'tokenAMint';
            type: 'publicKey';
          },
          {
            name: 'tokenBMint';
            type: 'publicKey';
          },
          {
            name: 'aVault';
            type: 'publicKey';
          },
          {
            name: 'bVault';
            type: 'publicKey';
          },
          {
            name: 'aVaultLp';
            type: 'publicKey';
          },
          {
            name: 'bVaultLp';
            type: 'publicKey';
          },
          {
            name: 'aVaultLpBump';
            type: 'u8';
          },
          {
            name: 'enabled';
            type: 'bool';
          },
          {
            name: 'adminTokenAFee';
            type: 'publicKey';
          },
          {
            name: 'adminTokenBFee';
            type: 'publicKey';
          },
          {
            name: 'admin';
            type: 'publicKey';
          },
          {
            name: 'fees';
            type: {
              defined: 'PoolFees';
            };
          },
          {
            name: 'padding';
            type: {
              defined: 'Padding';
            };
          },
          {
            name: 'curveType';
            type: {
              defined: 'CurveType';
            };
          },
        ];
      };
    },
    {
      name: 'apy';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            type: 'publicKey';
          },
          {
            name: 'snapshot';
            type: {
              defined: 'SnapShot';
            };
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'TokenMultiplier';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tokenAMultiplier';
            type: 'u64';
          },
          {
            name: 'tokenBMultiplier';
            type: 'u64';
          },
          {
            name: 'precisionFactor';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'PoolFees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tradeFeeNumerator';
            type: 'u64';
          },
          {
            name: 'tradeFeeDenominator';
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeNumerator';
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeDenominator';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Depeg';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseVirtualPrice';
            type: 'u64';
          },
          {
            name: 'baseCacheUpdated';
            type: 'u64';
          },
          {
            name: 'depegType';
            type: {
              defined: 'DepegType';
            };
          },
        ];
      };
    },
    {
      name: 'Padding';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'padding';
            type: {
              array: ['u128', 32];
            };
          },
        ];
      };
    },
    {
      name: 'VirtualPrice';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            type: 'u64';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'SnapShot';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pointer';
            type: 'u64';
          },
          {
            name: 'virtualPrices';
            type: {
              array: [
                {
                  defined: 'VirtualPrice';
                },
                28,
              ];
            };
          },
        ];
      };
    },
    {
      name: 'RoundDirection';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Floor';
          },
          {
            name: 'Ceiling';
          },
        ];
      };
    },
    {
      name: 'TradeDirection';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'AtoB';
          },
          {
            name: 'BtoA';
          },
        ];
      };
    },
    {
      name: 'NewCurveType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'ConstantProduct';
          },
          {
            name: 'Stable';
            fields: [
              {
                name: 'amp';
                type: 'u64';
              },
              {
                name: 'token_multiplier';
                type: {
                  defined: 'TokenMultiplier';
                };
              },
              {
                name: 'depeg';
                type: {
                  defined: 'Depeg';
                };
              },
            ];
          },
          {
            name: 'NewCurve';
            fields: [
              {
                name: 'field_one';
                type: 'u64';
              },
              {
                name: 'field_two';
                type: 'u64';
              },
            ];
          },
        ];
      };
    },
    {
      name: 'CurveType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'ConstantProduct';
          },
          {
            name: 'Stable';
            fields: [
              {
                name: 'amp';
                type: 'u64';
              },
              {
                name: 'token_multiplier';
                type: {
                  defined: 'TokenMultiplier';
                };
              },
              {
                name: 'depeg';
                type: {
                  defined: 'Depeg';
                };
              },
            ];
          },
        ];
      };
    },
    {
      name: 'DepegType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'None';
          },
          {
            name: 'Marinade';
          },
          {
            name: 'Lido';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'AddLiquidity';
      fields: [
        {
          name: 'lpMintAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenAAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenBAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'RemoveLiquidity';
      fields: [
        {
          name: 'lpUnmintAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenAOutAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenBOutAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'Swap';
      fields: [
        {
          name: 'inAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'outAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tradeFee';
          type: 'u64';
          index: false;
        },
        {
          name: 'adminFee';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'SetPoolFees';
      fields: [
        {
          name: 'tradeFeeNumerator';
          type: 'u64';
          index: false;
        },
        {
          name: 'tradeFeeDenominator';
          type: 'u64';
          index: false;
        },
        {
          name: 'ownerTradeFeeNumerator';
          type: 'u64';
          index: false;
        },
        {
          name: 'ownerTradeFeeDenominator';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'PoolInfo';
      fields: [
        {
          name: 'tokenAAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'tokenBAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'virtualPrice';
          type: 'f64';
          index: false;
        },
        {
          name: 'firstVirtualPrice';
          type: 'f64';
          index: false;
        },
        {
          name: 'firstTimestamp';
          type: 'u64';
          index: false;
        },
        {
          name: 'currentTimestamp';
          type: 'u64';
          index: false;
        },
        {
          name: 'apy';
          type: 'f64';
          index: false;
        },
      ];
    },
    {
      name: 'TransferAdmin';
      fields: [
        {
          name: 'admin';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'newAdmin';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'SetAdminFeeAccount';
      fields: [
        {
          name: 'adminTokenAFee';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'adminTokenBFee';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'newAdminTokenAFee';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'newAdminTokenBFee';
          type: 'publicKey';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'MathOverflow';
      msg: 'Math operation overflow';
    },
    {
      code: 6001;
      name: 'InvalidFee';
      msg: 'Invalid fee setup';
    },
    {
      code: 6002;
      name: 'InvalidInvariant';
      msg: 'Invalid invariant d';
    },
    {
      code: 6003;
      name: 'FeeCalculationFailure';
      msg: 'Fee calculation failure';
    },
    {
      code: 6004;
      name: 'ExceededSlippage';
      msg: 'Exceeded slippage tolerance';
    },
    {
      code: 6005;
      name: 'InvalidCalculation';
      msg: 'Invalid curve calculation';
    },
    {
      code: 6006;
      name: 'ZeroTradingTokens';
      msg: 'Given pool token amount results in zero trading tokens';
    },
    {
      code: 6007;
      name: 'ConversionError';
      msg: 'Math conversion overflow';
    },
    {
      code: 6008;
      name: 'FaultyLpMint';
      msg: "LP mint authority must be 'A' vault lp, without freeze authority, and 0 supply";
    },
    {
      code: 6009;
      name: 'MismatchedTokenMint';
      msg: 'Token mint mismatched';
    },
    {
      code: 6010;
      name: 'MismatchedLpMint';
      msg: 'LP mint mismatched';
    },
    {
      code: 6011;
      name: 'MismatchedOwner';
      msg: 'Invalid lp token owner';
    },
    {
      code: 6012;
      name: 'InvalidVaultAccount';
      msg: 'Invalid vault account';
    },
    {
      code: 6013;
      name: 'InvalidVaultLpAccount';
      msg: 'Invalid vault lp account';
    },
    {
      code: 6014;
      name: 'InvalidPoolLpMintAccount';
      msg: 'Invalid pool lp mint account';
    },
    {
      code: 6015;
      name: 'PoolDisabled';
      msg: 'Pool disabled';
    },
    {
      code: 6016;
      name: 'InvalidAdminAccount';
      msg: 'Invalid admin account';
    },
    {
      code: 6017;
      name: 'InvalidAdminFeeAccount';
      msg: 'Invalid admin fee account';
    },
    {
      code: 6018;
      name: 'SameAdminAccount';
      msg: 'Same admin account';
    },
    {
      code: 6019;
      name: 'IdenticalSourceDestination';
      msg: 'Identical user source and destination token account';
    },
    {
      code: 6020;
      name: 'ApyCalculationError';
      msg: 'Apy calculation error';
    },
    {
      code: 6021;
      name: 'InsufficientSnapshot';
      msg: 'Insufficient virtual price snapshot';
    },
    {
      code: 6022;
      name: 'NonUpdatableCurve';
      msg: 'Current curve is non-updatable';
    },
    {
      code: 6023;
      name: 'MisMatchedCurve';
      msg: 'New curve is mismatched with old curve';
    },
    {
      code: 6024;
      name: 'InvalidAmplification';
      msg: 'Amplification is invalid';
    },
    {
      code: 6025;
      name: 'UnsupportedOperation';
      msg: 'Operation is not supported';
    },
    {
      code: 6026;
      name: 'ExceedMaxAChanges';
      msg: 'Exceed max amplification changes';
    },
    {
      code: 6027;
      name: 'InvalidRemainingAccountsLen';
      msg: 'Invalid remaining accounts length';
    },
    {
      code: 6028;
      name: 'InvalidRemainingAccounts';
      msg: 'Invalid remaining account';
    },
    {
      code: 6029;
      name: 'MismatchedDepegMint';
      msg: "Token mint B doesn't matches depeg type token mint";
    },
    {
      code: 6030;
      name: 'InvalidApyAccount';
      msg: 'Invalid APY account';
    },
    {
      code: 6031;
      name: 'InvalidTokenMultiplier';
      msg: 'Invalid token multiplier';
    },
    {
      code: 6032;
      name: 'InvalidDepegInformation';
      msg: 'Invalid depeg information';
    },
  ];
};

export const IDL: Amm = {
  version: '0.4.0',
  name: 'amm',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenAMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenBMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminTokenA',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminTokenB',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminPoolLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminTokenAFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminTokenBFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'apy',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'curveType',
          type: {
            defined: 'CurveType',
          },
        },
        {
          name: 'tokenAAmount',
          type: 'u64',
        },
        {
          name: 'tokenBAmount',
          type: 'u64',
        },
        {
          name: 'invariantD',
          type: 'u64',
        },
      ],
    },
    {
      name: 'enableOrDisablePool',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'enable',
          type: 'bool',
        },
      ],
    },
    {
      name: 'swap',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminTokenFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'inAmount',
          type: 'u64',
        },
        {
          name: 'minimumOutAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'removeLiquiditySingleSide',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolTokenAmount',
          type: 'u64',
        },
        {
          name: 'minimumOutAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'addImbalanceLiquidity',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'minimumPoolTokenAmount',
          type: 'u64',
        },
        {
          name: 'tokenAAmount',
          type: 'u64',
        },
        {
          name: 'tokenBAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'removeBalanceLiquidity',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolTokenAmount',
          type: 'u64',
        },
        {
          name: 'minimumATokenOut',
          type: 'u64',
        },
        {
          name: 'minimumBTokenOut',
          type: 'u64',
        },
      ],
    },
    {
      name: 'addBalanceLiquidity',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'poolTokenAmount',
          type: 'u64',
        },
        {
          name: 'maximumTokenAAmount',
          type: 'u64',
        },
        {
          name: 'maximumTokenBAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'setPoolFees',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'fees',
          type: {
            defined: 'PoolFees',
          },
        },
      ],
    },
    {
      name: 'overrideCurveParam',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'curveType',
          type: {
            defined: 'CurveType',
          },
        },
      ],
    },
    {
      name: 'transferAdmin',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newAdmin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'setAdminFeeAccount',
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'newAdminTokenAFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'newAdminTokenBFee',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'syncApy',
      accounts: [
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'apy',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'getPoolInfo',
      accounts: [
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVaultLp',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bVaultLp',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bVault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'aVaultLpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'bVaultLpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'apy',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'pool',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lpMint',
            type: 'publicKey',
          },
          {
            name: 'tokenAMint',
            type: 'publicKey',
          },
          {
            name: 'tokenBMint',
            type: 'publicKey',
          },
          {
            name: 'aVault',
            type: 'publicKey',
          },
          {
            name: 'bVault',
            type: 'publicKey',
          },
          {
            name: 'aVaultLp',
            type: 'publicKey',
          },
          {
            name: 'bVaultLp',
            type: 'publicKey',
          },
          {
            name: 'aVaultLpBump',
            type: 'u8',
          },
          {
            name: 'enabled',
            type: 'bool',
          },
          {
            name: 'adminTokenAFee',
            type: 'publicKey',
          },
          {
            name: 'adminTokenBFee',
            type: 'publicKey',
          },
          {
            name: 'admin',
            type: 'publicKey',
          },
          {
            name: 'fees',
            type: {
              defined: 'PoolFees',
            },
          },
          {
            name: 'padding',
            type: {
              defined: 'Padding',
            },
          },
          {
            name: 'curveType',
            type: {
              defined: 'CurveType',
            },
          },
        ],
      },
    },
    {
      name: 'apy',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pool',
            type: 'publicKey',
          },
          {
            name: 'snapshot',
            type: {
              defined: 'SnapShot',
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'TokenMultiplier',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tokenAMultiplier',
            type: 'u64',
          },
          {
            name: 'tokenBMultiplier',
            type: 'u64',
          },
          {
            name: 'precisionFactor',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'PoolFees',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tradeFeeNumerator',
            type: 'u64',
          },
          {
            name: 'tradeFeeDenominator',
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeNumerator',
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeDenominator',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Depeg',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseVirtualPrice',
            type: 'u64',
          },
          {
            name: 'baseCacheUpdated',
            type: 'u64',
          },
          {
            name: 'depegType',
            type: {
              defined: 'DepegType',
            },
          },
        ],
      },
    },
    {
      name: 'Padding',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'padding',
            type: {
              array: ['u128', 32],
            },
          },
        ],
      },
    },
    {
      name: 'VirtualPrice',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u64',
          },
          {
            name: 'timestamp',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'SnapShot',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pointer',
            type: 'u64',
          },
          {
            name: 'virtualPrices',
            type: {
              array: [
                {
                  defined: 'VirtualPrice',
                },
                28,
              ],
            },
          },
        ],
      },
    },
    {
      name: 'RoundDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Floor',
          },
          {
            name: 'Ceiling',
          },
        ],
      },
    },
    {
      name: 'TradeDirection',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'AtoB',
          },
          {
            name: 'BtoA',
          },
        ],
      },
    },
    {
      name: 'NewCurveType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ConstantProduct',
          },
          {
            name: 'Stable',
            fields: [
              {
                name: 'amp',
                type: 'u64',
              },
              {
                name: 'token_multiplier',
                type: {
                  defined: 'TokenMultiplier',
                },
              },
              {
                name: 'depeg',
                type: {
                  defined: 'Depeg',
                },
              },
            ],
          },
          {
            name: 'NewCurve',
            fields: [
              {
                name: 'field_one',
                type: 'u64',
              },
              {
                name: 'field_two',
                type: 'u64',
              },
            ],
          },
        ],
      },
    },
    {
      name: 'CurveType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'ConstantProduct',
          },
          {
            name: 'Stable',
            fields: [
              {
                name: 'amp',
                type: 'u64',
              },
              {
                name: 'token_multiplier',
                type: {
                  defined: 'TokenMultiplier',
                },
              },
              {
                name: 'depeg',
                type: {
                  defined: 'Depeg',
                },
              },
            ],
          },
        ],
      },
    },
    {
      name: 'DepegType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'None',
          },
          {
            name: 'Marinade',
          },
          {
            name: 'Lido',
          },
        ],
      },
    },
  ],
  events: [
    {
      name: 'AddLiquidity',
      fields: [
        {
          name: 'lpMintAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenAAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenBAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'RemoveLiquidity',
      fields: [
        {
          name: 'lpUnmintAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenAOutAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenBOutAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'Swap',
      fields: [
        {
          name: 'inAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'outAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tradeFee',
          type: 'u64',
          index: false,
        },
        {
          name: 'adminFee',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'SetPoolFees',
      fields: [
        {
          name: 'tradeFeeNumerator',
          type: 'u64',
          index: false,
        },
        {
          name: 'tradeFeeDenominator',
          type: 'u64',
          index: false,
        },
        {
          name: 'ownerTradeFeeNumerator',
          type: 'u64',
          index: false,
        },
        {
          name: 'ownerTradeFeeDenominator',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'PoolInfo',
      fields: [
        {
          name: 'tokenAAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'tokenBAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'virtualPrice',
          type: 'f64',
          index: false,
        },
        {
          name: 'firstVirtualPrice',
          type: 'f64',
          index: false,
        },
        {
          name: 'firstTimestamp',
          type: 'u64',
          index: false,
        },
        {
          name: 'currentTimestamp',
          type: 'u64',
          index: false,
        },
        {
          name: 'apy',
          type: 'f64',
          index: false,
        },
      ],
    },
    {
      name: 'TransferAdmin',
      fields: [
        {
          name: 'admin',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'newAdmin',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'SetAdminFeeAccount',
      fields: [
        {
          name: 'adminTokenAFee',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'adminTokenBFee',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'newAdminTokenAFee',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'newAdminTokenBFee',
          type: 'publicKey',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'MathOverflow',
      msg: 'Math operation overflow',
    },
    {
      code: 6001,
      name: 'InvalidFee',
      msg: 'Invalid fee setup',
    },
    {
      code: 6002,
      name: 'InvalidInvariant',
      msg: 'Invalid invariant d',
    },
    {
      code: 6003,
      name: 'FeeCalculationFailure',
      msg: 'Fee calculation failure',
    },
    {
      code: 6004,
      name: 'ExceededSlippage',
      msg: 'Exceeded slippage tolerance',
    },
    {
      code: 6005,
      name: 'InvalidCalculation',
      msg: 'Invalid curve calculation',
    },
    {
      code: 6006,
      name: 'ZeroTradingTokens',
      msg: 'Given pool token amount results in zero trading tokens',
    },
    {
      code: 6007,
      name: 'ConversionError',
      msg: 'Math conversion overflow',
    },
    {
      code: 6008,
      name: 'FaultyLpMint',
      msg: "LP mint authority must be 'A' vault lp, without freeze authority, and 0 supply",
    },
    {
      code: 6009,
      name: 'MismatchedTokenMint',
      msg: 'Token mint mismatched',
    },
    {
      code: 6010,
      name: 'MismatchedLpMint',
      msg: 'LP mint mismatched',
    },
    {
      code: 6011,
      name: 'MismatchedOwner',
      msg: 'Invalid lp token owner',
    },
    {
      code: 6012,
      name: 'InvalidVaultAccount',
      msg: 'Invalid vault account',
    },
    {
      code: 6013,
      name: 'InvalidVaultLpAccount',
      msg: 'Invalid vault lp account',
    },
    {
      code: 6014,
      name: 'InvalidPoolLpMintAccount',
      msg: 'Invalid pool lp mint account',
    },
    {
      code: 6015,
      name: 'PoolDisabled',
      msg: 'Pool disabled',
    },
    {
      code: 6016,
      name: 'InvalidAdminAccount',
      msg: 'Invalid admin account',
    },
    {
      code: 6017,
      name: 'InvalidAdminFeeAccount',
      msg: 'Invalid admin fee account',
    },
    {
      code: 6018,
      name: 'SameAdminAccount',
      msg: 'Same admin account',
    },
    {
      code: 6019,
      name: 'IdenticalSourceDestination',
      msg: 'Identical user source and destination token account',
    },
    {
      code: 6020,
      name: 'ApyCalculationError',
      msg: 'Apy calculation error',
    },
    {
      code: 6021,
      name: 'InsufficientSnapshot',
      msg: 'Insufficient virtual price snapshot',
    },
    {
      code: 6022,
      name: 'NonUpdatableCurve',
      msg: 'Current curve is non-updatable',
    },
    {
      code: 6023,
      name: 'MisMatchedCurve',
      msg: 'New curve is mismatched with old curve',
    },
    {
      code: 6024,
      name: 'InvalidAmplification',
      msg: 'Amplification is invalid',
    },
    {
      code: 6025,
      name: 'UnsupportedOperation',
      msg: 'Operation is not supported',
    },
    {
      code: 6026,
      name: 'ExceedMaxAChanges',
      msg: 'Exceed max amplification changes',
    },
    {
      code: 6027,
      name: 'InvalidRemainingAccountsLen',
      msg: 'Invalid remaining accounts length',
    },
    {
      code: 6028,
      name: 'InvalidRemainingAccounts',
      msg: 'Invalid remaining account',
    },
    {
      code: 6029,
      name: 'MismatchedDepegMint',
      msg: "Token mint B doesn't matches depeg type token mint",
    },
    {
      code: 6030,
      name: 'InvalidApyAccount',
      msg: 'Invalid APY account',
    },
    {
      code: 6031,
      name: 'InvalidTokenMultiplier',
      msg: 'Invalid token multiplier',
    },
    {
      code: 6032,
      name: 'InvalidDepegInformation',
      msg: 'Invalid depeg information',
    },
  ],
};
