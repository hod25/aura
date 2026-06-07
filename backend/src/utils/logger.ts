import { env } from '../config/env';

/**
 * Centralized, structured logger for the Aura backend.
 *
 * - Emits ISO-8601 timestamps and explicit log levels.
 * - In production it writes single-line JSON (machine-parseable for log
 *   aggregators); in development it writes a readable, colorized line.
 * - A minimum level gate suppresses noisier levels in production.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LEVEL_COLOR: Record<LogLevel, string> = {
  debug: '\x1b[90m', // gray
  info: '\x1b[36m', // cyan
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

/** Structured metadata attached to a log entry. */
export type LogMeta = Record<string, unknown>;

const minLevel: LogLevel = env.isProduction ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[minLevel];
}

/** Converts an unknown error into a serializable plain object. */
function serializeError(error: unknown): LogMeta {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: env.isProduction ? undefined : error.stack,
    };
  }
  return { error };
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;

  if (env.isProduction) {
    const entry = { timestamp, level, message, ...(meta ?? {}) };
    stream.write(`${JSON.stringify(entry)}\n`);
    return;
  }

  const color = LEVEL_COLOR[level];
  const label = level.toUpperCase().padEnd(5);
  const metaStr =
    meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  stream.write(`${color}${timestamp} ${label}${RESET} ${message}${metaStr}\n`);
}

export const logger = {
  debug(message: string, meta?: LogMeta): void {
    write('debug', message, meta);
  },
  info(message: string, meta?: LogMeta): void {
    write('info', message, meta);
  },
  warn(message: string, meta?: LogMeta): void {
    write('warn', message, meta);
  },
  /**
   * Logs an error. Accepts either a metadata object or a raw caught error,
   * which is normalized into structured fields.
   */
  error(message: string, errorOrMeta?: unknown): void {
    const meta =
      errorOrMeta instanceof Error
        ? serializeError(errorOrMeta)
        : (errorOrMeta as LogMeta | undefined);
    write('error', message, meta);
  },
};
