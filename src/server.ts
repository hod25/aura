import { createApp } from './app';
import { env } from './config/env';
import { pool, initializeDatabase } from './config/db';

async function bootstrap(): Promise<void> {
  // Wait for the database, retrying a few times so the app can start
  // alongside MySQL in containerized environments.
  await waitForDatabase();
  await initializeDatabase();
  // eslint-disable-next-line no-console
  console.log('[startup] database initialized');

  const app = createApp();
  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[startup] Aura API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(`[shutdown] received ${signal}, closing gracefully`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
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
      // eslint-disable-next-line no-console
      console.warn(
        `[startup] database not ready (attempt ${attempt}/${maxAttempts})`,
      );
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[fatal] failed to start application', error);
  process.exit(1);
});
