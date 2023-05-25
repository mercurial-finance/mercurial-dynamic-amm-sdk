#![cfg(feature = "test-bpf")]

use std::{
    collections::HashMap,
    fs::{self, File},
    str::FromStr,
};

use amm::{
    curve::curve_type::{CurveType, DepegType},
    depeg::{marinade, solido},
    state::Pool,
    utils::{compute_quote, QuoteData},
};
use anchor_lang::{
    prelude::{AccountMeta, Clock, Pubkey},
    AccountDeserialize, InstructionData, ToAccountMetas,
};
use anchor_spl::token::{Mint, TokenAccount};
use mercurial_vault::state::Vault;
use solana_account_decoder::UiAccount;
use solana_client::rpc_response::RpcKeyedAccount;
use solana_program_test::*;
use solana_sdk::{
    account::Account, compute_budget::ComputeBudgetInstruction, instruction::Instruction,
    native_token::LAMPORTS_PER_SOL, program_option::COption, program_pack::Pack, pubkey,
    signature::Keypair, signer::Signer, system_program, transaction::Transaction,
};
use spl_associated_token_account::get_associated_token_address;
use spl_token_swap::curve::calculator::TradeDirection;

const USDC_USDT: Pubkey = pubkey!("32D4zRxNc1EssbJieVHfPhZM3rH6CzfUPrWUuWxD9prG");
const SOL_USDT: Pubkey = pubkey!("9CopBY6iQBaZKAhhQANfy7g4VXZkx9zKm8AisPd5Ufay");
const MSOL_SOL: Pubkey = pubkey!("HcjZvfeSNJbNkfLD4eEcRBr96AD3w1GpmMppaeRZf7ur");
const STSOL_SOL: Pubkey = pubkey!("7EJSgV2pthhDfb4UiER9vzTqe2eojei9GEQAQnkqJ96e");
const JITOSOL_SOL: Pubkey = pubkey!("ERgpKaq59Nnfm9YRVAAhnq16cZhHxGcDoDWCzXbhiaNw");

fn create_ata_account(user: &Pubkey, mint: &Pubkey, amount: u64) -> (Pubkey, Account) {
    let ata = get_associated_token_address(user, mint);

    let mut is_native = COption::None;
    let mut lamports = 10_000_000;

    if mint == &anchor_spl::token::spl_token::native_mint::ID {
        let rent = 2_039_280;
        is_native = COption::Some(rent);
        lamports = amount + rent;
    }

    let token_account = anchor_spl::token::spl_token::state::Account {
        mint: *mint,
        owner: *user,
        amount,
        delegate: COption::None,
        state: anchor_spl::token::spl_token::state::AccountState::Initialized,
        is_native,
        delegated_amount: 0,
        close_authority: COption::None,
    };
    let mut data = [0; anchor_spl::token::spl_token::state::Account::LEN].to_vec();
    anchor_spl::token::spl_token::state::Account::pack(token_account, &mut data).unwrap();

    (
        ata,
        Account {
            lamports,
            data,
            owner: anchor_spl::token::spl_token::ID,
            executable: false,
            rent_epoch: 0,
        },
    )
}

struct SetupContext {
    context: ProgramTestContext,
    user: Keypair,
}

async fn setup() -> SetupContext {
    let mut test = ProgramTest::new(amm::ID.to_string().as_str(), amm::ID, None);
    test.prefer_bpf(true);

    let user_keypair = Keypair::new();

    let user = user_keypair.pubkey();
    test.add_account(
        user,
        Account {
            lamports: 2_000_000 * LAMPORTS_PER_SOL,
            data: vec![],
            owner: system_program::ID,
            executable: false,
            rent_epoch: 0,
        },
    );

    let path_to_fixtures = format!("./tests/fixtures");
    let fixtures_path = fs::read_dir(&path_to_fixtures).unwrap();

    for fixture in fixtures_path {
        let file_name = fixture.unwrap().file_name().into_string().unwrap();
        let strings: Vec<&str> = file_name.split(".").collect();

        let name = strings[0];
        let extension = strings[1];
        let pubkey = Pubkey::from_str(name).unwrap();

        if extension == "so" {
            test.add_program(name, pubkey, None);
        } else {
            let file = File::open(format!("{}/{}", path_to_fixtures, file_name)).unwrap();
            let keyed_account: RpcKeyedAccount = serde_json::from_reader(file).unwrap();
            let account: Account = UiAccount::decode(&keyed_account.account).unwrap();

            let mint_account =
                anchor_spl::token::Mint::try_deserialize(&mut &*account.data.as_ref());

            if mint_account.is_ok() {
                let (ata, token_account) = create_ata_account(
                    &user,
                    &pubkey,
                    // 1 mil
                    1_000_000 * 10u64.pow(mint_account.unwrap().decimals.into()),
                );
                test.add_account(ata, token_account);
            }

            test.add_account(pubkey, account);
        }
    }

    let wsol_ata = spl_associated_token_account::get_associated_token_address(
        &user_keypair.pubkey(),
        &anchor_spl::token::spl_token::native_mint::id(),
    );

    let create_wsol_ata_ix = spl_associated_token_account::create_associated_token_account(
        &user_keypair.pubkey(),
        &user_keypair.pubkey(),
        &anchor_spl::token::spl_token::native_mint::id(),
    );

    let transfer_sol_ix = anchor_lang::solana_program::system_instruction::transfer(
        &user_keypair.pubkey(),
        &wsol_ata,
        1_000_000 * LAMPORTS_PER_SOL,
    );

    let sync_native_ix = anchor_spl::token::spl_token::instruction::sync_native(
        &anchor_spl::token::spl_token::id(),
        &wsol_ata,
    )
    .unwrap();

    let mut context = test.start_with_context().await;

    let recent_blockhash = context.banks_client.get_latest_blockhash().await.unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &[create_wsol_ata_ix, transfer_sol_ix, sync_native_ix],
        Some(&user_keypair.pubkey()),
        &vec![&user_keypair],
        recent_blockhash,
    );

    context
        .banks_client
        .process_transaction_with_preflight(transaction)
        .await
        .unwrap();

    SetupContext {
        context,
        user: user_keypair,
    }
}

async fn fetch_and_deserialize<T: anchor_lang::AccountDeserialize>(
    banks_client: &mut BanksClient,
    pubkey: Pubkey,
) -> T {
    let account = banks_client.get_account(pubkey).await.unwrap();
    let account = account.unwrap();
    T::try_deserialize(&mut &*account.data).unwrap()
}

async fn fetch_quote_data(banks_client: &mut BanksClient, pool_pubkey: Pubkey) -> QuoteData {
    let pool: Pool = fetch_and_deserialize(banks_client, pool_pubkey).await;

    let pool_vault_a_lp_token: TokenAccount =
        fetch_and_deserialize(banks_client, pool.a_vault_lp).await;

    let pool_vault_b_lp_token: TokenAccount =
        fetch_and_deserialize(banks_client, pool.b_vault_lp).await;

    let account = banks_client
        .get_account(anchor_lang::solana_program::sysvar::clock::ID)
        .await
        .unwrap()
        .unwrap();

    let clock: Clock = bincode::deserialize(&account.data).unwrap();

    let vault_a: Vault = fetch_and_deserialize(banks_client, pool.a_vault).await;

    let vault_a_lp_mint: Mint = fetch_and_deserialize(banks_client, vault_a.lp_mint).await;
    let vault_a_token: TokenAccount =
        fetch_and_deserialize(banks_client, vault_a.token_vault).await;

    let vault_b: Vault = fetch_and_deserialize(banks_client, pool.b_vault).await;
    let vault_b_lp_mint: Mint = fetch_and_deserialize(banks_client, vault_b.lp_mint).await;
    let vault_b_token: TokenAccount =
        fetch_and_deserialize(banks_client, vault_b.token_vault).await;

    let mut stake_data = HashMap::new();

    let marinade = banks_client
        .get_account(marinade::stake::ID)
        .await
        .unwrap()
        .unwrap();
    stake_data.insert(marinade::stake::ID, marinade.data);

    let solido = banks_client
        .get_account(solido::stake::ID)
        .await
        .unwrap()
        .unwrap();
    stake_data.insert(solido::stake::ID, solido.data);

    if pool.stake != Pubkey::default() {
        let stake = banks_client.get_account(pool.stake).await.unwrap().unwrap();
        stake_data.insert(pool.stake, stake.data);
    }

    QuoteData {
        pool,
        clock,
        vault_a,
        vault_a_lp_mint,
        vault_a_token,
        pool_vault_a_lp_token,
        pool_vault_b_lp_token,
        vault_b,
        vault_b_lp_mint,
        vault_b_token,
        stake_data,
    }
}

async fn assert_swap_result_with_quote(
    banks_client: &mut BanksClient,
    pool_pubkey: Pubkey,
    amount: u64,
    trade_direction: TradeDirection,
    user: &Keypair,
) {
    let quote_data = fetch_quote_data(banks_client, pool_pubkey).await;
    let (in_token_mint, user_source_token, user_destination_token, admin_token_fee) =
        match trade_direction {
            TradeDirection::AtoB => (
                quote_data.pool.token_a_mint,
                get_associated_token_address(&user.pubkey(), &quote_data.pool.token_a_mint),
                get_associated_token_address(&user.pubkey(), &quote_data.pool.token_b_mint),
                quote_data.pool.admin_token_a_fee,
            ),
            TradeDirection::BtoA => (
                quote_data.pool.token_b_mint,
                get_associated_token_address(&user.pubkey(), &quote_data.pool.token_b_mint),
                get_associated_token_address(&user.pubkey(), &quote_data.pool.token_a_mint),
                quote_data.pool.admin_token_b_fee,
            ),
        };

    let token_mint: Mint = fetch_and_deserialize(banks_client, in_token_mint).await;
    let in_amount = amount * 10u64.pow(token_mint.decimals as u32);

    let before_user_destination_account: TokenAccount =
        fetch_and_deserialize(banks_client, user_destination_token).await;

    let mut accounts = amm::accounts::Swap {
        a_token_vault: quote_data.vault_a.token_vault,
        a_vault: quote_data.pool.a_vault,
        a_vault_lp: quote_data.pool.a_vault_lp,
        a_vault_lp_mint: quote_data.vault_a.lp_mint,
        b_token_vault: quote_data.vault_b.token_vault,
        b_vault: quote_data.pool.b_vault,
        b_vault_lp: quote_data.pool.b_vault_lp,
        b_vault_lp_mint: quote_data.vault_b.lp_mint,
        pool: pool_pubkey,
        token_program: anchor_spl::token::spl_token::ID,
        user: user.pubkey(),
        vault_program: mercurial_vault::ID,
        user_source_token,
        user_destination_token,
        admin_token_fee,
    }
    .to_account_metas(None);

    match quote_data.pool.curve_type {
        CurveType::Stable { depeg, .. } => match depeg.depeg_type {
            DepegType::Lido => accounts.push(AccountMeta::new(solido::stake::ID, false)),
            DepegType::Marinade => accounts.push(AccountMeta::new(marinade::stake::ID, false)),
            DepegType::SplStake => accounts.push(AccountMeta::new(quote_data.pool.stake, false)),
            _ => {}
        },
        _ => {}
    };

    let mut ixs = vec![ComputeBudgetInstruction::set_compute_unit_limit(1_400_000)];
    let swap_ix = Instruction {
        accounts,
        data: amm::instruction::Swap {
            in_amount,
            minimum_out_amount: 0,
        }
        .data(),
        program_id: amm::ID,
    };

    ixs.push(swap_ix);

    let recent_blockhash = banks_client.get_latest_blockhash().await.unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &ixs,
        Some(&user.pubkey()),
        &vec![user],
        recent_blockhash,
    );

    banks_client
        .process_transaction_with_preflight(transaction)
        .await
        .unwrap();

    let after_user_destination_account: TokenAccount =
        fetch_and_deserialize(banks_client, user_destination_token).await;

    let quote = compute_quote(in_token_mint, in_amount, quote_data).unwrap();
    let out_amount = after_user_destination_account.amount - before_user_destination_account.amount;

    assert_eq!(quote.out_amount, out_amount);
}

#[tokio::test]
async fn test_usdc_usdt_quote() {
    let SetupContext { mut context, user } = setup().await;
    let banks_client = &mut context.banks_client;
    assert_swap_result_with_quote(banks_client, USDC_USDT, 1, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, USDC_USDT, 1, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, USDC_USDT, 110, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, USDC_USDT, 110, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, USDC_USDT, 1100, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, USDC_USDT, 1100, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, USDC_USDT, 11000, TradeDirection::AtoB, &user)
        .await;
    assert_swap_result_with_quote(banks_client, USDC_USDT, 11000, TradeDirection::BtoA, &user)
        .await;
}

#[tokio::test]
async fn test_sol_usdt_quote() {
    let SetupContext { mut context, user } = setup().await;
    let banks_client = &mut context.banks_client;

    assert_swap_result_with_quote(banks_client, SOL_USDT, 11, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, SOL_USDT, 1, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, SOL_USDT, 110, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, SOL_USDT, 11, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, SOL_USDT, 1100, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, SOL_USDT, 111, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, SOL_USDT, 11000, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, SOL_USDT, 1111, TradeDirection::BtoA, &user).await;
}

#[tokio::test]
async fn test_msol_sol_quote() {
    let SetupContext { mut context, user } = setup().await;
    let banks_client = &mut context.banks_client;

    assert_swap_result_with_quote(banks_client, MSOL_SOL, 1, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, MSOL_SOL, 1, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, MSOL_SOL, 11, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, MSOL_SOL, 11, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, MSOL_SOL, 110, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, MSOL_SOL, 110, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, MSOL_SOL, 1100, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, MSOL_SOL, 1100, TradeDirection::BtoA, &user).await;
}

#[tokio::test]
async fn test_stsol_sol_quote() {
    let SetupContext { mut context, user } = setup().await;
    let banks_client = &mut context.banks_client;

    assert_swap_result_with_quote(banks_client, STSOL_SOL, 1, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, STSOL_SOL, 1, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, STSOL_SOL, 11, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, STSOL_SOL, 11, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, STSOL_SOL, 110, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, STSOL_SOL, 110, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, STSOL_SOL, 1100, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, STSOL_SOL, 1100, TradeDirection::BtoA, &user).await;
}

#[tokio::test]
async fn test_jitosol_sol_quote() {
    let SetupContext { mut context, user } = setup().await;
    let banks_client = &mut context.banks_client;

    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 1, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 1, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 11, TradeDirection::AtoB, &user).await;
    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 11, TradeDirection::BtoA, &user).await;

    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 110, TradeDirection::AtoB, &user)
        .await;
    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 110, TradeDirection::BtoA, &user)
        .await;

    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 1100, TradeDirection::AtoB, &user)
        .await;
    assert_swap_result_with_quote(banks_client, JITOSOL_SOL, 1100, TradeDirection::BtoA, &user)
        .await;
}
