import log from 'electron-log';

type LogLevel = 'info' | 'warn' | 'error';

/** Redaction marker used when a value may contain a credential. */
const REDACTED = '[redacted]';

/** Header or inline authorization value, including a Bearer token. */
const AUTHORIZATION_PATTERN = /\b(authorization\s*:\s*)[^\r\n]+/gi;
const BEARER_PATTERN = /\b(bearer\s+)[A-Za-z0-9._~+/=-]+/gi;

/** Userinfo in an absolute URL, e.g. `https://user:pass@host`. */
const URL_USERINFO_PATTERN = /(https?:\/\/)[^/\s:@]+:[^/\s@]+@/gi;

/** Sensitive query-string parameters in a URL or message. */
const SENSITIVE_QUERY_PATTERN =
  /([?&](?:token|access_token|refresh_token|id_token|client_secret|password|secret|api_key|apikey|auth|key)=)[^&#\s]*/gi;

/**
 * Redact credential-looking fragments from a string before it reaches a log.
 *
 * Covers authorization headers, bearer tokens, URL userinfo, and sensitive
 * query-string parameters. It deliberately keeps the surrounding text so the
 * error remains diagnosable.
 *
 * @param value - The string to redact.
 * @returns The redacted string.
 */
function redactSensitiveText(value: string): string {
  return value
    .replace(AUTHORIZATION_PATTERN, `$1${REDACTED}`)
    .replace(BEARER_PATTERN, `$1${REDACTED}`)
    .replace(URL_USERINFO_PATTERN, `$1${REDACTED}@`)
    .replace(SENSITIVE_QUERY_PATTERN, `$1${REDACTED}`);
}

/** A plain, log-safe projection of an unknown error. */
export interface SanitizedError {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  cause?: string | number;
}

/**
 * Project an unknown error into a plain object that is safe to log.
 *
 * Only `name`, `message`, `stack`, `code`, and a primitive `cause` are kept.
 * Request objects, headers, tokens, decrypted safe-storage values, and any
 * other extra properties are dropped rather than serialized. Strings are
 * redacted for authorization headers, bearer tokens, URL userinfo, and
 * sensitive query parameters.
 *
 * @param err - The caught value to sanitize.
 * @returns A log-safe error projection.
 */
export function sanitizeErrorForLog(err: unknown): SanitizedError {
  const error = err instanceof Error ? err : null;
  const record = err as { code?: unknown; cause?: unknown } | null;

  const sanitized: SanitizedError = {
    name: error?.name ?? 'Error',
    message: redactSensitiveText(error?.message ?? String(err)),
  };

  if (error?.stack) {
    sanitized.stack = redactSensitiveText(error.stack);
  }

  if (typeof record?.code === 'string' || typeof record?.code === 'number') {
    sanitized.code =
      typeof record.code === 'string' ? redactSensitiveText(record.code) : record.code;
  }

  if (typeof record?.cause === 'string') {
    sanitized.cause = redactSensitiveText(record.cause);
  } else if (typeof record?.cause === 'number') {
    sanitized.cause = record.cause;
  }

  return sanitized;
}

/**
 * Safely coerce an unknown caught value into an Error instance.
 *
 * @param err - The caught value to coerce.
 * @returns An `Error` carrying the value's message.
 */
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

/**
 * Logs an informational message via electron-log.
 *
 * @param type - A short label identifying the caller or module (e.g. `'getAllNotifications'`).
 * @param message - The log message.
 * @param contexts - Optional array of context strings appended to the log entry.
 */
export function logInfo(type: string, message: string, contexts: string[] = []) {
  logMessage('info', type, message, undefined, contexts);
}

/**
 * Logs a warning message via electron-log.
 *
 * @param type - A short label identifying the caller or module.
 * @param message - The warning message.
 * @param contexts - Optional array of context strings appended to the log entry.
 */
export function logWarn(type: string, message: string, contexts: string[] = []) {
  logMessage('warn', type, message, undefined, contexts);
}

/**
 * Logs an error message via electron-log.
 *
 * @param type - A short label identifying the caller or module.
 * @param message - A description of the error context.
 * @param err - The error object that was caught.
 * @param contexts - Optional array of context strings appended to the log entry.
 */
export function logError(type: string, message: string, err: Error, contexts: string[] = []) {
  logMessage('error', type, message, err, contexts);
}

function logMessage(
  level: LogLevel,
  type: string,
  message: string,
  err?: Error,
  contexts: string[] = [],
) {
  const args: (string | Error)[] = [`[${type}]`, message];

  if (contexts.length) {
    const combined = contexts.join(' >> ');
    args.push(`[${combined}]`);
  }

  if (err) {
    args.push(err);
  }

  log[level](...args);
}
