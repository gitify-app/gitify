import log from 'electron-log';

type LogLevel = 'info' | 'warn' | 'error';

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
