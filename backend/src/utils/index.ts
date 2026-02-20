import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Standard API response format.
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
    return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
    };
}

export function errorResponse(message: string): ApiResponse {
    return {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Global error handling middleware.
 * Catches all errors and returns consistent JSON response.
 */
export function errorHandler(
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message = err.message || 'Internal Server Error';

    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(`[ERROR] ${statusCode} — ${message}`);
        if (!(err instanceof AppError)) {
            // eslint-disable-next-line no-console
            console.error(err.stack);
        }
    }

    res.status(statusCode).json(errorResponse(message));
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
