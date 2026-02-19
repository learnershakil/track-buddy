"""
TrackBuddy -- Discipline Smart Contract (Raw TEAL v8)

Since Beaker/PyTeal are incompatible with Python 3.14,
we write TEAL directly for maximum compatibility.

This script generates the approval and clear programs
for the TrackBuddy Discipline contract.

State Schema:
  Global (3 uints, 1 bytes):
    - admin (bytes): Backend admin address authorized for settlements
    - total_commitments (uint): Total commitments created
    - total_penalties (uint): Total penalties applied
    - total_bridge_intents (uint): Total bridge intents created

  Local per user (4 uints, 1 bytes):
    - stake_amount (uint): Current staked microAlgos
    - commitment_status (uint): 0=none, 1=active, 2=completed, 3=failed
    - violations (uint): Total violation count
    - discipline_score (uint): Latest daily score (0-100)
    - commitment_hash (bytes): SHA256 of commitment metadata

Methods:
  - createCommitment(hash, duration)  : User stakes ALGO + registers commitment
  - verifySession(account, success)   : Backend verifies session outcome
  - applyPenalty(account)             : Backend applies penalty on violation
  - logDiscipline(account, score)     : Backend logs daily discipline score
  - bridgeIntent(upi_hash, amount)    : User initiates crypto-to-UPI bridge
  - settleBridge(account, ref_hash)   : Backend settles bridge payout on-chain
"""

import os
import json


# =============================================
# Approval Program (TEAL v8)
# =============================================

APPROVAL_PROGRAM = """#pragma version 8

// =============================================
// TrackBuddy Discipline Contract — Approval
// =============================================

// ---- Entry point routing ----

// Application creation
txn ApplicationID
int 0
==
bnz handle_create

// Opt-in
txn OnCompletion
int OptIn
==
bnz handle_optin

// Close out
txn OnCompletion
int CloseOut
==
bnz handle_closeout

// Update application (reject always)
txn OnCompletion
int UpdateApplication
==
bnz handle_reject

// Delete application (admin only)
txn OnCompletion
int DeleteApplication
==
bnz handle_delete

// NoOp — method dispatch
txn OnCompletion
int NoOp
==
bnz handle_noop

// Default: reject
b handle_reject


// =============================================
// CREATE — initialize contract
// =============================================
handle_create:
  // Set admin to contract creator
  byte "admin"
  txn Sender
  app_global_put

  // Initialize global counters
  byte "total_commitments"
  int 0
  app_global_put

  byte "total_penalties"
  int 0
  app_global_put

  byte "total_bridge_intents"
  int 0
  app_global_put

  int 1
  return


// =============================================
// OPT-IN — register new user
// =============================================
handle_optin:
  // Initialize all local state keys for sender
  txn Sender
  byte "stake_amount"
  int 0
  app_local_put

  txn Sender
  byte "commitment_status"
  int 0
  app_local_put

  txn Sender
  byte "violations"
  int 0
  app_local_put

  txn Sender
  byte "discipline_score"
  int 0
  app_local_put

  txn Sender
  byte "commitment_hash"
  byte ""
  app_local_put

  int 1
  return


// =============================================
// NOOP — method dispatch router
// =============================================
handle_noop:
  // Must have at least 1 app arg (method name)
  txn NumAppArgs
  int 1
  >=
  assert

  // Route: createCommitment
  txna ApplicationArgs 0
  byte "createCommitment"
  ==
  bnz method_create_commitment

  // Route: verifySession
  txna ApplicationArgs 0
  byte "verifySession"
  ==
  bnz method_verify_session

  // Route: applyPenalty
  txna ApplicationArgs 0
  byte "applyPenalty"
  ==
  bnz method_apply_penalty

  // Route: logDiscipline
  txna ApplicationArgs 0
  byte "logDiscipline"
  ==
  bnz method_log_discipline

  // Route: bridgeIntent
  txna ApplicationArgs 0
  byte "bridgeIntent"
  ==
  bnz method_bridge_intent

  // Route: settleBridge
  txna ApplicationArgs 0
  byte "settleBridge"
  ==
  bnz method_settle_bridge

  // Unknown method
  b handle_reject


// =============================================
// METHOD: createCommitment
// Args: [0]="createCommitment", [1]=commitment_hash
// Requires: payment txn in group for stake
// Implemented fully in Commit 8
// =============================================
method_create_commitment:
  // Placeholder — full implementation in Commit 8
  int 1
  return


// =============================================
// METHOD: verifySession
// Args: [0]="verifySession", [1]=account, [2]=success(0/1)
// Admin only — backend calls after session verification
// Implemented fully in Commit 9
// =============================================
method_verify_session:
  // Placeholder — full implementation in Commit 9
  int 1
  return


// =============================================
// METHOD: applyPenalty
// Args: [0]="applyPenalty", [1]=account
// Admin only — deducts stake and increments violation
// Implemented fully in Commit 10
// =============================================
method_apply_penalty:
  // Placeholder — full implementation in Commit 10
  int 1
  return


// =============================================
// METHOD: logDiscipline
// Args: [0]="logDiscipline", [1]=account, [2]=score
// Admin only — logs daily discipline score
// Implemented fully in Commit 11
// =============================================
method_log_discipline:
  // Placeholder — full implementation in Commit 11
  int 1
  return


// =============================================
// METHOD: bridgeIntent
// Args: [0]="bridgeIntent", [1]=upi_hash, [2]=amount
// User initiated — stores crypto-to-UPI intent
// Implemented fully in Commit 12
// =============================================
method_bridge_intent:
  // Placeholder — full implementation in Commit 12
  int 1
  return


// =============================================
// METHOD: settleBridge
// Args: [0]="settleBridge", [1]=account, [2]=ref_hash
// Admin only — marks bridge payout as settled
// Implemented fully in Commit 13
// =============================================
method_settle_bridge:
  // Placeholder — full implementation in Commit 13
  int 1
  return


// =============================================
// SUBROUTINE: is_admin
// Checks if txn sender is the stored admin
// Returns: 1 if admin, 0 otherwise
// Used by verifySession, applyPenalty, logDiscipline, settleBridge
// =============================================
is_admin:
  byte "admin"
  app_global_get
  txn Sender
  ==
  retsub


// =============================================
// CLOSE OUT — allow user to leave
// =============================================
handle_closeout:
  // Only allow close out if no active commitment
  txn Sender
  byte "commitment_status"
  app_local_get
  int 1  // 1 = active
  !=
  return


// =============================================
// DELETE — admin only
// =============================================
handle_delete:
  callsub is_admin
  return


// =============================================
// REJECT
// =============================================
handle_reject:
  int 0
  return
"""


# =============================================
# Clear State Program
# =============================================

CLEAR_PROGRAM = """#pragma version 8
int 1
return
"""


def compile_contract():
    """Write TEAL files and contract metadata to artifacts/."""
    artifacts_dir = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    # Write approval TEAL
    with open(os.path.join(artifacts_dir, "approval.teal"), "w") as f:
        f.write(APPROVAL_PROGRAM.strip())

    # Write clear state TEAL
    with open(os.path.join(artifacts_dir, "clear.teal"), "w") as f:
        f.write(CLEAR_PROGRAM.strip())

    # Write ABI-like contract metadata
    metadata = {
        "name": "TrackBuddyDiscipline",
        "description": "AI Accountability System -- Discipline enforcement on Algorand",
        "version": "1.0.0",
        "teal_version": 8,
        "state_schema": {
            "global": {
                "num_uints": 3,
                "num_byte_slices": 1,
                "keys": {
                    "admin": {"type": "bytes", "descr": "Backend admin address"},
                    "total_commitments": {"type": "uint64", "descr": "Commitment counter"},
                    "total_penalties": {"type": "uint64", "descr": "Penalty counter"},
                    "total_bridge_intents": {"type": "uint64", "descr": "Bridge intent counter"},
                }
            },
            "local": {
                "num_uints": 4,
                "num_byte_slices": 1,
                "keys": {
                    "stake_amount": {"type": "uint64", "descr": "Staked microAlgos"},
                    "commitment_status": {"type": "uint64", "descr": "0=none, 1=active, 2=completed, 3=failed"},
                    "violations": {"type": "uint64", "descr": "Violation counter"},
                    "discipline_score": {"type": "uint64", "descr": "Score 0-100"},
                    "commitment_hash": {"type": "bytes", "descr": "SHA256 of commitment metadata"},
                }
            }
        },
        "methods": {
            "createCommitment": {
                "args": ["commitment_hash (bytes)", "duration (uint64)"],
                "returns": "void",
                "descr": "User stakes ALGO and registers a commitment",
                "requires_payment": True,
                "admin_only": False,
            },
            "verifySession": {
                "args": ["account (address)", "success (uint64)"],
                "returns": "void",
                "descr": "Backend verifies session and releases/locks stake",
                "admin_only": True,
            },
            "applyPenalty": {
                "args": ["account (address)"],
                "returns": "void",
                "descr": "Backend applies penalty on detected violation",
                "admin_only": True,
            },
            "logDiscipline": {
                "args": ["account (address)", "score (uint64)"],
                "returns": "void",
                "descr": "Backend logs daily discipline score on-chain",
                "admin_only": True,
            },
            "bridgeIntent": {
                "args": ["upi_hash (bytes)", "amount (uint64)"],
                "returns": "void",
                "descr": "User initiates crypto-to-UPI bridge payment",
                "requires_payment": True,
                "admin_only": False,
            },
            "settleBridge": {
                "args": ["account (address)", "ref_hash (bytes)"],
                "returns": "void",
                "descr": "Backend confirms bridge payout completion on-chain",
                "admin_only": True,
            },
        }
    }
    with open(os.path.join(artifacts_dir, "contract.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print("Contract compiled successfully!")
    print(f"   Artifacts written to: {artifacts_dir}/")
    print(f"   - approval.teal")
    print(f"   - clear.teal")
    print(f"   - contract.json (ABI metadata)")


if __name__ == "__main__":
    compile_contract()
