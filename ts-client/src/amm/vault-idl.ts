export type Vault = {
  version: '0.5.1';
  name: 'vault';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        {
          name: 'base';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'feeVault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
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
      args: [];
    },
    {
      name: 'enableVault';
      accounts: [
        {
          name: 'vault';
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
          name: 'enabled';
          type: 'u8';
        },
      ];
    },
    {
      name: 'setOperator';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'operator';
          isMut: false;
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
      name: 'updateLockedProfitDegradation';
      accounts: [
        {
          name: 'vault';
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
          name: 'lockedProfitDegradation';
          type: 'u64';
        },
      ];
    },
    {
      name: 'getUnlockedAmount';
      accounts: [
        {
          name: 'vault';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'transferAdmin';
      accounts: [
        {
          name: 'vault';
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
      name: 'transferFeeVault';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'newFeeVault';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'initializeStrategy';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'strategyProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'strategy';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reserve';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'collateralMint';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'admin';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
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
          name: 'bumps';
          type: {
            defined: 'StrategyBumps';
          };
        },
        {
          name: 'strategyType';
          type: {
            defined: 'StrategyType';
          };
        },
      ];
    },
    {
      name: 'removeStrategy';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'strategy';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'strategyProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reserve';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'feeVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
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
      name: 'addStrategy';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'strategy';
          isMut: false;
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
      name: 'depositStrategy';
      accounts: [
        {
          name: 'userInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'assetPoolSpl';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolSummaries';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'priceSummaries';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userInfoSignerPda';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'basePda';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userPagesStats';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawStrategy';
      accounts: [
        {
          name: 'userInfo';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'assetPoolSpl';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolSummaries';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'priceSummaries';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userInfoSignerPda';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'basePda';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userPagesStats';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'claimRewards';
      accounts: [
        {
          name: 'vault';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'strategy';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'tokenRewardAcc';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'operator';
          isMut: false;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'deposit';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'tokenAmount';
          type: 'u64';
        },
        {
          name: 'minimumLpTokenAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdraw';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'unmintAmount';
          type: 'u64';
        },
        {
          name: 'minOutAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawDirectlyFromStrategy';
      accounts: [
        {
          name: 'vault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'strategy';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'reserve';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'strategyProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'collateralVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'feeVault';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userToken';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'unmintAmount';
          type: 'u64';
        },
        {
          name: 'minOutAmount';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'vault';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'enabled';
            type: 'u8';
          },
          {
            name: 'bumps';
            type: {
              defined: 'VaultBumps';
            };
          },
          {
            name: 'totalAmount';
            type: 'u64';
          },
          {
            name: 'tokenVault';
            type: 'publicKey';
          },
          {
            name: 'feeVault';
            type: 'publicKey';
          },
          {
            name: 'tokenMint';
            type: 'publicKey';
          },
          {
            name: 'lpMint';
            type: 'publicKey';
          },
          {
            name: 'strategies';
            type: {
              array: ['publicKey', 30];
            };
          },
          {
            name: 'base';
            type: 'publicKey';
          },
          {
            name: 'admin';
            type: 'publicKey';
          },
          {
            name: 'operator';
            type: 'publicKey';
          },
          {
            name: 'lockedProfitTracker';
            type: {
              defined: 'LockedProfitTracker';
            };
          },
        ];
      };
    },
    {
      name: 'strategy';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'reserve';
            type: 'publicKey';
          },
          {
            name: 'collateralVault';
            type: 'publicKey';
          },
          {
            name: 'strategyType';
            type: {
              defined: 'StrategyType';
            };
          },
          {
            name: 'currentLiquidity';
            type: 'u64';
          },
          {
            name: 'bumps';
            type: {
              array: ['u8', 10];
            };
          },
          {
            name: 'vault';
            type: 'publicKey';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'VaultBumps';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'vaultBump';
            type: 'u8';
          },
          {
            name: 'tokenVaultBump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'StrategyBumps';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'strategyIndex';
            type: 'u8';
          },
          {
            name: 'otherBumps';
            type: {
              array: ['u8', 10];
            };
          },
        ];
      };
    },
    {
      name: 'LockedProfitTracker';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lastUpdatedLockedProfit';
            type: 'u64';
          },
          {
            name: 'lastReport';
            type: 'u64';
          },
          {
            name: 'lockedProfitDegradation';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'StrategyType';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'PortFinanceWithoutLM';
          },
          {
            name: 'PortFinanceWithLM';
          },
          {
            name: 'SolendWithoutLM';
          },
          {
            name: 'Mango';
          },
          {
            name: 'SolendWithLM';
          },
          {
            name: 'ApricotWithoutLM';
          },
          {
            name: 'Francium';
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
          name: 'tokenAmount';
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
          name: 'tokenAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'StrategyDeposit';
      fields: [
        {
          name: 'strategyType';
          type: {
            defined: 'StrategyType';
          };
          index: false;
        },
        {
          name: 'tokenAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'StrategyWithdraw';
      fields: [
        {
          name: 'strategyType';
          type: {
            defined: 'StrategyType';
          };
          index: false;
        },
        {
          name: 'collateralAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'estimatedTokenAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'ClaimReward';
      fields: [
        {
          name: 'strategyType';
          type: {
            defined: 'StrategyType';
          };
          index: false;
        },
        {
          name: 'tokenAmount';
          type: 'u64';
          index: false;
        },
        {
          name: 'mintAccount';
          type: 'publicKey';
          index: false;
        },
      ];
    },
    {
      name: 'PerformanceFee';
      fields: [
        {
          name: 'lpMintMore';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'ReportLoss';
      fields: [
        {
          name: 'strategy';
          type: 'publicKey';
          index: false;
        },
        {
          name: 'loss';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'TotalAmount';
      fields: [
        {
          name: 'totalAmount';
          type: 'u64';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'VaultIsDisabled';
      msg: 'Vault is disabled';
    },
    {
      code: 6001;
      name: 'ExceededSlippage';
      msg: 'Exceeded slippage tolerance';
    },
    {
      code: 6002;
      name: 'StrategyIsNotExisted';
      msg: 'Strategy is not existed';
    },
    {
      code: 6003;
      name: 'UnAuthorized';
      msg: 'UnAuthorized';
    },
    {
      code: 6004;
      name: 'MathOverflow';
      msg: 'Math operation overflow';
    },
    {
      code: 6005;
      name: 'ProtocolIsNotSupported';
      msg: 'Protocol is not supported';
    },
    {
      code: 6006;
      name: 'UnMatchReserve';
      msg: 'Reserve does not support token mint';
    },
    {
      code: 6007;
      name: 'InvalidLockedProfitDegradation';
      msg: 'lockedProfitDegradation is invalid';
    },
    {
      code: 6008;
      name: 'MaxStrategyReached';
      msg: 'Maximum number of strategies have been reached';
    },
    {
      code: 6009;
      name: 'StrategyExisted';
      msg: 'Strategy existed';
    },
    {
      code: 6010;
      name: 'InvalidUnmintAmount';
      msg: 'Invalid unmint amount';
    },
    {
      code: 6011;
      name: 'InvalidAccountsForStrategy';
      msg: 'Invalid accounts for strategy';
    },
    {
      code: 6012;
      name: 'InvalidBump';
      msg: 'Invalid bump';
    },
    {
      code: 6013;
      name: 'AmountMustGreaterThanZero';
      msg: 'Amount must be greater than 0';
    },
  ];
};

export const IDL: Vault = {
  version: '0.5.1',
  name: 'vault',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        {
          name: 'base',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'feeVault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
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
      args: [],
    },
    {
      name: 'enableVault',
      accounts: [
        {
          name: 'vault',
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
          name: 'enabled',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setOperator',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'operator',
          isMut: false,
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
      name: 'updateLockedProfitDegradation',
      accounts: [
        {
          name: 'vault',
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
          name: 'lockedProfitDegradation',
          type: 'u64',
        },
      ],
    },
    {
      name: 'getUnlockedAmount',
      accounts: [
        {
          name: 'vault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'transferAdmin',
      accounts: [
        {
          name: 'vault',
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
      name: 'transferFeeVault',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newFeeVault',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeStrategy',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'strategyProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reserve',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'collateralMint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'admin',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
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
          name: 'bumps',
          type: {
            defined: 'StrategyBumps',
          },
        },
        {
          name: 'strategyType',
          type: {
            defined: 'StrategyType',
          },
        },
      ],
    },
    {
      name: 'removeStrategy',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'strategyProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reserve',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
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
      name: 'addStrategy',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'strategy',
          isMut: false,
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
      name: 'depositStrategy',
      accounts: [
        {
          name: 'userInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'assetPoolSpl',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolSummaries',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'priceSummaries',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userInfoSignerPda',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'basePda',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userPagesStats',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawStrategy',
      accounts: [
        {
          name: 'userInfo',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'assetPoolSpl',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'poolSummaries',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'priceSummaries',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userInfoSignerPda',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'basePda',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'userPagesStats',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'amount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'claimRewards',
      accounts: [
        {
          name: 'vault',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'strategy',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenRewardAcc',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'operator',
          isMut: false,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'deposit',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'tokenAmount',
          type: 'u64',
        },
        {
          name: 'minimumLpTokenAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdraw',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'unmintAmount',
          type: 'u64',
        },
        {
          name: 'minOutAmount',
          type: 'u64',
        },
      ],
    },
    {
      name: 'withdrawDirectlyFromStrategy',
      accounts: [
        {
          name: 'vault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'strategy',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'reserve',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'strategyProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'collateralVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userToken',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'userLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'unmintAmount',
          type: 'u64',
        },
        {
          name: 'minOutAmount',
          type: 'u64',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'vault',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'enabled',
            type: 'u8',
          },
          {
            name: 'bumps',
            type: {
              defined: 'VaultBumps',
            },
          },
          {
            name: 'totalAmount',
            type: 'u64',
          },
          {
            name: 'tokenVault',
            type: 'publicKey',
          },
          {
            name: 'feeVault',
            type: 'publicKey',
          },
          {
            name: 'tokenMint',
            type: 'publicKey',
          },
          {
            name: 'lpMint',
            type: 'publicKey',
          },
          {
            name: 'strategies',
            type: {
              array: ['publicKey', 30],
            },
          },
          {
            name: 'base',
            type: 'publicKey',
          },
          {
            name: 'admin',
            type: 'publicKey',
          },
          {
            name: 'operator',
            type: 'publicKey',
          },
          {
            name: 'lockedProfitTracker',
            type: {
              defined: 'LockedProfitTracker',
            },
          },
        ],
      },
    },
    {
      name: 'strategy',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'reserve',
            type: 'publicKey',
          },
          {
            name: 'collateralVault',
            type: 'publicKey',
          },
          {
            name: 'strategyType',
            type: {
              defined: 'StrategyType',
            },
          },
          {
            name: 'currentLiquidity',
            type: 'u64',
          },
          {
            name: 'bumps',
            type: {
              array: ['u8', 10],
            },
          },
          {
            name: 'vault',
            type: 'publicKey',
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'VaultBumps',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'vaultBump',
            type: 'u8',
          },
          {
            name: 'tokenVaultBump',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'StrategyBumps',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'strategyIndex',
            type: 'u8',
          },
          {
            name: 'otherBumps',
            type: {
              array: ['u8', 10],
            },
          },
        ],
      },
    },
    {
      name: 'LockedProfitTracker',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lastUpdatedLockedProfit',
            type: 'u64',
          },
          {
            name: 'lastReport',
            type: 'u64',
          },
          {
            name: 'lockedProfitDegradation',
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'StrategyType',
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'PortFinanceWithoutLM',
          },
          {
            name: 'PortFinanceWithLM',
          },
          {
            name: 'SolendWithoutLM',
          },
          {
            name: 'Mango',
          },
          {
            name: 'SolendWithLM',
          },
          {
            name: 'ApricotWithoutLM',
          },
          {
            name: 'Francium',
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
          name: 'tokenAmount',
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
          name: 'tokenAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'StrategyDeposit',
      fields: [
        {
          name: 'strategyType',
          type: {
            defined: 'StrategyType',
          },
          index: false,
        },
        {
          name: 'tokenAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'StrategyWithdraw',
      fields: [
        {
          name: 'strategyType',
          type: {
            defined: 'StrategyType',
          },
          index: false,
        },
        {
          name: 'collateralAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'estimatedTokenAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'ClaimReward',
      fields: [
        {
          name: 'strategyType',
          type: {
            defined: 'StrategyType',
          },
          index: false,
        },
        {
          name: 'tokenAmount',
          type: 'u64',
          index: false,
        },
        {
          name: 'mintAccount',
          type: 'publicKey',
          index: false,
        },
      ],
    },
    {
      name: 'PerformanceFee',
      fields: [
        {
          name: 'lpMintMore',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'ReportLoss',
      fields: [
        {
          name: 'strategy',
          type: 'publicKey',
          index: false,
        },
        {
          name: 'loss',
          type: 'u64',
          index: false,
        },
      ],
    },
    {
      name: 'TotalAmount',
      fields: [
        {
          name: 'totalAmount',
          type: 'u64',
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'VaultIsDisabled',
      msg: 'Vault is disabled',
    },
    {
      code: 6001,
      name: 'ExceededSlippage',
      msg: 'Exceeded slippage tolerance',
    },
    {
      code: 6002,
      name: 'StrategyIsNotExisted',
      msg: 'Strategy is not existed',
    },
    {
      code: 6003,
      name: 'UnAuthorized',
      msg: 'UnAuthorized',
    },
    {
      code: 6004,
      name: 'MathOverflow',
      msg: 'Math operation overflow',
    },
    {
      code: 6005,
      name: 'ProtocolIsNotSupported',
      msg: 'Protocol is not supported',
    },
    {
      code: 6006,
      name: 'UnMatchReserve',
      msg: 'Reserve does not support token mint',
    },
    {
      code: 6007,
      name: 'InvalidLockedProfitDegradation',
      msg: 'lockedProfitDegradation is invalid',
    },
    {
      code: 6008,
      name: 'MaxStrategyReached',
      msg: 'Maximum number of strategies have been reached',
    },
    {
      code: 6009,
      name: 'StrategyExisted',
      msg: 'Strategy existed',
    },
    {
      code: 6010,
      name: 'InvalidUnmintAmount',
      msg: 'Invalid unmint amount',
    },
    {
      code: 6011,
      name: 'InvalidAccountsForStrategy',
      msg: 'Invalid accounts for strategy',
    },
    {
      code: 6012,
      name: 'InvalidBump',
      msg: 'Invalid bump',
    },
    {
      code: 6013,
      name: 'AmountMustGreaterThanZero',
      msg: 'Amount must be greater than 0',
    },
  ],
};
