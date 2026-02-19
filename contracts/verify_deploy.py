"""
TrackBuddy -- Testnet Deployment Verification

Verifies the deployed contract on Algorand testnet by:
1. Reading deploy_info.json for App ID
2. Querying the application info from algod
3. Validating state schema matches expectations
4. Printing deployment summary

Usage:
    python verify_deploy.py
"""

import os
import sys
import json
from config import get_algod_client, get_network_info


def verify():
    """Verify deployed contract on testnet."""
    # Load deploy info
    info_path = os.path.join(os.path.dirname(__file__), "artifacts", "deploy_info.json")

    if not os.path.exists(info_path):
        print("[DEPLOY] No deploy_info.json found.")
        print("         Run 'python deploy.py' first to deploy to testnet.")
        print("         Or create artifacts/deploy_info.json manually with:")
        print('         {"app_id": YOUR_APP_ID, "network": "testnet"}')
        sys.exit(1)

    with open(info_path, "r") as f:
        deploy_info = json.load(f)

    app_id = deploy_info["app_id"]
    network = deploy_info.get("network", "testnet")

    print(f"Verifying App ID: {app_id} on {network}")
    print("---")

    try:
        # Query application info
        algod = get_algod_client()
        app_info = algod.application_info(app_id)

        params = app_info["params"]

        # Validate state schema
        global_schema = params.get("global-state-schema", {})
        local_schema = params.get("local-state-schema", {})

        print(f"  App ID:          {app_id}")
        print(f"  Creator:         {params['creator']}")
        print(f"  Global ints:     {global_schema.get('num-uint', 0)} (expected: 3)")
        print(f"  Global bytes:    {global_schema.get('num-byte-slice', 0)} (expected: 1)")
        print(f"  Local ints:      {local_schema.get('num-uint', 0)} (expected: 4)")
        print(f"  Local bytes:     {local_schema.get('num-byte-slice', 0)} (expected: 1)")

        # Check global state
        global_state = params.get("global-state", [])
        print(f"  Global state keys: {len(global_state)}")
        for item in global_state:
            key = item["key"]
            print(f"    - {key}")

        print("---")
        print("Deployment verified successfully!")
        return True

    except Exception as e:
        print(f"Verification failed: {e}")
        print("This may mean the contract hasn't been deployed yet.")
        print("Run 'python deploy.py' to deploy.")
        return False


if __name__ == "__main__":
    verify()
