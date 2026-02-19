# TrackBuddy — Architecture Overview

## System Architecture

TrackBuddy is an AI-powered accountability system that combines on-chain smart contracts (Algorand) with off-chain services to enforce discipline through financial stakes.

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│  Mobile App  │◄──►│   Backend    │◄──►│   PostgreSQL    │
│  (React Native)│  │  (Express)   │    │   (Prisma ORM)  │
└─────────────┘    └──────┬───────┘    └─────────────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │ Algorand │ │  OpenAI  │ │  Twilio  │
      │ Testnet  │ │  GPT-4   │ │  Voice   │
      └──────────┘ └──────────┘ └──────────┘
```

## Directory Structure

```
track-buddy/
├── backend/                    # Express + TypeScript backend
│   ├── src/
│   │   ├── config/             # Environment config loader
│   │   ├── db/                 # Prisma client singleton
│   │   ├── routes/             # REST API endpoints
│   │   │   ├── ai.ts           # /api/ai/* — analysis & predictions
│   │   │   ├── bridge.ts       # /api/bridge/* — crypto-to-UPI
│   │   │   ├── call.ts         # /api/call/* — voice calls
│   │   │   ├── commitments.ts  # /api/commitments/* — CRUD + on-chain
│   │   │   ├── health.ts       # /api/health
│   │   │   └── sessions.ts     # /api/sessions/*
│   │   ├── services/
│   │   │   ├── ai.ts           # OpenAI discipline analysis + risk prediction
│   │   │   ├── bridge.ts       # CoinGecko price feed + UPI payout
│   │   │   ├── call.ts         # Twilio voice + violation triggers
│   │   │   ├── commitment.ts   # Commitment lifecycle
│   │   │   ├── dbSync.ts       # On-chain → DB event sync
│   │   │   ├── logger.ts       # Structured logging + audit trails
│   │   │   ├── sandbox.ts      # UPI sandbox provider
│   │   │   └── scoring.ts      # Discipline scoring engine
│   │   ├── web3/
│   │   │   ├── index.ts        # algosdk clients + txn builders
│   │   │   └── listener.ts     # Indexer polling listener
│   │   └── utils/              # Helpers, error classes
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (12 models)
│   └── package.json
├── contracts/                  # Algorand smart contract (TEAL v8)
│   ├── discipline_contract.py  # Raw TEAL generator
│   ├── deploy.py               # Testnet deployment script
│   ├── verify_deploy.py        # Deployment verification
│   ├── artifacts/
│   │   ├── approval.teal       # Compiled approval program
│   │   ├── clear.teal          # Compiled clear program
│   │   └── contract.json       # ABI metadata
│   └── tests/
│       └── test_contract.py    # 24 contract tests
└── docker-compose.yml          # PostgreSQL + services
```

## Contract Interaction Flow

```
User Wallet                    Backend                    Algorand
    │                             │                          │
    │  1. POST /api/commitments   │                          │
    │ ──────────────────────────► │                          │
    │                             │  2. Build unsigned txns  │
    │                             │  (Payment + AppCall)     │
    │  3. Return unsigned txns    │                          │
    │ ◄────────────────────────── │                          │
    │                             │                          │
    │  4. Sign with wallet        │                          │
    │  5. Submit atomic group     │                          │
    │ ─────────────────────────────────────────────────────► │
    │                             │                          │
    │                             │  6. Indexer detects txn  │
    │                             │ ◄──────────────────────  │
    │                             │  7. DB sync updates      │
    │                             │     commitment record    │
    │                             │                          │
    │  8. GET /api/commitments    │                          │
    │ ──────────────────────────► │                          │
    │  9. Return with on-chain    │                          │
    │     status                  │                          │
    │ ◄────────────────────────── │                          │
```

## Smart Contract Methods

| Method | Caller | Description |
|--------|--------|-------------|
| `createCommitment` | User | Stake ALGO + store commitment hash |
| `verifySession` | Admin | Verify session, return/forfeit stake |
| `applyPenalty` | Admin | Deduct 10% stake for violations |
| `logDiscipline` | Admin | Record daily score on-chain (0-100) |
| `bridgeIntent` | User | Initiate crypto-to-UPI bridge |
| `settleBridge` | Admin | Mark UPI payout as settled |

## Scoring Engine

```
Overall Score = (Focus Score × 0.45) + (Consistency Score × 0.35)
              - (Violations × 5) + Streak Bonus

Focus Score       = (Focus Minutes / Total Time) × 100
Consistency Score = (Completed / Planned Sessions) × 100
Streak Bonus      = min((streak - 2) × 1, 10)  # kicks in at 3-day streak
Grade Mapping     = A+ (97+) → F (< 60)
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/commitments` | POST | Create commitment with on-chain stake |
| `/api/commitments` | GET | List user's commitments |
| `/api/commitments/:id` | GET | Get commitment detail |
| `/api/commitments/:id/confirm` | PATCH | Confirm on-chain tx |
| `/api/commitments/opt-in` | POST | Build opt-in transaction |
| `/api/ai/analyze` | POST | Full discipline analysis report |
| `/api/ai/predict` | POST | Risk prediction |
| `/api/ai/summary` | GET | Daily summary |
| `/api/call/trigger` | POST | Manual accountability call |
| `/api/call/violation` | POST | Automated violation call |
| `/api/call/webhook` | POST | Twilio status callback |
| `/api/bridge/price` | GET | Current ALGO/INR rate |
| `/api/bridge/convert` | GET | Convert ALGO to INR |
| `/api/bridge/payout` | POST | Initiate UPI payout |
| `/api/bridge/status/:id` | GET | Bridge transaction status |
| `/api/bridge/webhook` | POST | Provider settlement callback |

## Setup

```bash
# 1. Clone & install
git clone https://github.com/learnershakil/track-buddy.git
cd track-buddy/backend
pnpm install

# 2. Environment
cp .env.example .env
# Fill in: DATABASE_URL, ALGO_MNEMONIC, OPENAI_API_KEY, TWILIO_*

# 3. Database
pnpm exec prisma migrate dev

# 4. Smart contract
cd ../contracts
pip install -r requirements.txt
python discipline_contract.py    # Generates TEAL artifacts
python deploy.py                 # Deploy to testnet

# 5. Run backend
cd ../backend
pnpm dev
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | local PostgreSQL | Prisma connection string |
| `ALGO_MNEMONIC` | Yes | — | Admin account for on-chain ops |
| `ALGO_APP_ID` | Yes | — | Deployed contract App ID |
| `ALGO_NETWORK` | No | testnet | Algorand network |
| `OPENAI_API_KEY` | No | — | GPT-4 discipline analysis |
| `TWILIO_ACCOUNT_SID` | No | — | Voice call integration |
| `TWILIO_AUTH_TOKEN` | No | — | Voice call integration |
| `TWILIO_PHONE_NUMBER` | No | — | Outbound call number |
| `BRIDGE_PROVIDER` | No | sandbox | `sandbox` or production provider |
| `COINGECKO_API_URL` | No | public API | Price feed endpoint |
