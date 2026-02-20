<p align="center">
  <img src="https://img.shields.io/badge/Algorand-Testnet-000000?style=for-the-badge&logo=algorand&logoColor=white" alt="Algorand">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
  <img src="https://img.shields.io/badge/Twilio-Voice-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio">
  <img src="https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Expo-Mobile-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
</p>

<h1 align="center">TrackBuddy</h1>
<h3 align="center">AI-Powered Accountability System for Humans</h3>

<p align="center">
  <em>Put your money where your mouth is. Stake crypto on your commitments.<br>AI watches. Smart contracts enforce. No excuses.</em>
</p>

---

## The Problem

Self-discipline is the #1 skill gap. People set goals, break them, and face zero consequences. Habit trackers don't work because there's nothing at stake.

## The Solution

**TrackBuddy** makes discipline non-negotiable by combining:

- **Financial Stakes** — Stake ALGO on your commitments. Miss sessions? Lose money. Complete them? Get it back.
- **On-Chain Enforcement** — Algorand smart contracts hold your stake in escrow. No human can override the rules.
- **AI Analysis** — GPT-4 generates discipline reports, predicts failure risk, and identifies your weak patterns.
- **Voice Accountability** — Twilio calls you when you miss sessions. At 5+ violations, it calls your accountability partner too.
- **Crypto-to-UPI Bridge** — Convert earned crypto to INR via UPI. Real money, real consequences.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Mobile App    │     │    Frontend      │     │   Backend API   │
│   (Expo/RN)     │◄───►│   (Next.js)      │◄───►│   (Express/TS)  │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                        ┌─────────────────────────────────┤
                        │                │                │
                        ▼                ▼                ▼
                 ┌────────────┐  ┌────────────┐  ┌────────────┐
                 │  Algorand  │  │  OpenAI    │  │  Twilio    │
                 │  Testnet   │  │  GPT-4     │  │  Voice     │
                 │            │  │            │  │            │
                 │ • Stake    │  │ • Analysis │  │ • Calls    │
                 │ • Verify   │  │ • Risk     │  │ • Webhooks │
                 │ • Penalty  │  │ • Scoring  │  │ • Escalate │
                 │ • Bridge   │  │ • Reports  │  │            │
                 └────────────┘  └────────────┘  └────────────┘
                        │
                        ▼
                 ┌────────────┐
                 │ PostgreSQL │
                 │  (Prisma)  │
                 │            │
                 │ 12 Models  │
                 │ Audit Logs │
                 └────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Smart Contract** | Algorand TEAL v8 | Stake escrow, session verification, penalties, bridge |
| **Backend** | Node.js + Express + TypeScript | REST API, service orchestration |
| **Database** | PostgreSQL + Prisma ORM | 12 models, audit trail, session logs |
| **AI Engine** | OpenAI GPT-4 | Discipline analysis, risk prediction, daily summaries |
| **Voice** | Twilio Programmable Voice | Accountability calls, violation triggers |
| **Price Feed** | CoinGecko API | ALGO/INR real-time exchange rates |
| **UPI Bridge** | Sandbox Provider (extensible) | Crypto-to-UPI payout simulation |
| **Frontend** | Next.js | Web dashboard |
| **Mobile** | Expo / React Native | Cross-platform mobile app |
| **Contract SDK** | py-algorand-sdk + algosdk (TS) | Contract compilation, deployment, interaction |

---

## Smart Contract — 6 Methods

The discipline contract is written in **raw TEAL v8** for maximum control and Python 3.14 compatibility.

| Method | Caller | What It Does |
|--------|--------|-------------|
| `createCommitment` | User | Stakes ALGO in escrow + stores commitment hash on-chain |
| `verifySession` | Admin | Verifies session outcome — returns stake (success) or forfeits (failure) |
| `applyPenalty` | Admin | Deducts 10% of stake per violation |
| `logDiscipline` | Admin | Records daily discipline score (0-100) on-chain |
| `bridgeIntent` | User | Initiates crypto-to-UPI bridge with atomic payment |
| `settleBridge` | Admin | Marks UPI payout as settled on-chain |

**Security:** All admin methods enforce `callsub is_admin` + `assert`. User methods validate atomic group transactions (correct receiver, minimum amounts). Close-out is blocked during active commitments.

---

## Discipline Scoring Engine

```
Overall Score = (Focus Score × 0.45) + (Consistency Score × 0.35)
              - (Violations × 5) + Streak Bonus

Focus Score       = (Focus Minutes ÷ Total Time) × 100
Consistency Score = (Completed Sessions ÷ Planned Sessions) × 100
Streak Bonus      = min((streak days - 2) × 1, 10)    # kicks in at 3-day streak
Passing Threshold = 40/100 (streak resets below this)
```

| Grade | Score Range |
|-------|------------|
| A+ | 97 – 100 |
| A | 93 – 96 |
| A- | 90 – 92 |
| B+ | 87 – 89 |
| B | 83 – 86 |
| B- | 80 – 82 |
| C+ | 77 – 79 |
| C | 73 – 76 |
| C- | 70 – 72 |
| D | 60 – 69 |
| F | 0 – 59 |

---

## API Reference

### Commitments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/commitments` | Create commitment with on-chain stake (returns unsigned txns) |
| `GET` | `/api/commitments?userId=` | List user's commitments |
| `GET` | `/api/commitments/:id` | Get commitment detail with sessions & violations |
| `PATCH` | `/api/commitments/:id/confirm` | Confirm on-chain transaction |
| `POST` | `/api/commitments/opt-in` | Build opt-in transaction for new users |

### AI & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/analyze` | Full GPT-4 discipline report (grades, strengths, recommendations) |
| `POST` | `/api/ai/predict` | Risk prediction (LOW/MEDIUM/HIGH/CRITICAL) with contributing factors |
| `GET` | `/api/ai/summary?userId=` | Concise daily discipline summary |

### Voice Calls
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/call/trigger` | Manual accountability call |
| `POST` | `/api/call/violation` | Automated violation call (escalates at 5+ violations) |
| `POST` | `/api/call/webhook` | Twilio status callback |

### Bridge (Crypto → UPI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bridge/price` | Live ALGO/INR exchange rate (CoinGecko, 1-min cache) |
| `GET` | `/api/bridge/convert?amount=` | Convert ALGO to INR |
| `POST` | `/api/bridge/payout` | Initiate UPI payout |
| `GET` | `/api/bridge/status/:id` | Check bridge transaction status |
| `POST` | `/api/bridge/webhook` | Provider settlement callback |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

---

## Project Structure

```
track-buddy/
├── backend/                          # Express + TypeScript API
│   ├── src/
│   │   ├── config/                   # Centralized env config loader
│   │   ├── db/                       # Prisma client singleton
│   │   ├── routes/                   # REST API endpoints
│   │   │   ├── ai.ts                 # /api/ai/* — analysis & predictions
│   │   │   ├── bridge.ts             # /api/bridge/* — crypto-to-UPI
│   │   │   ├── call.ts               # /api/call/* — voice calls
│   │   │   ├── commitments.ts        # /api/commitments/* — CRUD + on-chain
│   │   │   ├── health.ts             # /api/health
│   │   │   └── sessions.ts           # /api/sessions/*
│   │   ├── services/
│   │   │   ├── ai.ts                 # OpenAI discipline analysis + risk prediction
│   │   │   ├── bridge.ts             # CoinGecko price feed + UPI payout
│   │   │   ├── call.ts               # Twilio voice + violation triggers
│   │   │   ├── commitment.ts         # Commitment lifecycle management
│   │   │   ├── dbSync.ts             # On-chain → DB event synchronization
│   │   │   ├── logger.ts             # Structured logging + audit trails
│   │   │   ├── sandbox.ts            # UPI sandbox provider simulation
│   │   │   └── scoring.ts            # Discipline scoring engine
│   │   ├── web3/
│   │   │   ├── index.ts              # algosdk clients + transaction builders
│   │   │   └── listener.ts           # Algorand Indexer polling listener
│   │   └── utils/                    # Error classes, response helpers
│   ├── prisma/
│   │   └── schema.prisma             # 12 models + AuditLog
│   └── package.json
│
├── contracts/                        # Algorand Smart Contract (TEAL v8)
│   ├── discipline_contract.py        # Raw TEAL generator (Python)
│   ├── deploy.py                     # Testnet deployment script
│   ├── verify_deploy.py              # Deployment verification
│   ├── config.py                     # Algorand client configuration
│   ├── artifacts/
│   │   ├── approval.teal             # Compiled approval program
│   │   ├── clear.teal                # Compiled clear state program
│   │   └── contract.json             # ABI metadata
│   └── tests/
│       └── test_contract.py          # 24 unit tests
│
├── frontend/                         # Next.js Web Dashboard
│   ├── app/                          # App router pages
│   ├── public/                       # Static assets
│   └── package.json
│
├── mobile/                           # Expo / React Native App
│   ├── app/                          # File-based routing
│   ├── components/                   # Reusable UI components
│   ├── hooks/                        # Custom hooks
│   └── package.json
│
├── ARCHITECTURE.md                   # Technical architecture overview
└── README.md                         # This file
```

---

## Database Schema

12 models + 1 audit log table managed by Prisma ORM:

| Model | Purpose |
|-------|---------|
| `User` | User accounts with wallet address and phone |
| `Commitment` | Discipline commitments with stake and status |
| `SessionLog` | Focus/distraction tracking per session |
| `DisciplineScore` | Daily scores, streaks, on-chain references |
| `Violation` | Missed sessions, penalties, call tracking |
| `BridgeTransaction` | Crypto-to-UPI bridge lifecycle |
| `AiReport` | AI-generated discipline reports |
| `AuditLog` | Transaction audit trail (16 action types) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (package manager)
- **Python** ≥ 3.10 (for smart contract)
- **PostgreSQL** (local or Docker)

### 1. Clone & Install

```bash
git clone https://github.com/learnershakil/track-buddy.git
cd track-buddy
```

### 2. Backend Setup

```bash
cd backend
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Variables below)

# Setup database
pnpm exec prisma migrate dev

# Start development server
pnpm dev
```

The server starts at `http://localhost:3000`. Health check: `GET /api/health`.

### 3. Smart Contract Setup

```bash
cd contracts
pip install -r requirements.txt

# Generate TEAL artifacts
python discipline_contract.py

# Deploy to Algorand Testnet
python deploy.py

# Verify deployment
python verify_deploy.py
```

After deployment, copy the App ID to your backend `.env` as `ALGO_APP_ID`.

### 4. Frontend Setup

```bash
cd frontend
pnpm install
pnpm dev
```

### 5. Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

### 6. Run Contract Tests

```bash
cd contracts
pytest tests/ -v
```

All 24 tests should pass, covering compilation, metadata, transaction construction, and state schema validation.

---

## Environment Variables

```bash
# ── Server ──
NODE_ENV=development
PORT=3000

# ── Database ──
DATABASE_URL=postgresql://user:pass@localhost:5432/trackbuddy_db

# ── Algorand ──
ALGO_NETWORK=testnet
ALGO_ALGOD_URL=https://testnet-api.algonode.cloud
ALGO_INDEXER_URL=https://testnet-idx.algonode.cloud
ALGO_ALGOD_TOKEN=
ALGO_APP_ID=                    # Set after contract deployment
ALGO_MNEMONIC=                  # 25-word admin mnemonic

# ── OpenAI ──
OPENAI_API_KEY=                 # Required for AI features
OPENAI_MODEL=gpt-4

# ── Twilio ──
TWILIO_ACCOUNT_SID=             # Required for voice calls
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_WEBHOOK_URL=http://localhost:3000/api/call/webhook

# ── Bridge ──
BRIDGE_PROVIDER=sandbox         # 'sandbox' for development
BRIDGE_API_KEY=
BRIDGE_PAYOUT_WEBHOOK=http://localhost:3000/api/bridge/webhook
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# ── Logging ──
LOG_LEVEL=debug
```

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Prisma connection string |
| `ALGO_MNEMONIC` | Yes | Admin wallet for on-chain operations |
| `ALGO_APP_ID` | Yes | Set after deploying contract |
| `OPENAI_API_KEY` | Optional | AI features fall back to algorithmic scoring without it |
| `TWILIO_*` | Optional | Calls simulated in dev when not configured |
| `BRIDGE_PROVIDER` | Optional | Defaults to `sandbox` — simulates UPI payouts |

---

## How It Works

### Commitment Lifecycle

```
1. User creates commitment    →  POST /api/commitments
2. Backend builds txns        →  Unsigned Payment + AppCall (atomic group)
3. User signs with wallet     →  Mobile/Web wallet signs & submits
4. Algorand confirms          →  Contract stores stake + commitment hash
5. Indexer detects txn        →  Listener polls every 5 seconds
6. DB syncs on-chain state    →  Links txId to commitment record
7. User completes sessions    →  Sessions logged, verified by admin
8. AI scores discipline       →  Daily scoring engine runs
9. Violations trigger calls   →  Twilio calls at 2+ violations
10. Contract verifies         →  Stake returned (pass) or forfeited (fail)
```

### Violation Escalation

| Violations | Action |
|-----------|--------|
| 1 | Notification only |
| 2-4 | Standard accountability call |
| 5+ | Escalation call (user + accountability partner) |

### Bridge Flow (ALGO → UPI)

```
1. User submits bridgeIntent  →  ALGO sent to contract escrow
2. Backend fetches price      →  CoinGecko ALGO/INR (1-min cache)
3. INR amount calculated      →  ALGO × exchange rate
4. UPI payout initiated       →  Sandbox: 3-7s settlement, 90% success
5. Provider confirms          →  Webhook callback to /api/bridge/webhook
6. Contract settles           →  settleBridge marks on-chain
```

---

## Testing

### Smart Contract (24 tests)

```bash
cd contracts && pytest tests/ -v
```

- `TestContractCompilation` — TEAL pragma, handlers, methods, subroutines
- `TestContractMetadata` — ABI spec, schema counts, access flags
- `TestTransactionConstruction` — Valid txn objects for all 6 methods
- `TestStateSchema` — Schema capacity, hash format validation

### Backend

```bash
cd backend && pnpm lint
```

---

## Security

- **Admin enforcement** — All admin-only contract methods verify sender via `callsub is_admin` + `assert`
- **Atomic transactions** — Stake deposits and bridge intents require grouped transactions (payment + app call)
- **Close-out guard** — Users cannot opt out during active commitments
- **Unsigned transaction model** — Backend never touches user private keys; builds unsigned txns for wallet signing
- **Audit trail** — 16 action types logged to `audit_logs` table with entity references
- **Graceful degradation** — AI, Twilio, and bridge services fail gracefully when unconfigured

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

This project is part of the TrackBuddy initiative by [Team Neon](https://github.com/learnershakil).

---

<p align="center">
  <strong>Discipline is the bridge between goals and accomplishment.</strong>
</p>
