import { error, info, warn } from '@tauri-apps/plugin-log';

type LogFunction = (message: string) => Promise<void>;
type AllowedLogFunction = LogFunction;

export function logInfo(
  type: string,
  message: string,
  contexts: string[] = [],
) {
  logMessage(info, type, message, undefined, contexts);
}

export function logWarn(
  type: string,
  message: string,
  contexts: string[] = [],
) {
  logMessage(warn, type, message, undefined, contexts);
}

export function logError(
  type: string,
  message: string,
  err: Error,
  contexts: string[] = [],
) {
  logMessage(error, type, message, err, contexts);
}

function logMessage(
  logFunction: AllowedLogFunction,
  type: string,
  message: string,
  err?: Error,
  contexts: string[] = [],
) {
  const parts: string[] = [`[${type}]`, message];

  if (contexts.length) {
    const combined = contexts.join(' >> ');
    parts.push(`[${combined}]`);
  }

  if (err) {
    parts.push(err.toString());
  }

  const fullMessage = parts.join(' ');

  // Call Tauri log function (returns a promise, but we don't await it)
  // biome-ignore lint/suspicious/noConsole: Fallback error handler for when logging fails
  logFunction(fullMessage).catch(console.error);
}
