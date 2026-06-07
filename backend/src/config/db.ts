import fs from 'fs';
import path from 'path';
import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import { env } from './env';

/**
 * Shared MySQL connection pool. All queries use parameterized statements
 * to eliminate SQL injection (OWASP A03).
 */
export const pool: Pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  namedPlaceholders: false,
  // Pin the connection charset to utf8mb4 so accented text (e.g. "Bouclé")
  // round-trips without latin1 double-encoding on both seed and read paths.
  charset: 'utf8mb4',
  // Keep DECIMAL/BIGINT readable as JS numbers for our value ranges.
  decimalNumbers: true,
});

/**
 * Runs the idempotent schema + seed script. The script is split on
 * semicolons that terminate a statement and executed sequentially so it
 * works with a plain (non-multi-statement) connection pool.
 */
export async function initializeDatabase(): Promise<void> {
  const sqlPath = path.join(__dirname, 'init.sql');
  const raw = fs.readFileSync(sqlPath, 'utf8');

  const statements = splitSqlStatements(raw);
  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }
}

/**
 * Splits a SQL script into individual statements while ignoring semicolons
 * that appear inside string literals or line comments.
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      current += char;
      continue;
    }

    if (!inSingle && !inDouble && char === '-' && next === '-') {
      inLineComment = true;
      current += char;
      continue;
    }

    if (!inDouble && char === "'") {
      inSingle = !inSingle;
    } else if (!inSingle && char === '"') {
      inDouble = !inDouble;
    }

    if (char === ';' && !inSingle && !inDouble) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail.length > 0) {
    statements.push(tail);
  }
  return statements;
}

/**
 * Executes a unit of work inside a transaction, committing on success and
 * rolling back on any thrown error.
 */
export async function withTransaction<T>(
  work: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
