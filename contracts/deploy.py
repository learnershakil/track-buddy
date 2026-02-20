"""
TrackBuddy — Testnet Deployment Script

Deploys the Discipline smart contract to Algorand Testnet.
Outputs the App ID for backend integration.

Usage:
    python deploy.py

Requires ALGO_MNEMONIC in .env with a funded testnet account.
Get testnet ALGO from: https://bank.testnet.algorand.network/
"""

import sys
import json
from algosdk import mnemonic, account
from algosdk.transaction import ApplicationCreateTxn, StateSchema, OnComplete, wait_for_confirmation
from config import get_algod_client, ALGO_MNEMONIC, get_network_info


def deploy():
    """Deploy the discipline contract to Algorand testnet."""

    # ── Validate mnemonic ──
    if not ALGO_MNEMONIC:
        print("❌ ALGO_MNEMONIC not set in .env")
        print("   Get testnet ALGO from: https://bank.testnet.algorand.network/")
        sys.exit(1)

    # ── Derive account ──
    private_key = mnemonic.to_private_key(ALGO_MNEMONIC)
    sender = account.address_from_private_key(private_key)
    print(f"Deployer address: {sender}")

    # ── Load compiled TEAL ──
    try:
        with open("artifacts/approval.teal", "r") as f:
            approval_teal = f.read()
        with open("artifacts/clear.teal", "r") as f:
            clear_teal = f.read()
    except FileNotFoundError:
        print("❌ Compiled TEAL not found. Run the contract compiler first:")
        print("   python discipline_contract.py")
        sys.exit(1)

    # ── Connect to Algorand ──
    algod_client = get_algod_client()
    network_info = get_network_info()
    print(f"Network: {network_info['network']}")

    # Compile TEAL to binary
    approval_result = algod_client.compile(approval_teal)
    approval_binary = bytes.fromhex(approval_result['result'])
    clear_result = algod_client.compile(clear_teal)
    clear_binary = bytes.fromhex(clear_result['result'])

    # ── State schema ──
    # Global: admin(bytes) + total_commitments(uint) + total_penalties(uint) + total_bridge_intents(uint)
    global_schema = StateSchema(num_uints=3, num_byte_slices=1)
    # Local: stake_amount(uint) + commitment_status(uint) + violations(uint) + discipline_score(uint) + commitment_hash(bytes)
    local_schema = StateSchema(num_uints=4, num_byte_slices=1)

    # ── Build transaction ──
    params = algod_client.suggested_params()
    txn = ApplicationCreateTxn(
        sender=sender,
        sp=params,
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_binary,
        clear_program=clear_binary,
        global_schema=global_schema,
        local_schema=local_schema,
    )

    # ── Sign and send ──
    signed_txn = txn.sign(private_key)
    tx_id = algod_client.send_transaction(signed_txn)
    print(f"Transaction sent: {tx_id}")

    # ── Wait for confirmation ──
    print(" Waiting for confirmation...")
    result = wait_for_confirmation(algod_client, tx_id, 4)

    app_id = result['application-index']

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"   Contract deployed successfully!")
    print(f"   App ID: {app_id}")
    print(f"   Tx ID:  {tx_id}")
    print(f"   Network: {network_info['network']}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # ── Save App ID to file ──
    deploy_info = {
        'app_id': app_id,
        'tx_id': tx_id,
        'network': network_info['network'],
        'deployer': sender,
    }
    with open("artifacts/deploy_info.json", "w") as f:
        json.dump(deploy_info, f, indent=2)

    print(f"\n Deploy info saved to artifacts/deploy_info.json")
    print(f"   Update ALGO_APP_ID={app_id} in backend/.env")

    return app_id


if __name__ == "__main__":
    deploy()
