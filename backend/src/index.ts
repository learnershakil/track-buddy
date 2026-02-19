/**
 * TrackBuddy Backend — Entry Point
 * 
 * AI Accountability System for Humans
 * Combines AI analysis, Algorand smart contracts, and real stake penalties
 * to enforce discipline and productivity.
 */

import { config } from './config';

// eslint-disable-next-line no-console
console.log(`TrackBuddy Backend — Starting in ${config.server.nodeEnv} mode on port ${config.server.port}`);
// eslint-disable-next-line no-console
console.log(`Algorand Network: ${config.algorand.network}`);
// eslint-disable-next-line no-console
console.log(`Bridge Provider: ${config.bridge.provider}`);
