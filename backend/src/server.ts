// Validate the critical environment contract before ANY other module loads.
// This import has a side effect that crashes the process early — with explicit,
// actionable diagnostics — if the deployment is misconfigured.
import './config/validateEnv';
import { createApp } from './app';
import { env } from './config/env';
import { pool, initializeDatabase } from './config/db';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  // Wait for the database, retrying a few times so the app can start
  // alongside MySQL in containerized environments.
  await waitForDatabase();
  await initializeDatabase();
  logger.info('database initialized');

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info('Aura API started', { port: env.port, env: env.nodeEnv });
  });

  // Guards against a signal arriving twice (e.g. double Ctrl+C) and against a
  // hung connection drain wedging the process forever.
  let shuttingDown = false;
  const SHUTDOWN_TIMEOUT_MS = 10000;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info('graceful shutdown initiated', { signal });

    // Force-exit if graceful cleanup stalls, so orchestrators don't hang.
    const forceExit = setTimeout(() => {
      logger.error('graceful shutdown timed out, forcing exit', { signal });
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
      // Stop accepting new connections, then drain the DB pool.
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      await pool.end();
      clearTimeout(forceExit);
      logger.info('graceful shutdown complete', { signal });
      process.exit(0);
    } catch (error) {
      clearTimeout(forceExit);
      logger.error('error during graceful shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

async function waitForDatabase(maxAttempts = 15, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      return;
    } catch (error) {
      logger.warn('database not ready', { attempt, maxAttempts });
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

bootstrap().catch((error) => {
  logger.error('failed to start application', error);
  process.exit(1);
});
