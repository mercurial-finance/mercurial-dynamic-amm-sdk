export type Amm = {
  version: '0.4.6';
  name: 'amm';
  instructions: [
    {
      name: 'swap';
      docs: [
        'Swap token A to B, or vice versa. An amount of trading fee will be charged for liquidity provider, and the admin of the pool.',
      ];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'userSourceToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token account. Token from this account will be transfer into the vault by the pool in exchange for another token of the pool.',
          ];
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
          docs: ['User token account. The exchanged token will be transfer into this account from the pool.'];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['Lp token mint of vault a'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['Lp token mint of vault b'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'adminTokenFee';
          isMut: true;
          isSigner: false;
          docs: [
            "Admin fee token account. Used to receive trading fee. It's mint field must matched with user_source_token mint field.",
          ];
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
          docs: ['User account. Must be owner of user_source_token.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
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
      docs: ['Withdraw only single token from the pool. Only supported by pool with stable swap curve.'];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
          docs: ['User pool lp token account. LP will be burned from this account upon success liquidity removal.'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault A'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault B'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'userDestinationToken';
          isMut: true;
          isSigner: false;
          docs: ['User token account to receive token upon success liquidity removal.'];
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
          docs: ['User account. Must be owner of the user_pool_lp account.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. The pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
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
      docs: ['Deposit tokens to the pool in an imbalance ratio. Only supported by pool with stable swap curve.'];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault a'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault b'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
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
      docs: ['Withdraw tokens from the pool in a balanced ratio.'];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault a'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault b'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
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
      docs: ['Deposit tokens to the pool in a balanced ratio.'];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault a'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault b'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
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
      name: 'getPoolInfo';
      docs: ['Get the general information of the pool by using simulate.'];
      accounts: [
        {
          name: 'pool';
          isMut: false;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'lpMint';
          isMut: false;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'aVaultLp';
          isMut: false;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: false;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'aVault';
          isMut: false;
          isSigner: false;
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: false;
          isSigner: false;
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aVaultLpMint';
          isMut: false;
          isSigner: false;
          docs: ['LP token mint of vault a'];
        },
        {
          name: 'bVaultLpMint';
          isMut: false;
          isSigner: false;
          docs: ['LP token mint of vault b'];
        },
      ];
      args: [];
    },
    {
      name: 'initializePermissionlessPool';
      docs: ['initialize_permissionless_pool'];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA address)'];
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'tokenAMint';
          isMut: false;
          isSigner: false;
          docs: ['Token A mint of the pool. Eg: USDT'];
        },
        {
          name: 'tokenBMint';
          isMut: false;
          isSigner: false;
          docs: ['Token B mint of the pool. Eg: USDC'];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault A'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault B'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: ['LP token account of vault B. Used to receive/burn vault LP upon deposit/withdraw from the vault.'];
        },
        {
          name: 'payerTokenA';
          isMut: true;
          isSigner: false;
          docs: ['Payer token account for pool token A mint. Used to bootstrap the pool with initial liquidity.'];
        },
        {
          name: 'payerTokenB';
          isMut: true;
          isSigner: false;
          docs: ['Admin token account for pool token B mint. Used to bootstrap the pool with initial liquidity.'];
        },
        {
          name: 'payerPoolLp';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'adminTokenAFee';
          isMut: true;
          isSigner: false;
          docs: ['Admin fee token account for token A. Used to receive trading fee.'];
        },
        {
          name: 'adminTokenBFee';
          isMut: true;
          isSigner: false;
          docs: ['Admin fee token account for token B. Used to receive trading fee.'];
        },
        {
          name: 'payer';
          isMut: true;
          isSigner: true;
          docs: [
            'Admin account. This account will be the admin of the pool, and the payer for PDA during initialize pool.',
          ];
        },
        {
          name: 'feeOwner';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'rent';
          isMut: false;
          isSigner: false;
          docs: ['Rent account.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. The pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
        },
        {
          name: 'associatedTokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Associated token program.'];
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
          docs: ['System program.'];
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
      ];
    },
    {
      name: 'bootstrapLiquidity';
      docs: ['Bootstrap pool liquidity when it is depleted'];
      accounts: [
        {
          name: 'pool';
          isMut: true;
          isSigner: false;
          docs: ['Pool account (PDA)'];
        },
        {
          name: 'lpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of the pool'];
        },
        {
          name: 'userPoolLp';
          isMut: true;
          isSigner: false;
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'];
        },
        {
          name: 'aVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'bVaultLp';
          isMut: true;
          isSigner: false;
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ];
        },
        {
          name: 'aVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'bVault';
          isMut: true;
          isSigner: false;
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'];
        },
        {
          name: 'aVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault a'];
        },
        {
          name: 'bVaultLpMint';
          isMut: true;
          isSigner: false;
          docs: ['LP token mint of vault b'];
        },
        {
          name: 'aTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault A'];
        },
        {
          name: 'bTokenVault';
          isMut: true;
          isSigner: false;
          docs: ['Token vault account of vault B'];
        },
        {
          name: 'userAToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'userBToken';
          isMut: true;
          isSigner: false;
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ];
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'];
        },
        {
          name: 'vaultProgram';
          isMut: false;
          isSigner: false;
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'];
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
          docs: ['Token program.'];
        },
      ];
      args: [
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
  ];
  accounts: [
    {
      name: 'pool';
      docs: ['State of pool account'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'lpMint';
            docs: ['LP token mint of the pool'];
            type: 'publicKey';
          },
          {
            name: 'tokenAMint';
            docs: ['Token A mint of the pool. Eg: USDT'];
            type: 'publicKey';
          },
          {
            name: 'tokenBMint';
            docs: ['Token B mint of the pool. Eg: USDC'];
            type: 'publicKey';
          },
          {
            name: 'aVault';
            docs: [
              'Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.',
            ];
            type: 'publicKey';
          },
          {
            name: 'bVault';
            docs: [
              'Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.',
            ];
            type: 'publicKey';
          },
          {
            name: 'aVaultLp';
            docs: [
              'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
            ];
            type: 'publicKey';
          },
          {
            name: 'bVaultLp';
            docs: [
              'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
            ];
            type: 'publicKey';
          },
          {
            name: 'aVaultLpBump';
            docs: ['"A" vault lp bump. Used to create signer seeds.'];
            type: 'u8';
          },
          {
            name: 'enabled';
            docs: ['Flag to determine whether the pool is enabled, or disabled.'];
            type: 'bool';
          },
          {
            name: 'adminTokenAFee';
            docs: ['Admin fee token account for token A. Used to receive trading fee.'];
            type: 'publicKey';
          },
          {
            name: 'adminTokenBFee';
            docs: ['Admin fee token account for token B. Used to receive trading fee.'];
            type: 'publicKey';
          },
          {
            name: 'admin';
            docs: ['Owner of the pool.'];
            type: 'publicKey';
          },
          {
            name: 'fees';
            docs: ['Store the fee charges setting.'];
            type: {
              defined: 'PoolFees';
            };
          },
          {
            name: 'poolType';
            docs: ['Pool type'];
            type: {
              defined: 'PoolType';
            };
          },
          {
            name: 'stake';
            docs: ['Stake pubkey of SPL stake pool'];
            type: 'publicKey';
          },
          {
            name: 'padding';
            docs: ['Padding for future pool field'];
            type: {
              defined: 'Padding';
            };
          },
          {
            name: 'curveType';
            docs: ['The type of the swap curve supported by the pool.'];
            type: {
              defined: 'CurveType';
            };
          },
        ];
      };
    },
    {
      name: 'apy';
      docs: ['An PDA. Store virtual prices of the pool. Used for APY calculation.'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pool';
            docs: ['Pool address of the APY'];
            type: 'publicKey';
          },
          {
            name: 'snapshot';
            docs: [
              'Virtual price snapshots. One snapshot will be stored per time window (6 hour). Support up to maximum 1 week (7 days)',
            ];
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
      docs: ['Multiplier for the pool token. Used to normalized token with different decimal into the same precision.'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tokenAMultiplier';
            docs: ['Multiplier for token A of the pool.'];
            type: 'u64';
          },
          {
            name: 'tokenBMultiplier';
            docs: ['Multiplier for token B of the pool.'];
            type: 'u64';
          },
          {
            name: 'precisionFactor';
            docs: [
              'Record the highest token decimal in the pool. For example, Token A is 6 decimal, token B is 9 decimal. This will save value of 9.',
            ];
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'Depeg';
      docs: ['Contains information for depeg pool'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'baseVirtualPrice';
            docs: ['The virtual price of staking / interest bearing token'];
            type: 'u64';
          },
          {
            name: 'baseCacheUpdated';
            docs: ['The virtual price of staking / interest bearing token'];
            type: 'u64';
          },
          {
            name: 'depegType';
            docs: ['Type of the depeg pool'];
            type: {
              defined: 'DepegType';
            };
          },
        ];
      };
    },
    {
      name: 'PoolFees';
      docs: ['Information regarding fee charges'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tradeFeeNumerator';
            docs: [
              'Trade fees are extra token amounts that are held inside the token',
              'accounts during a trade, making the value of liquidity tokens rise.',
              'Trade fee numerator',
            ];
            type: 'u64';
          },
          {
            name: 'tradeFeeDenominator';
            docs: ['Trade fee denominator'];
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeNumerator';
            docs: [
              'Owner trading fees are extra token amounts that are held inside the token',
              'accounts during a trade, with the equivalent in pool tokens minted to',
              'the owner of the program.',
              'Owner trade fee numerator',
            ];
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeDenominator';
            docs: ['Owner trade fee denominator'];
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'Padding';
      docs: ['Padding for future pool fields'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'padding0';
            docs: ['Padding 0'];
            type: {
              array: ['u8', 15];
            };
          },
          {
            name: 'padding';
            docs: ['Padding 1'];
            type: {
              array: ['u128', 29];
            };
          },
        ];
      };
    },
    {
      name: 'VirtualPrice';
      docs: ['Virtual price snapshot'];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'price';
            docs: ['Virtual price itself'];
            type: 'u64';
          },
          {
            name: 'timestamp';
            docs: ['The unix timestamp when the snapshot was taken'];
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'SnapShot';
      docs: [
        'Store virtual price snapshots. One snapshot will be stored per time window (6 hour). Support up to maximum 1 week (7 days)',
      ];
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pointer';
            docs: ['Keep track of next empty slot for virtual price insertion'];
            type: 'u64';
          },
          {
            name: 'virtualPrices';
            docs: ['Virtual price snapshots'];
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
      name: 'DepegType';
      docs: ['Type of depeg pool'];
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
          {
            name: 'SplStake';
          },
        ];
      };
    },
    {
      name: 'CurveType';
      docs: ['Type of the swap curve'];
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
                docs: ['Amplification coefficient'];
                type: 'u64';
              },
              {
                name: 'token_multiplier';
                docs: [
                  'Multiplier for the pool token. Used to normalized token with different decimal into the same precision.',
                ];
                type: {
                  defined: 'TokenMultiplier';
                };
              },
              {
                name: 'depeg';
                docs: [
                  'Depeg pool information. Contains functions to allow token amount to be repeg using stake / interest bearing token virtual price',
                ];
                type: {
                  defined: 'Depeg';
                };
              },
              {
                name: 'last_amp_updated_timestamp';
                docs: [
                  'The last amp updated timestamp. Used to prevent update_curve_info called infinitely many times within a short period',
                ];
                type: 'u64';
              },
            ];
          },
        ];
      };
    },
    {
      name: 'PoolType';
      docs: ['Pool type'];
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Permissioned';
          },
          {
            name: 'Permissionless';
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
        {
          name: 'hostFee';
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
    {
      code: 6033;
      name: 'UpdateTimeConstraint';
      msg: 'Update time constraint violated';
    },
    {
      code: 6034;
      name: 'ExceedMaxFeeBps';
      msg: 'Exceeded max fee bps';
    },
    {
      code: 6035;
      name: 'OwnerFeeOverHalfOfTradeFee';
      msg: 'Owner fee exceed half of trade fee';
    },
    {
      code: 6036;
      name: 'InvalidAdmin';
      msg: 'Invalid admin';
    },
    {
      code: 6037;
      name: 'PoolIsNotPermissioned';
      msg: 'Pool is not permissioned';
    },
    {
      code: 6038;
      name: 'InvalidDepositAmount';
      msg: 'Invalid deposit amount';
    },
    {
      code: 6039;
      name: 'InvalidFeeOwner';
      msg: 'Invalid fee owner';
    },
    {
      code: 6040;
      name: 'NonDepletedPool';
      msg: 'Pool is not depleted';
    },
    {
      code: 6041;
      name: 'AmountNotPeg';
      msg: 'Token amount is not 1:1';
    },
  ];
};

export const IDL: Amm = {
  version: '0.4.6',
  name: 'amm',
  instructions: [
    {
      name: 'swap',
      docs: [
        'Swap token A to B, or vice versa. An amount of trading fee will be charged for liquidity provider, and the admin of the pool.',
      ],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'userSourceToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token account. Token from this account will be transfer into the vault by the pool in exchange for another token of the pool.',
          ],
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
          docs: ['User token account. The exchanged token will be transfer into this account from the pool.'],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['Lp token mint of vault a'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['Lp token mint of vault b'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'adminTokenFee',
          isMut: true,
          isSigner: false,
          docs: [
            "Admin fee token account. Used to receive trading fee. It's mint field must matched with user_source_token mint field.",
          ],
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
          docs: ['User account. Must be owner of user_source_token.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
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
      docs: ['Withdraw only single token from the pool. Only supported by pool with stable swap curve.'],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
          docs: ['User pool lp token account. LP will be burned from this account upon success liquidity removal.'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault A'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault B'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'userDestinationToken',
          isMut: true,
          isSigner: false,
          docs: ['User token account to receive token upon success liquidity removal.'],
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
          docs: ['User account. Must be owner of the user_pool_lp account.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. The pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
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
      docs: ['Deposit tokens to the pool in an imbalance ratio. Only supported by pool with stable swap curve.'],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault a'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault b'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
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
      docs: ['Withdraw tokens from the pool in a balanced ratio.'],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault a'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault b'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
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
      docs: ['Deposit tokens to the pool in a balanced ratio.'],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault a'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault b'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
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
      name: 'getPoolInfo',
      docs: ['Get the general information of the pool by using simulate.'],
      accounts: [
        {
          name: 'pool',
          isMut: false,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'lpMint',
          isMut: false,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'aVaultLp',
          isMut: false,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: false,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'aVault',
          isMut: false,
          isSigner: false,
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: false,
          isSigner: false,
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aVaultLpMint',
          isMut: false,
          isSigner: false,
          docs: ['LP token mint of vault a'],
        },
        {
          name: 'bVaultLpMint',
          isMut: false,
          isSigner: false,
          docs: ['LP token mint of vault b'],
        },
      ],
      args: [],
    },
    {
      name: 'initializePermissionlessPool',
      docs: ['initialize_permissionless_pool'],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA address)'],
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'tokenAMint',
          isMut: false,
          isSigner: false,
          docs: ['Token A mint of the pool. Eg: USDT'],
        },
        {
          name: 'tokenBMint',
          isMut: false,
          isSigner: false,
          docs: ['Token B mint of the pool. Eg: USDC'],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault A'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault B'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: ['LP token account of vault B. Used to receive/burn vault LP upon deposit/withdraw from the vault.'],
        },
        {
          name: 'payerTokenA',
          isMut: true,
          isSigner: false,
          docs: ['Payer token account for pool token A mint. Used to bootstrap the pool with initial liquidity.'],
        },
        {
          name: 'payerTokenB',
          isMut: true,
          isSigner: false,
          docs: ['Admin token account for pool token B mint. Used to bootstrap the pool with initial liquidity.'],
        },
        {
          name: 'payerPoolLp',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'adminTokenAFee',
          isMut: true,
          isSigner: false,
          docs: ['Admin fee token account for token A. Used to receive trading fee.'],
        },
        {
          name: 'adminTokenBFee',
          isMut: true,
          isSigner: false,
          docs: ['Admin fee token account for token B. Used to receive trading fee.'],
        },
        {
          name: 'payer',
          isMut: true,
          isSigner: true,
          docs: [
            'Admin account. This account will be the admin of the pool, and the payer for PDA during initialize pool.',
          ],
        },
        {
          name: 'feeOwner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
          docs: ['Rent account.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. The pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
        },
        {
          name: 'associatedTokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Associated token program.'],
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
          docs: ['System program.'],
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
      ],
    },
    {
      name: 'bootstrapLiquidity',
      docs: ['Bootstrap pool liquidity when it is depleted'],
      accounts: [
        {
          name: 'pool',
          isMut: true,
          isSigner: false,
          docs: ['Pool account (PDA)'],
        },
        {
          name: 'lpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of the pool'],
        },
        {
          name: 'userPoolLp',
          isMut: true,
          isSigner: false,
          docs: ['user pool lp token account. lp will be burned from this account upon success liquidity removal.'],
        },
        {
          name: 'aVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'bVaultLp',
          isMut: true,
          isSigner: false,
          docs: [
            'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
          ],
        },
        {
          name: 'aVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token a. token a of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'bVault',
          isMut: true,
          isSigner: false,
          docs: ['Vault account for token b. token b of the pool will be deposit / withdraw from this vault account.'],
        },
        {
          name: 'aVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault a'],
        },
        {
          name: 'bVaultLpMint',
          isMut: true,
          isSigner: false,
          docs: ['LP token mint of vault b'],
        },
        {
          name: 'aTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault A'],
        },
        {
          name: 'bTokenVault',
          isMut: true,
          isSigner: false,
          docs: ['Token vault account of vault B'],
        },
        {
          name: 'userAToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token A account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'userBToken',
          isMut: true,
          isSigner: false,
          docs: [
            'User token B account. Token will be transfer from this account if it is add liquidity operation. Else, token will be transfer into this account.',
          ],
        },
        {
          name: 'user',
          isMut: false,
          isSigner: true,
          docs: ['User account. Must be owner of user_a_token, and user_b_token.'],
        },
        {
          name: 'vaultProgram',
          isMut: false,
          isSigner: false,
          docs: ['Vault program. the pool will deposit/withdraw liquidity from the vault.'],
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
          docs: ['Token program.'],
        },
      ],
      args: [
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
  ],
  accounts: [
    {
      name: 'pool',
      docs: ['State of pool account'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'lpMint',
            docs: ['LP token mint of the pool'],
            type: 'publicKey',
          },
          {
            name: 'tokenAMint',
            docs: ['Token A mint of the pool. Eg: USDT'],
            type: 'publicKey',
          },
          {
            name: 'tokenBMint',
            docs: ['Token B mint of the pool. Eg: USDC'],
            type: 'publicKey',
          },
          {
            name: 'aVault',
            docs: [
              'Vault account for token A. Token A of the pool will be deposit / withdraw from this vault account.',
            ],
            type: 'publicKey',
          },
          {
            name: 'bVault',
            docs: [
              'Vault account for token B. Token B of the pool will be deposit / withdraw from this vault account.',
            ],
            type: 'publicKey',
          },
          {
            name: 'aVaultLp',
            docs: [
              'LP token account of vault A. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
            ],
            type: 'publicKey',
          },
          {
            name: 'bVaultLp',
            docs: [
              'LP token account of vault B. Used to receive/burn the vault LP upon deposit/withdraw from the vault.',
            ],
            type: 'publicKey',
          },
          {
            name: 'aVaultLpBump',
            docs: ['"A" vault lp bump. Used to create signer seeds.'],
            type: 'u8',
          },
          {
            name: 'enabled',
            docs: ['Flag to determine whether the pool is enabled, or disabled.'],
            type: 'bool',
          },
          {
            name: 'adminTokenAFee',
            docs: ['Admin fee token account for token A. Used to receive trading fee.'],
            type: 'publicKey',
          },
          {
            name: 'adminTokenBFee',
            docs: ['Admin fee token account for token B. Used to receive trading fee.'],
            type: 'publicKey',
          },
          {
            name: 'admin',
            docs: ['Owner of the pool.'],
            type: 'publicKey',
          },
          {
            name: 'fees',
            docs: ['Store the fee charges setting.'],
            type: {
              defined: 'PoolFees',
            },
          },
          {
            name: 'poolType',
            docs: ['Pool type'],
            type: {
              defined: 'PoolType',
            },
          },
          {
            name: 'stake',
            docs: ['Stake pubkey of SPL stake pool'],
            type: 'publicKey',
          },
          {
            name: 'padding',
            docs: ['Padding for future pool field'],
            type: {
              defined: 'Padding',
            },
          },
          {
            name: 'curveType',
            docs: ['The type of the swap curve supported by the pool.'],
            type: {
              defined: 'CurveType',
            },
          },
        ],
      },
    },
    {
      name: 'apy',
      docs: ['An PDA. Store virtual prices of the pool. Used for APY calculation.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pool',
            docs: ['Pool address of the APY'],
            type: 'publicKey',
          },
          {
            name: 'snapshot',
            docs: [
              'Virtual price snapshots. One snapshot will be stored per time window (6 hour). Support up to maximum 1 week (7 days)',
            ],
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
      docs: ['Multiplier for the pool token. Used to normalized token with different decimal into the same precision.'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tokenAMultiplier',
            docs: ['Multiplier for token A of the pool.'],
            type: 'u64',
          },
          {
            name: 'tokenBMultiplier',
            docs: ['Multiplier for token B of the pool.'],
            type: 'u64',
          },
          {
            name: 'precisionFactor',
            docs: [
              'Record the highest token decimal in the pool. For example, Token A is 6 decimal, token B is 9 decimal. This will save value of 9.',
            ],
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'Depeg',
      docs: ['Contains information for depeg pool'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'baseVirtualPrice',
            docs: ['The virtual price of staking / interest bearing token'],
            type: 'u64',
          },
          {
            name: 'baseCacheUpdated',
            docs: ['The virtual price of staking / interest bearing token'],
            type: 'u64',
          },
          {
            name: 'depegType',
            docs: ['Type of the depeg pool'],
            type: {
              defined: 'DepegType',
            },
          },
        ],
      },
    },
    {
      name: 'PoolFees',
      docs: ['Information regarding fee charges'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tradeFeeNumerator',
            docs: [
              'Trade fees are extra token amounts that are held inside the token',
              'accounts during a trade, making the value of liquidity tokens rise.',
              'Trade fee numerator',
            ],
            type: 'u64',
          },
          {
            name: 'tradeFeeDenominator',
            docs: ['Trade fee denominator'],
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeNumerator',
            docs: [
              'Owner trading fees are extra token amounts that are held inside the token',
              'accounts during a trade, with the equivalent in pool tokens minted to',
              'the owner of the program.',
              'Owner trade fee numerator',
            ],
            type: 'u64',
          },
          {
            name: 'ownerTradeFeeDenominator',
            docs: ['Owner trade fee denominator'],
            type: 'u64',
          },
        ],
      },
    },
    {
      name: 'Padding',
      docs: ['Padding for future pool fields'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'padding0',
            docs: ['Padding 0'],
            type: {
              array: ['u8', 15],
            },
          },
          {
            name: 'padding',
            docs: ['Padding 1'],
            type: {
              array: ['u128', 29],
            },
          },
        ],
      },
    },
    {
      name: 'VirtualPrice',
      docs: ['Virtual price snapshot'],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            docs: ['Virtual price itself'],
            type: 'u64',
          },
          {
            name: 'timestamp',
            docs: ['The unix timestamp when the snapshot was taken'],
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'SnapShot',
      docs: [
        'Store virtual price snapshots. One snapshot will be stored per time window (6 hour). Support up to maximum 1 week (7 days)',
      ],
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pointer',
            docs: ['Keep track of next empty slot for virtual price insertion'],
            type: 'u64',
          },
          {
            name: 'virtualPrices',
            docs: ['Virtual price snapshots'],
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
      name: 'DepegType',
      docs: ['Type of depeg pool'],
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
          {
            name: 'SplStake',
          },
        ],
      },
    },
    {
      name: 'CurveType',
      docs: ['Type of the swap curve'],
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
                docs: ['Amplification coefficient'],
                type: 'u64',
              },
              {
                name: 'token_multiplier',
                docs: [
                  'Multiplier for the pool token. Used to normalized token with different decimal into the same precision.',
                ],
                type: {
                  defined: 'TokenMultiplier',
                },
              },
              {
                name: 'depeg',
                docs: [
                  'Depeg pool information. Contains functions to allow token amount to be repeg using stake / interest bearing token virtual price',
                ],
                type: {
                  defined: 'Depeg',
                },
              },
              {
                name: 'last_amp_updated_timestamp',
                docs: [
                  'The last amp updated timestamp. Used to prevent update_curve_info called infinitely many times within a short period',
                ],
                type: 'u64',
              },
            ],
          },
        ],
      },
    },
    {
      name: 'PoolType',
      docs: ['Pool type'],
      type: {
        kind: 'enum',
        variants: [
          {
            name: 'Permissioned',
          },
          {
            name: 'Permissionless',
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
        {
          name: 'hostFee',
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
    {
      code: 6033,
      name: 'UpdateTimeConstraint',
      msg: 'Update time constraint violated',
    },
    {
      code: 6034,
      name: 'ExceedMaxFeeBps',
      msg: 'Exceeded max fee bps',
    },
    {
      code: 6035,
      name: 'OwnerFeeOverHalfOfTradeFee',
      msg: 'Owner fee exceed half of trade fee',
    },
    {
      code: 6036,
      name: 'InvalidAdmin',
      msg: 'Invalid admin',
    },
    {
      code: 6037,
      name: 'PoolIsNotPermissioned',
      msg: 'Pool is not permissioned',
    },
    {
      code: 6038,
      name: 'InvalidDepositAmount',
      msg: 'Invalid deposit amount',
    },
    {
      code: 6039,
      name: 'InvalidFeeOwner',
      msg: 'Invalid fee owner',
    },
    {
      code: 6040,
      name: 'NonDepletedPool',
      msg: 'Pool is not depleted',
    },
    {
      code: 6041,
      name: 'AmountNotPeg',
      msg: 'Token amount is not 1:1',
    },
  ],
};
