import log from 'electron-log';
import type { Notification } from '../typesGitHub';

export function logError(
  type: string,
  message: string,
  err: Error,
  notification?: Notification,
) {
  if (notification) {
    log.error(
      `[${type}]: ${message}`,
      `[${notification.subject.type}]: ${notification.subject.title} for repository ${notification.repository.full_name}`,
      err,
    );
  } else {
    log.error(`[${type}]: ${message}`, err);
  }
}
