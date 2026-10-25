import type { GitifyNotification, RawGitifyNotification } from '../../types';

import { getAdapter } from '../forges/registry';
import {
  formatNotificationIdentifier,
  formatNotificationTitle,
  formatNotificationType,
} from './formatters';

/**
 * Populates the display property on a notification with formatted,
 * UI-ready values. Must be called after enrichment has completed,
 * as formatting depends on enriched subject data (state, number, etc.).
 *
 * Widens `RawGitifyNotification` (no display) into `GitifyNotification`
 * (display populated). The UI never sees the raw shape directly.
 */
export function formatNotification(notification: RawGitifyNotification): GitifyNotification {
  const helpers = getAdapter(notification.account).getDisplayHelpers(notification);

  return {
    ...notification,
    display: {
      type: formatNotificationType(notification),
      identifier: formatNotificationIdentifier(notification),
      title: formatNotificationTitle(notification),
      icon: {
        type: helpers.iconType,
        color: helpers.iconColor,
      },
      defaultUserType: helpers.defaultUserType,
      defaultUserIcon: helpers.defaultUserIcon,
    },
  };
}
