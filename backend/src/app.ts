import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRoutes from './routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Security headers (OWASP A05). Allow static images to be embedded
  // cross-origin (the SPA is served from a different origin than the API).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.disable('x-powered-by');

  // CORS — allow a configured origin list or all origins.
  const corsOrigin =
    env.corsOrigin === '*'
      ? '*'
      : env.corsOrigin.split(',').map((o) => o.trim());
  app.use(cors({ origin: corsOrigin, credentials: true }));

  // Body parsing with a sane size limit to blunt large-payload abuse.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  app.use('/api', apiRoutes);

  // 404 + centralized error handling must be registered last.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
