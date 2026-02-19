/**
 * TrackBuddy -- Logger & Audit Trail
 *
 * Structured logging with levels and context.
 * Transaction audit trail for compliance and debugging.
 */

import { getDbClient } from '../db';

// ── Log Levels ──

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// ── Structured Logger ──

export class Logger {
    private context: string;
    private minLevel: LogLevel;

    constructor(context: string, minLevel: LogLevel = 'debug') {
        this.context = context;
        this.minLevel = minLevel;
    }

    debug(message: string, data?: Record<string, unknown>): void {
        this.log('debug', message, data);
    }

    info(message: string, data?: Record<string, unknown>): void {
        this.log('info', message, data);
    }

    warn(message: string, data?: Record<string, unknown>): void {
        this.log('warn', message, data);
    }

    error(message: string, error?: unknown, data?: Record<string, unknown>): void {
        const errorData = error instanceof Error
            ? { errorMessage: error.message, stack: error.stack, ...data }
            : { errorMessage: String(error), ...data };
        this.log('error', message, errorData);
    }

    private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
        if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.minLevel]) return;

        const entry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            context: this.context,
            message,
            ...(data ? { data } : {}),
        };

        const prefix = `[${entry.level}] [${entry.context}]`;

        switch (level) {
            case 'error':
                console.error(`${prefix} ${message}`, data ? JSON.stringify(data) : '');
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`, data ? JSON.stringify(data) : '');
                break;
            default:
                console.log(`${prefix} ${message}`, data ? JSON.stringify(data) : '');
        }
    }
}

// ── Pre-configured Loggers ──

export const loggers = {
    server: new Logger('SERVER'),
    db: new Logger('DB'),
    web3: new Logger('WEB3'),
    indexer: new Logger('INDEXER'),
    sync: new Logger('SYNC'),
    ai: new Logger('AI'),
    call: new Logger('CALL'),
    bridge: new Logger('BRIDGE'),
    scoring: new Logger('SCORING'),
    audit: new Logger('AUDIT'),
};

// ── Audit Trail ──

export type AuditAction =
    | 'COMMITMENT_CREATED'
    | 'COMMITMENT_COMPLETED'
    | 'COMMITMENT_FAILED'
    | 'STAKE_DEPOSITED'
    | 'STAKE_RETURNED'
    | 'STAKE_FORFEITED'
    | 'VIOLATION_RECORDED'
    | 'PENALTY_APPLIED'
    | 'SCORE_CALCULATED'
    | 'BRIDGE_INITIATED'
    | 'BRIDGE_SETTLED'
    | 'CALL_TRIGGERED'
    | 'CALL_ESCALATED'
    | 'AI_ANALYSIS_GENERATED'
    | 'USER_OPTED_IN'
    | 'USER_OPTED_OUT';

export interface AuditEntry {
    action: AuditAction;
    userId?: string;
    entityType: string;      // 'commitment', 'violation', 'bridge', etc.
    entityId?: string;
    txId?: string;           // On-chain transaction ID
    metadata?: Record<string, unknown>;
}

/**
 * Record an audit trail entry.
 * Persists to both database and structured log.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
    const db = getDbClient();

    // Log immediately
    loggers.audit.info(`${entry.action} on ${entry.entityType}`, {
        userId: entry.userId,
        entityId: entry.entityId,
        txId: entry.txId,
        ...entry.metadata,
    });

    // Persist to database
    try {
        await db.auditLog.create({
            data: {
                action: entry.action,
                userId: entry.userId,
                entityType: entry.entityType,
                entityId: entry.entityId,
                txId: entry.txId,
                metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
                createdAt: new Date(),
            },
        });
    } catch (err) {
        // Don't let audit failures break the main flow
        loggers.audit.error('Failed to persist audit entry', err, { entry });
    }
}

/**
 * Query audit trail for a specific entity.
 */
export async function getAuditTrail(
    entityType: string,
    entityId: string,
    limit = 50,
) {
    const db = getDbClient();

    return db.auditLog.findMany({
        where: { entityType, entityId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

/**
 * Query audit trail for a user.
 */
export async function getUserAuditTrail(userId: string, limit = 50) {
    const db = getDbClient();

    return db.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

// ── Error Handler Middleware ──

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils';

/**
 * Express error handling middleware with structured logging.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? (err as AppError).statusCode : 500;
    const message = isAppError ? err.message : 'Internal server error';

    // Log with context
    loggers.server.error(`${req.method} ${req.path} -> ${statusCode}`, err, {
        method: req.method,
        path: req.path,
        statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
        },
        timestamp: new Date().toISOString(),
    });
}

/**
 * Request logging middleware.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const level: LogLevel = res.statusCode >= 400 ? 'warn' : 'debug';

        loggers.server[level](`${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
        });
    });

    next();
}
