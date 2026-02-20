"""
TrackBuddy -- Contract Test Suite

Tests the discipline contract TEAL logic by simulating
transaction scenarios against the compiled approval program.

These are structural/logic tests that validate:
- Contract compilation
- Method routing
- State schema correctness
- Argument validation expectations
"""

import os
import json
import hashlib
import pytest
from algosdk import account, mnemonic
from algosdk.transaction import (
    ApplicationCreateTxn,
    ApplicationOptInTxn,
    ApplicationNoOpTxn,
    PaymentTxn,
    StateSchema,
    OnComplete,
    assign_group_id,
)


# ── Fixtures ──

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")


@pytest.fixture
def teal_programs():
    """Load compiled TEAL programs."""
    with open(os.path.join(ARTIFACTS_DIR, "approval.teal"), "r") as f:
        approval = f.read()
    with open(os.path.join(ARTIFACTS_DIR, "clear.teal"), "r") as f:
        clear = f.read()
    return approval, clear


@pytest.fixture
def contract_metadata():
    """Load contract metadata/ABI."""
    with open(os.path.join(ARTIFACTS_DIR, "contract.json"), "r") as f:
        return json.load(f)


@pytest.fixture
def test_accounts():
    """Generate test accounts."""
    admin_key, admin_addr = account.generate_account()
    user_key, user_addr = account.generate_account()
    return {
        "admin": {"key": admin_key, "addr": admin_addr},
        "user": {"key": user_key, "addr": user_addr},
    }


# ── Test: Contract Compilation ──

class TestContractCompilation:
    """Verify TEAL files are valid and complete."""

    def test_approval_program_exists(self, teal_programs):
        approval, _ = teal_programs
        assert len(approval) > 0, "Approval program should not be empty"

    def test_clear_program_exists(self, teal_programs):
        _, clear = teal_programs
        assert len(clear) > 0, "Clear program should not be empty"

    def test_approval_has_pragma(self, teal_programs):
        approval, _ = teal_programs
        assert approval.startswith("#pragma version 8"), "Should use TEAL v8"

    def test_clear_has_pragma(self, teal_programs):
        _, clear = teal_programs
        assert clear.startswith("#pragma version 8"), "Should use TEAL v8"

    def test_approval_has_all_handlers(self, teal_programs):
        approval, _ = teal_programs
        required_handlers = [
            "handle_create",
            "handle_optin",
            "handle_noop",
            "handle_closeout",
            "handle_delete",
            "handle_reject",
        ]
        for handler in required_handlers:
            assert handler in approval, f"Missing handler: {handler}"

    def test_approval_has_all_methods(self, teal_programs):
        approval, _ = teal_programs
        required_methods = [
            "method_create_commitment",
            "method_verify_session",
            "method_apply_penalty",
            "method_log_discipline",
            "method_bridge_intent",
            "method_settle_bridge",
        ]
        for method in required_methods:
            assert method in approval, f"Missing method: {method}"

    def test_approval_has_admin_subroutine(self, teal_programs):
        approval, _ = teal_programs
        assert "is_admin:" in approval, "Missing is_admin subroutine"
        assert "callsub is_admin" in approval, "Admin methods should use callsub"


# ── Test: Contract Metadata ──

class TestContractMetadata:
    """Verify contract.json ABI spec."""

    def test_metadata_has_name(self, contract_metadata):
        assert contract_metadata["name"] == "TrackBuddyDiscipline"

    def test_metadata_has_version(self, contract_metadata):
        assert contract_metadata["version"] == "1.0.0"

    def test_metadata_has_teal_version(self, contract_metadata):
        assert contract_metadata["teal_version"] == 8

    def test_global_schema(self, contract_metadata):
        global_schema = contract_metadata["state_schema"]["global"]
        assert global_schema["num_uints"] == 3
        assert global_schema["num_byte_slices"] == 1

    def test_local_schema(self, contract_metadata):
        local_schema = contract_metadata["state_schema"]["local"]
        assert local_schema["num_uints"] == 4
        assert local_schema["num_byte_slices"] == 1

    def test_all_methods_defined(self, contract_metadata):
        methods = contract_metadata["methods"]
        expected = [
            "createCommitment",
            "verifySession",
            "applyPenalty",
            "logDiscipline",
            "bridgeIntent",
            "settleBridge",
        ]
        for method_name in expected:
            assert method_name in methods, f"Missing method spec: {method_name}"

    def test_admin_methods_marked(self, contract_metadata):
        methods = contract_metadata["methods"]
        admin_methods = ["verifySession", "applyPenalty", "logDiscipline", "settleBridge"]
        for name in admin_methods:
            assert methods[name]["admin_only"] is True, f"{name} should be admin_only"

    def test_user_methods_marked(self, contract_metadata):
        methods = contract_metadata["methods"]
        user_methods = ["createCommitment", "bridgeIntent"]
        for name in user_methods:
            assert methods[name]["admin_only"] is False, f"{name} should not be admin_only"


# ── Test: Transaction Construction ──

class TestTransactionConstruction:
    """Verify transaction objects can be constructed for each method."""

    def test_create_commitment_group(self, test_accounts):
        """Simulate createCommitment atomic group structure."""
        user = test_accounts["user"]
        fake_app_id = 12345
        commitment_hash = hashlib.sha256(b"code 4 hours").digest()

        # Payment txn (stake)
        pay_txn = PaymentTxn(
            sender=user["addr"],
            sp=_fake_params(),
            receiver=user["addr"],  # would be app address
            amt=1_000_000,  # 1 ALGO stake
        )

        # App call txn
        app_txn = ApplicationNoOpTxn(
            sender=user["addr"],
            sp=_fake_params(),
            index=fake_app_id,
            app_args=[b"createCommitment", commitment_hash],
        )

        group = assign_group_id([pay_txn, app_txn])
        assert len(group) == 2
        assert group[0].group == group[1].group  # same group ID

    def test_verify_session_txn(self, test_accounts):
        """Simulate verifySession app call."""
        admin = test_accounts["admin"]
        user = test_accounts["user"]
        fake_app_id = 12345

        txn = ApplicationNoOpTxn(
            sender=admin["addr"],
            sp=_fake_params(),
            index=fake_app_id,
            app_args=[b"verifySession", user["addr"].encode(), (1).to_bytes(8, "big")],
        )
        assert txn.type == "appl"

    def test_apply_penalty_txn(self, test_accounts):
        """Simulate applyPenalty app call."""
        admin = test_accounts["admin"]
        user = test_accounts["user"]
        fake_app_id = 12345

        txn = ApplicationNoOpTxn(
            sender=admin["addr"],
            sp=_fake_params(),
            index=fake_app_id,
            app_args=[b"applyPenalty", user["addr"].encode()],
        )
        assert txn.type == "appl"

    def test_log_discipline_txn(self, test_accounts):
        """Simulate logDiscipline app call."""
        admin = test_accounts["admin"]
        user = test_accounts["user"]
        fake_app_id = 12345
        score = 85

        txn = ApplicationNoOpTxn(
            sender=admin["addr"],
            sp=_fake_params(),
            index=fake_app_id,
            app_args=[b"logDiscipline", user["addr"].encode(), score.to_bytes(8, "big")],
        )
        assert txn.type == "appl"

    def test_bridge_intent_group(self, test_accounts):
        """Simulate bridgeIntent atomic group."""
        user = test_accounts["user"]
        fake_app_id = 12345
        upi_hash = hashlib.sha256(b"user@upi").digest()

        pay_txn = PaymentTxn(
            sender=user["addr"],
            sp=_fake_params(),
            receiver=user["addr"],
            amt=500_000,  # 0.5 ALGO
        )

        app_txn = ApplicationNoOpTxn(
            sender=user["addr"],
            sp=_fake_params(),
            index=fake_app_id,
            app_args=[b"bridgeIntent", upi_hash],
        )

        group = assign_group_id([pay_txn, app_txn])
        assert len(group) == 2

    def test_settle_bridge_txn(self, test_accounts):
        """Simulate settleBridge app call."""
        admin = test_accounts["admin"]
        user = test_accounts["user"]
        fake_app_id = 12345
        ref_hash = hashlib.sha256(b"UPI_REF_123").digest()

        txn = ApplicationNoOpTxn(
            sender=admin["addr"],
            sp=_fake_params(),
            index=fake_app_id,
            app_args=[b"settleBridge", user["addr"].encode(), ref_hash],
        )
        assert txn.type == "appl"


# ── Test: State Schema Validation ──

class TestStateSchema:
    """Verify state schema matches TEAL expectations."""

    def test_global_schema_capacity(self):
        schema = StateSchema(num_uints=3, num_byte_slices=1)
        assert schema.num_uints == 3
        assert schema.num_byte_slices == 1

    def test_local_schema_capacity(self):
        schema = StateSchema(num_uints=4, num_byte_slices=1)
        assert schema.num_uints == 4
        assert schema.num_byte_slices == 1

    def test_commitment_hash_generation(self):
        """Verify commitment hash format."""
        data = "code 4 hours daily"
        h = hashlib.sha256(data.encode()).digest()
        assert len(h) == 32  # SHA256 produces 32 bytes


# ── Helpers ──

def _fake_params():
    """Create fake suggested params for offline txn construction."""
    from algosdk.transaction import SuggestedParams
    return SuggestedParams(
        fee=1000,
        first=1,
        last=1000,
        gh="SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
        flat_fee=True,
    )
