import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from '../config';

/**
 * Singleton Prisma client instance with pg driver adapter.
 * Prisma 7 requires explicit adapter for direct DB connections.
 * All database access should go through this exported client.
 */

let prisma: PrismaClient;

export function getDbClient(): PrismaClient {
    if (!prisma) {
        const pool = new Pool({ connectionString: config.database.url });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}

/**
 * Connect to database and verify the connection is alive.
 * Call this during server startup.
 */
export async function connectDatabase(): Promise<void> {
    const client = getDbClient();
    try {
        await client.$connect();
        // eslint-disable-next-line no-console
        console.log('[DB] Connected to PostgreSQL successfully');
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[DB] Failed to connect to PostgreSQL:', error);
        throw error;
    }
}

/**
 * Graceful shutdown — disconnect Prisma client.
 * Call this on SIGTERM / SIGINT.
 */
export async function disconnectDatabase(): Promise<void> {
    if (prisma) {
        await prisma.$disconnect();
        // eslint-disable-next-line no-console
        console.log('[DB] Disconnected from PostgreSQL');
    }
}

export { prisma };
export default getDbClient;
