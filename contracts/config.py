"""
TrackBuddy — Algorand Connection Configuration

Reads environment variables for Algorand testnet connectivity.
Used by deploy scripts and test harness.
"""

import os
from dotenv import load_dotenv
from algosdk.v2client import algod, indexer

# Load env from backend .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

# ── Algorand Network Configuration ──

ALGO_ALGOD_URL = os.getenv('ALGO_ALGOD_URL', 'https://testnet-api.algonode.cloud')
ALGO_INDEXER_URL = os.getenv('ALGO_INDEXER_URL', 'https://testnet-idx.algonode.cloud')
ALGO_ALGOD_TOKEN = os.getenv('ALGO_ALGOD_TOKEN', '')
ALGO_MNEMONIC = os.getenv('ALGO_MNEMONIC', '')
ALGO_NETWORK = os.getenv('ALGO_NETWORK', 'testnet')


def get_algod_client() -> algod.AlgodClient:
    """Create and return an Algod client for the configured network."""
    return algod.AlgodClient(ALGO_ALGOD_TOKEN, ALGO_ALGOD_URL)


def get_indexer_client() -> indexer.IndexerClient:
    """Create and return an Indexer client for the configured network."""
    return indexer.IndexerClient('', ALGO_INDEXER_URL)


def get_network_info() -> dict:
    """Return current network configuration summary."""
    return {
        'network': ALGO_NETWORK,
        'algod_url': ALGO_ALGOD_URL,
        'indexer_url': ALGO_INDEXER_URL,
    }
