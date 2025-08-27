import { logError, logInfo, logWarn } from '../../shared/logger';

import type { Notification } from '../typesGitHub';

// Renderer logger augments log entries with notification context formatting.
export function rendererLogInfo(
  type: string,
  message: string,
  notification?: Notification,
) {
  logInfo(type, message, buildContexts(notification));
}

export function rendererLogWarn(
  type: string,
  message: string,
  notification?: Notification,
) {
  logWarn(type, message, buildContexts(notification));
}

export function rendererLogError(
  type: string,
  message: string,
  err: Error,
  notification?: Notification,
) {
  logError(type, message, err, buildContexts(notification));
}

function buildContexts(notification?: Notification): string[] {
  if (!notification) {
    return [];
  }

  return [
    notification.subject.type,
    notification.repository.full_name,
    notification.subject.title,
  ];
}
