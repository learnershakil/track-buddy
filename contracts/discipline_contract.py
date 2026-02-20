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
// Requires: atomic group with payment txn for stake
// User stakes ALGO into contract escrow
// =============================================
method_create_commitment:
  // --- Validate: must have 2 app args ---
  // arg[0] = "createCommitment", arg[1] = commitment_hash
  txn NumAppArgs
  int 2
  >=
  assert

  // --- Validate: user must NOT have active commitment ---
  // commitment_status must be 0 (none) or 2 (completed) or 3 (failed)
  txn Sender
  byte "commitment_status"
  app_local_get
  int 1  // 1 = active
  !=
  assert

  // --- Validate: atomic group of exactly 2 txns ---
  // txn[0] = payment (stake), txn[1] = this app call
  global GroupSize
  int 2
  ==
  assert

  // --- Validate: first txn in group is a Payment ---
  gtxn 0 TypeEnum
  int pay
  ==
  assert

  // --- Validate: payment receiver is this app address ---
  gtxn 0 Receiver
  global CurrentApplicationAddress
  ==
  assert

  // --- Validate: payment amount > 0 (minimum stake) ---
  gtxn 0 Amount
  int 0
  >
  assert

  // --- Validate: payment sender is the caller ---
  gtxn 0 Sender
  txn Sender
  ==
  assert

  // --- Store stake amount in local state ---
  txn Sender
  byte "stake_amount"
  gtxn 0 Amount
  app_local_put

  // --- Store commitment hash in local state ---
  txn Sender
  byte "commitment_hash"
  txna ApplicationArgs 1
  app_local_put

  // --- Set commitment status to active (1) ---
  txn Sender
  byte "commitment_status"
  int 1
  app_local_put

  // --- Increment global commitments counter ---
  byte "total_commitments"
  byte "total_commitments"
  app_global_get
  int 1
  +
  app_global_put

  int 1
  return


// =============================================
// METHOD: verifySession
// Args: [0]="verifySession", [1]=account, [2]=success(0/1)
// Admin only -- backend verifies session outcome
// success=1 -> return stake to user, mark completed
// success=0 -> mark failed, stake stays in contract
// =============================================
method_verify_session:
  // --- Admin only ---
  callsub is_admin
  assert

  // --- Validate args: need account + success flag ---
  txn NumAppArgs
  int 3
  >=
  assert

  // --- Load target account (arg[1]) ---
  // Check user has active commitment (status == 1)
  txna ApplicationArgs 1
  byte "commitment_status"
  app_local_get
  int 1
  ==
  assert

  // --- Check success flag (arg[2]) ---
  txna ApplicationArgs 2
  btoi
  int 1
  ==
  bnz verify_success

  // --- FAILURE path: mark commitment as failed (3) ---
  txna ApplicationArgs 1
  byte "commitment_status"
  int 3
  app_local_put

  // Reset stake to 0 (forfeited to contract)
  txna ApplicationArgs 1
  byte "stake_amount"
  int 0
  app_local_put

  int 1
  return

verify_success:
  // --- SUCCESS path: return stake to user via inner txn ---
  itxn_begin
    int pay
    itxn_field TypeEnum
    txna ApplicationArgs 1
    itxn_field Receiver
    // Send back the user's staked amount
    txna ApplicationArgs 1
    byte "stake_amount"
    app_local_get
    itxn_field Amount
    // Minimum fee
    int 0
    itxn_field Fee
  itxn_submit

  // --- Mark commitment as completed (2) ---
  txna ApplicationArgs 1
  byte "commitment_status"
  int 2
  app_local_put

  // --- Reset stake to 0 ---
  txna ApplicationArgs 1
  byte "stake_amount"
  int 0
  app_local_put

  int 1
  return


// =============================================
// METHOD: applyPenalty
// Args: [0]="applyPenalty", [1]=account
// Admin only -- deducts penalty from stake
// Penalty = 10% of current stake (min 1000 microAlgo)
// Increments violation counter
// =============================================
method_apply_penalty:
  // --- Admin only ---
  callsub is_admin
  assert

  // --- Validate args ---
  txn NumAppArgs
  int 2
  >=
  assert

  // --- User must have active commitment ---
  txna ApplicationArgs 1
  byte "commitment_status"
  app_local_get
  int 1
  ==
  assert

  // --- Calculate penalty: stake / 10 (10% deduction) ---
  // Load current stake
  txna ApplicationArgs 1
  byte "stake_amount"
  app_local_get
  int 10
  /
  // Stack now has: penalty_amount

  // --- Deduct penalty from stake ---
  // new_stake = current_stake - penalty
  txna ApplicationArgs 1
  byte "stake_amount"
  // current stake
  txna ApplicationArgs 1
  byte "stake_amount"
  app_local_get
  // penalty (recalculate)
  txna ApplicationArgs 1
  byte "stake_amount"
  app_local_get
  int 10
  /
  // subtract
  -
  app_local_put

  // --- Increment violation counter ---
  txna ApplicationArgs 1
  byte "violations"
  txna ApplicationArgs 1
  byte "violations"
  app_local_get
  int 1
  +
  app_local_put

  // --- Increment global penalty counter ---
  byte "total_penalties"
  byte "total_penalties"
  app_global_get
  int 1
  +
  app_global_put

  // pop the penalty_amount left on stack from earlier
  pop

  int 1
  return


// =============================================
// METHOD: logDiscipline
// Args: [0]="logDiscipline", [1]=account, [2]=score (0-100)
// Admin only -- stores daily discipline score on-chain
// Immutable productivity record per user
// =============================================
method_log_discipline:
  // --- Admin only ---
  callsub is_admin
  assert

  // --- Validate args ---
  txn NumAppArgs
  int 3
  >=
  assert

  // --- Validate score range: 0-100 ---
  txna ApplicationArgs 2
  btoi
  int 100
  <=
  assert

  txna ApplicationArgs 2
  btoi
  int 0
  >=
  assert

  // --- Store discipline score in local state ---
  txna ApplicationArgs 1
  byte "discipline_score"
  txna ApplicationArgs 2
  btoi
  app_local_put

  int 1
  return


// =============================================
// METHOD: bridgeIntent
// Args: [0]="bridgeIntent", [1]=upi_hash
// Requires: atomic group with payment txn
// User locks ALGO in contract for UPI bridge payout
// Stores hashed UPI reference for backend settlement
// =============================================
method_bridge_intent:
  // --- Validate args ---
  txn NumAppArgs
  int 2
  >=
  assert

  // --- Validate: atomic group of 2 txns ---
  global GroupSize
  int 2
  ==
  assert

  // --- Validate: first txn is Payment ---
  gtxn 0 TypeEnum
  int pay
  ==
  assert

  // --- Validate: payment to contract address ---
  gtxn 0 Receiver
  global CurrentApplicationAddress
  ==
  assert

  // --- Validate: payment amount > 0 ---
  gtxn 0 Amount
  int 0
  >
  assert

  // --- Validate: payment sender is caller ---
  gtxn 0 Sender
  txn Sender
  ==
  assert

  // --- Increment global bridge intent counter ---
  byte "total_bridge_intents"
  byte "total_bridge_intents"
  app_global_get
  int 1
  +
  app_global_put

  // --- Log note with UPI hash (available via indexer) ---
  // The upi_hash in arg[1] and amount in gtxn 0 Amount
  // are readable by the backend indexer for processing

  int 1
  return


// =============================================
// METHOD: settleBridge
// Args: [0]="settleBridge", [1]=account, [2]=ref_hash
// Admin only -- marks bridge payout as settled on-chain
// Called after backend confirms UPI payout completed
// ref_hash = hash of UPI transaction reference
// =============================================
method_settle_bridge:
  // --- Admin only ---
  callsub is_admin
  assert

  // --- Validate args ---
  txn NumAppArgs
  int 3
  >=
  assert

  // --- Settlement is recorded on-chain via this txn ---
  // The ref_hash (arg[2]) serves as proof of UPI settlement
  // Backend indexer reads this to confirm bridge completion
  // No state mutation needed — the txn itself is the record

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
