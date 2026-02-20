-- CreateEnum
CREATE TYPE "UserMode" AS ENUM ('NORMAL', 'HARDCORE');

-- CreateEnum
CREATE TYPE "CommitmentCategory" AS ENUM ('CODING', 'STUDY', 'GYM', 'SLEEP', 'GENERAL');

-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('FOCUS', 'BREAK', 'DEEP_WORK', 'EXERCISE');

-- CreateEnum
CREATE TYPE "SessionSource" AS ENUM ('MANUAL', 'CHROME_EXTENSION', 'VSCODE_PLUGIN', 'MOBILE_APP', 'DESKTOP_APP');

-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('DISTRACTION', 'MISSED_SESSION', 'INACTIVITY', 'GOAL_FAILURE');

-- CreateEnum
CREATE TYPE "BridgeStatus" AS ENUM ('PENDING', 'CRYPTO_CONFIRMED', 'CONVERTING', 'PAYOUT_INITIATED', 'SETTLED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY_ANALYSIS', 'WEEKLY_SUMMARY', 'PREDICTION', 'VIOLATION_REPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "wallet_address" TEXT,
    "mode" "UserMode" NOT NULL DEFAULT 'NORMAL',
    "partner_id" TEXT,
    "daily_focus_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "sleep_target" DOUBLE PRECISION NOT NULL DEFAULT 7,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commitments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "CommitmentCategory" NOT NULL,
    "duration" INTEGER NOT NULL,
    "stake_amount" DOUBLE PRECISION NOT NULL,
    "on_chain_tx_id" TEXT,
    "app_id" INTEGER,
    "status" "CommitmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "reward_amount" DOUBLE PRECISION,
    "penalty_amount" DOUBLE PRECISION,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "commitment_id" TEXT,
    "sessionType" "SessionType" NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "focus_minutes" INTEGER NOT NULL DEFAULT 0,
    "distraction_minutes" INTEGER NOT NULL DEFAULT 0,
    "idle_minutes" INTEGER NOT NULL DEFAULT 0,
    "source" "SessionSource" NOT NULL DEFAULT 'MANUAL',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "ai_score" DOUBLE PRECISION,
    "activity_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discipline_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "focus_score" DOUBLE PRECISION NOT NULL,
    "consistency_score" DOUBLE PRECISION NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "on_chain_tx_id" TEXT,
    "score_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discipline_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "violations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "commitment_id" TEXT,
    "type" "ViolationType" NOT NULL,
    "description" TEXT,
    "penalty_applied" BOOLEAN NOT NULL DEFAULT false,
    "penalty_amount" DOUBLE PRECISION,
    "call_triggered" BOOLEAN NOT NULL DEFAULT false,
    "call_sid" TEXT,
    "on_chain_tx_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridge_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "algo_amount" DOUBLE PRECISION NOT NULL,
    "algo_tx_id" TEXT,
    "exchange_rate" DOUBLE PRECISION NOT NULL,
    "inr_amount" DOUBLE PRECISION NOT NULL,
    "upi_id" TEXT,
    "upi_reference" TEXT,
    "status" "BridgeStatus" NOT NULL DEFAULT 'PENDING',
    "on_chain_intent_tx_id" TEXT,
    "on_chain_settle_tx_id" TEXT,
    "payout_provider" TEXT,
    "payout_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "bridge_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "date" DATE NOT NULL,
    "summary" TEXT NOT NULL,
    "insights" TEXT,
    "predictions" TEXT,
    "raw_response" TEXT,
    "productivity_score" DOUBLE PRECISION,
    "burnout_risk" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_scores_user_id_date_key" ON "discipline_scores"("user_id", "date");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_logs" ADD CONSTRAINT "session_logs_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "commitments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_scores" ADD CONSTRAINT "discipline_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "violations" ADD CONSTRAINT "violations_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "commitments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bridge_transactions" ADD CONSTRAINT "bridge_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
