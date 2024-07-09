pub mod fee_estimation;
pub mod file;
pub mod instructions;
pub mod rpc;
pub mod transaction_utils;
use crate::instructions::*;

use clap::{Parser, Subcommand};

use file::write_signature_to_file;
pub use rpc::*;
use solana_sdk::signature::Signature;
use solana_sdk::{pubkey::Pubkey, signer::keypair::Keypair};
use std::collections::BTreeMap;
use std::path::PathBuf;

pub const MAX_RETRIES: u64 = 5;

#[derive(Parser, Debug, Clone)]
#[clap(author, version, about, long_about = None)]
pub struct Args {
    #[clap(subcommand)]
    pub command: Commands,

    /// RPC url
    #[clap(long, env, default_value = "http://localhost:8899")]
    pub rpc_url: String,

    /// Payer keypair
    #[clap(long, env)]
    pub keypair_path: Option<String>,

    /// Priority fee
    #[clap(long, env, default_value = "0")]
    pub priority_fee: u64,

    /// Is simulation
    #[clap(long, env, default_value = "0")]
    pub tx_action: u8,
}

impl Args {
    pub fn to_rpc_args(&self) -> RpcArgs {
        RpcArgs {
            rpc_url: self.rpc_url.clone(),
            priority_fee: self.priority_fee,
            tx_action: self.tx_action,
            keypair_path: self.keypair_path.clone(),
        }
    }
}

pub fn handle_collect_cb_by_tx_action(
    tx_action: u8,
    dump_signature_path: Option<PathBuf>,
    result: &BTreeMap<u64, Option<TransactionPayload>>,
) {
    match tx_action {
        TX_ACTION_ESTIMATE_FEE => {
            let mut total_fee = 0u64;
            for (k, v) in result.iter() {
                if let Some(v) = v {
                    let fee: u64 = bincode::deserialize(&v.payload).unwrap();
                    println!("Fee {} {}", v.wallet_memo, fee);
                    total_fee += fee;
                } else {
                    println!("wallet {} doesn't have fee", k);
                }
            }
            println!("Total fee {}", total_fee);
        }
        TX_ACTION_SIMULATION => {
            let mut total_sol_comsumed = 0u64;
            let mut total_sol_earned = 0u64;
            for (k, v) in result.iter() {
                if let Some(v) = v {
                    let SimulationResult {
                        result,
                        pre_payer_balance,
                        post_payer_balance,
                    } = bincode::deserialize(&v.payload).unwrap();
                    match result.value.err {
                        Some(err) => {
                            println!(
                                "Wallet {}\nerror {:?}\nlog {:?}",
                                v.wallet_memo, err, result.value.logs
                            );
                        }
                        None => {
                            println!("Wallet {} simulate sucessfully", v.wallet_memo);
                            if post_payer_balance > pre_payer_balance {
                                total_sol_earned +=
                                    post_payer_balance.checked_sub(pre_payer_balance).unwrap();
                            } else {
                                total_sol_comsumed +=
                                    pre_payer_balance.checked_sub(post_payer_balance).unwrap();
                            }
                        }
                    }
                } else {
                    println!("wallet {} doesn't have simulation result", k);
                }
            }
            println!(
                "TOTAL SOL CONSUMED: {} EARNED: {}",
                total_sol_comsumed, total_sol_earned
            );
        }
        TX_ACTION_SENT_TX => {
            let mut signatures = BTreeMap::new();
            for (k, v) in result.iter() {
                if let Some(v) = v {
                    let sig: Signature = bincode::deserialize(&v.payload).unwrap();
                    println!("wallet {} Sig {}", v.wallet_memo.clone(), sig);
                    signatures.insert(v.wallet_memo.clone(), sig.to_string());
                } else {
                    println!("wallet {} doesn't have signature", k);
                }
            }

            match dump_signature_path {
                Some(value) => {
                    write_signature_to_file(signatures, &value);
                }
                None => {
                    // Do nothing
                }
            }
        }
        _ => {
            // DO nothing
        }
    }
}

// Subcommands
#[derive(Subcommand, Debug, Clone)]
pub enum Commands {
    /// Dynamic amm
    #[clap(subcommand)]
    DynamicAmm(DynamicAmmCommands),
}

fn main() {
    let args = Args::parse();

    match &args.command {
        Commands::DynamicAmm(sub_command) => match sub_command {
            DynamicAmmCommands::CreatePool(sub_args) => {
                dynamic_amm::process_new_dynamic_pool(&args, sub_args)
            }
            DynamicAmmCommands::Deposit(sub_args) => {
                dynamic_amm::process_deposit_dynamic_pool(&args, sub_args)
            }
            DynamicAmmCommands::Withdraw(sub_args) => {
                dynamic_amm::process_withdraw_dynamic_pool(&args, sub_args)
            }
            DynamicAmmCommands::Swap(sub_args) => {
                dynamic_amm::process_swap_dynamic_pool(&args, sub_args)
            }
            DynamicAmmCommands::Quote(sub_args) => {
                dynamic_amm::process_quote_dynamic_pool(&args, sub_args)
            }
            DynamicAmmCommands::GetPoolInfo(sub_args) => {
                dynamic_amm::process_get_dynamic_pool_info(&args, sub_args)
            }
        },
    }
}
