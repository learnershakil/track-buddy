# TrackBuddy Smart Contracts

Algorand smart contracts for the TrackBuddy accountability system.
Written in **raw TEAL v8** (Python 3.14 compatible).

## Structure

```
contracts/
├── discipline_contract.py    # Contract generator (raw TEAL)
├── deploy.py                 # Testnet deployment script
├── config.py                 # Algorand connection config
├── requirements.txt          # Python dependencies
├── tests/                    # Contract test cases
└── artifacts/                # Compiled TEAL + metadata
    ├── approval.teal
    ├── clear.teal
    └── contract.json
```

## Setup

```bash
cd contracts
python3 -m venv venv
source venv/bin/activate.fish   # fish shell
pip install -r requirements.txt
```

## Compile Contract

```bash
python discipline_contract.py
```

## Deploy to Testnet

```bash
python deploy.py
```
