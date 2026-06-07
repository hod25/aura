import dotenv from 'dotenv';

// Load .env before any assertion so local development and container runtimes
// are validated against the same resolved process environment.
dotenv.config();

/**
 * A single environment contract entry. `validate` returns an error message
 * describing the violated type constraint, or `null` when the value is valid.
 */
interface EnvRule {
  name: string;
  description: string;
  validate?: (value: string) => string | null;
}

function isPositiveInteger(label: string, max: number) {
  return (value: string): string | null => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > max) {
      return `${label} must be a positive integer between 1 and ${max} (received "${value}")`;
    }
    return null;
  };
}

function minimumLength(min: number) {
  return (value: string): string | null => {
    if (value.trim().length < min) {
      return `must be at least ${min} characters long for cryptographic safety (received ${value.trim().length})`;
    }
    return null;
  };
}

/**
 * The critical runtime contract for the Aura backend. Every variable listed
 * here MUST be present and satisfy its type constraint, or the process refuses
 * to boot. Defaults intentionally do NOT apply to these — a misconfigured
 * deployment must fail loudly rather than start in an ambiguous half-state.
 */
const REQUIRED_ENV: EnvRule[] = [
  {
    name: 'PORT',
    description: 'TCP port the HTTP API binds to',
    validate: isPositiveInteger('PORT', 65535),
  },
  {
    name: 'DB_HOST',
    description: 'Hostname or service name of the MySQL database',
  },
  {
    name: 'DB_USER',
    description: 'MySQL username the API authenticates as',
  },
  {
    name: 'DB_PASSWORD',
    description: 'Password for the configured MySQL user',
  },
  {
    name: 'DB_NAME',
    description: 'Name of the MySQL schema the API operates against',
  },
  {
    name: 'JWT_SECRET',
    description: 'Secret key used to sign and verify authentication tokens',
    validate: minimumLength(16),
  },
];

/**
 * Asserts that the full critical environment contract is satisfied. On any
 * violation it throws a single, human-readable architectural error that lists
 * every problem at once, so an operator can fix the deployment in one pass
 * instead of discovering missing variables one boot at a time.
 *
 * Call this at the absolute entry point of the process, before any module that
 * consumes configuration is initialized.
 */
export function validateEnv(): void {
  const problems: string[] = [];

  for (const rule of REQUIRED_ENV) {
    const raw = process.env[rule.name];

    if (raw === undefined || raw.trim() === '') {
      problems.push(
        `  ✗ ${rule.name} is MISSING — ${rule.description}.`,
      );
      continue;
    }

    const constraintError = rule.validate?.(raw);
    if (constraintError) {
      problems.push(
        `  ✗ ${rule.name} is INVALID — ${constraintError}.`,
      );
    }
  }

  if (problems.length > 0) {
    const message = [
      '',
      '──────────────────────────────────────────────────────────────',
      ' Aura backend cannot start: environment configuration is invalid',
      '──────────────────────────────────────────────────────────────',
      ...problems,
      '',
      ' Resolve these in your local .env file (see .env.example) or in the',
      ' deployment environment (docker-compose.yml / orchestrator secrets)',
      ' and restart the process.',
      '──────────────────────────────────────────────────────────────',
      '',
    ].join('\n');

    throw new Error(message);
  }
}

// Run the integrity check as a side effect of importing this module. Importing
// it first — before `env`, `db`, or any other configuration consumer — makes it
// the absolute entry-point guard for the backend process.
validateEnv();
