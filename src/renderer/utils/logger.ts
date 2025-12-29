import { logError, logInfo, logWarn } from '../../shared/logger';

import type { GitifyNotification } from '../types';

// Renderer logger augments log entries with notification context formatting.
export function rendererLogInfo(
  type: string,
  message: string,
  notification?: GitifyNotification,
) {
  logInfo(type, message, buildContexts(notification));
}

export function rendererLogWarn(
  type: string,
  message: string,
  notification?: GitifyNotification,
) {
  logWarn(type, message, buildContexts(notification));
}

export function rendererLogError(
  type: string,
  message: string,
  err: Error,
  notification?: GitifyNotification,
) {
  logError(type, message, err, buildContexts(notification));
}

function buildContexts(notification?: GitifyNotification): string[] {
  if (!notification) {
    return [];
  }

  return [
    notification.subject.type,
    notification.repository.fullName,
    notification.subject.title,
  ];
}
