import express, { Express } from 'express';
import routes from './routes';
import { errorHandler, notFoundHandler } from './utils';

/**
 * Create and configure the Express application.
 * Separated from server startup for testability.
 */
export function createApp(): Express {
    const app = express();

    // ── Body Parsing ──
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // ── CORS (permissive for hackathon) ──
    app.use((_req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (_req.method === 'OPTIONS') {
            res.sendStatus(204);
            return;
        }
        next();
    });

    // ── Request logging (dev only) ──
    if (process.env.NODE_ENV !== 'production') {
        app.use((req, _res, next) => {
            // eslint-disable-next-line no-console
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
            next();
        });
    }

    // ── API Routes ──
    app.use('/api', routes);

    // ── Error Handling ──
    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
