import log from 'electron-log';
import type { Notification } from '../typesGitHub';

function logMessage(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  logFunction: (...params: any[]) => void,
  type: string,
  message: string,
  err?: Error,
  notification?: Notification,
) {
  const args: (string | Error)[] = [`[${type}]:`, message];

  if (notification) {
    args.push(
      `[${notification.subject.type}]: ${notification.subject.title} for repository ${notification.repository.full_name}`,
    );
  }

  if (err) {
    args.push(err);
  }

  logFunction(...args);
}

export function logInfo(
  type: string,
  message: string,
  notification?: Notification,
) {
  logMessage(log.info, type, message, null, notification);
}

export function logWarn(
  type: string,
  message: string,
  notification?: Notification,
) {
  logMessage(log.warn, type, message, null, notification);
}

export function logError(
  type: string,
  message: string,
  err: Error,
  notification?: Notification,
) {
  logMessage(log.error, type, message, err, notification);
}
