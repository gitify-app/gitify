import log from 'electron-log';

type AllowedLogFunction = typeof log.info | typeof log.warn | typeof log.error;

export function logInfo(
  type: string,
  message: string,
  contexts: string[] = [],
) {
  logMessage(log.info, type, message, undefined, contexts);
}

export function logWarn(
  type: string,
  message: string,
  contexts: string[] = [],
) {
  logMessage(log.warn, type, message, undefined, contexts);
}

export function logError(
  type: string,
  message: string,
  err: Error,
  contexts: string[] = [],
) {
  logMessage(log.error, type, message, err, contexts);
}

function logMessage(
  logFunction: AllowedLogFunction,
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

  logFunction(...args);
}
