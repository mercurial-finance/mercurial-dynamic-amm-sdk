# Mercurial Dynamic AMM CLI

# Build
`cargo build -p cli`

# Example

```
$cli --rpc-url $rpc --priority-fee $priority_fee --keypair-path $root_keypair dynamic-amm create-pool\
 --token-a-mint $token_a_mint --token-b-mint $token_b_mint --trade-fee-bps $trade_fee_bps --token-a-amount $token_a_amount --token-b-amount $token_b_amount
```

Allowed trade_fee_bps:

```
// 0.25%, 1%, 4%, 6%
&[25, 100, 400, 600]
```