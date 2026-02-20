import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Centralized configuration loader - if you touch this i will break your head
 * Environment variables are validated and typed here.
 */

interface ServerConfig {
    nodeEnv: string;
    port: number;
    isProduction: boolean;
}

interface DatabaseConfig {
    url: string;
}

interface AlgorandConfig {
    network: string;
    algodUrl: string;
    indexerUrl: string;
    algodToken: string;
    appId: number;
    mnemonic: string;
}

interface OpenAIConfig {
    apiKey: string;
    model: string;
}

interface TwilioConfig {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    webhookUrl: string;
}

interface BridgeConfig {
    provider: string;
    apiKey: string;
    payoutWebhookUrl: string;
    coingeckoApiUrl: string;
}

interface LogConfig {
    level: string;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
    algorand: AlgorandConfig;
    openai: OpenAIConfig;
    twilio: TwilioConfig;
    bridge: BridgeConfig;
    log: LogConfig;
}

/**
 * Read env var with optional default.
 * Throws on missing required vars in production.
 */
function env(key: string, defaultValue?: string): string {
    const value = process.env[key] ?? defaultValue;
    if (value === undefined) {
        // In production, missing critical vars should fail fast
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return '';
    }
    return value;
}

function envInt(key: string, defaultValue: number): number {
    const raw = process.env[key];
    if (!raw) return defaultValue;
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a valid integer, got: ${raw}`);
    }
    return parsed;
}

/**
 * Build and export the full application config object.
 */
export const config: AppConfig = {
    server: {
        nodeEnv: env('NODE_ENV', 'development'),
        port: envInt('PORT', 3000),
        isProduction: env('NODE_ENV', 'development') === 'production',
    },

    database: {
        url: env('DATABASE_URL', 'postgresql://trackbuddy:trackbuddy_pass@localhost:5432/trackbuddy_db'),
    },

    algorand: {
        network: env('ALGO_NETWORK', 'testnet'),
        algodUrl: env('ALGO_ALGOD_URL', 'https://testnet-api.algonode.cloud'),
        indexerUrl: env('ALGO_INDEXER_URL', 'https://testnet-idx.algonode.cloud'),
        algodToken: env('ALGO_ALGOD_TOKEN', ''),
        appId: envInt('ALGO_APP_ID', 0),
        mnemonic: env('ALGO_MNEMONIC', ''),
    },

    openai: {
        apiKey: env('OPENAI_API_KEY', ''),
        model: env('OPENAI_MODEL', 'gpt-4'),
    },

    twilio: {
        accountSid: env('TWILIO_ACCOUNT_SID', ''),
        authToken: env('TWILIO_AUTH_TOKEN', ''),
        phoneNumber: env('TWILIO_PHONE_NUMBER', ''),
        webhookUrl: env('TWILIO_WEBHOOK_URL', 'http://localhost:3000/api/call/webhook'),
    },

    bridge: {
        provider: env('BRIDGE_PROVIDER', 'sandbox'),
        apiKey: env('BRIDGE_API_KEY', ''),
        payoutWebhookUrl: env('BRIDGE_PAYOUT_WEBHOOK', 'http://localhost:3000/api/bridge/webhook'),
        coingeckoApiUrl: env('COINGECKO_API_URL', 'https://api.coingecko.com/api/v3'),
    },

    log: {
        level: env('LOG_LEVEL', 'debug'),
    },
};

export default config;
