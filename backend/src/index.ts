/**
 * TrackBuddy Backend — Server Entry Point
 *
 * AI Accountability System for Humans
 * Combines AI analysis, Algorand smart contracts, and real stake penalties
 * to enforce discipline and productivity.
 */

import { config } from './config';
import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './db';

async function main(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // eslint-disable-next-line no-console
    console.log('  TrackBuddy Backend');
    // eslint-disable-next-line no-console
    console.log('  AI Accountability System');
    // eslint-disable-next-line no-console
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Connect to database
    await connectDatabase();

    // Create and start Express server
    const app = createApp();
    const server = app.listen(config.server.port, () => {
        // eslint-disable-next-line no-console
        console.log(`[SERVER] Running on http://localhost:${config.server.port}`);
        // eslint-disable-next-line no-console
        console.log(`[SERVER] Environment: ${config.server.nodeEnv}`);
        // eslint-disable-next-line no-console
        console.log(`[SERVER] Algorand: ${config.algorand.network}`);
        // eslint-disable-next-line no-console
        console.log(`[SERVER] Health: http://localhost:${config.server.port}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
        // eslint-disable-next-line no-console
        console.log(`\n[SERVER] ${signal} received — shutting down gracefully...`);
        server.close(async () => {
            await disconnectDatabase();
            // eslint-disable-next-line no-console
            console.log('[SERVER] Shutdown complete.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[FATAL] Server failed to start:', err);
    process.exit(1);
});
