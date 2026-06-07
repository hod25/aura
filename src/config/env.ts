import dotenv from 'dotenv';

dotenv.config();

/**
 * Reads a required environment variable, throwing on startup if absent.
 * Fail-fast so misconfiguration never reaches request handling.
 */
function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? fallback : value;
}

function toInt(value: string, name: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be an integer`);
  }
  return parsed;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',
  port: toInt(optional('PORT', '4000'), 'PORT'),
  corsOrigin: optional('CORS_ORIGIN', '*'),
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
  },
  db: {
    host: optional('DB_HOST', 'localhost'),
    port: toInt(optional('DB_PORT', '3306'), 'DB_PORT'),
    user: required('DB_USER'),
    password: optional('DB_PASSWORD', ''),
    database: required('DB_NAME'),
    connectionLimit: toInt(optional('DB_CONNECTION_LIMIT', '10'), 'DB_CONNECTION_LIMIT'),
  },
} as const;
