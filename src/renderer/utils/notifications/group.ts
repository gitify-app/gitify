import type { SettingsState } from '../../types';
import type { Notification } from '../../typesGitHub';

/**
 * Returns true when settings say to group by repository.
 */
export function isGroupByRepository(settings: SettingsState) {
  return settings.groupBy === 'REPOSITORY';
}

/**
 * Group notifications by repository.full_name preserving first-seen repository order.
 * Returns a Map where keys are repo full_names and values are arrays of notifications.
 * Skips notifications without valid repository data.
 */
export function groupNotificationsByRepository(
  notifications: Notification[],
): Map<string, Notification[]> {
  const repoGroups = new Map<string, Notification[]>();

  for (const notification of notifications) {
    const repo = notification.repository?.full_name;

    // Skip notifications without valid repository data
    if (!repo) {
      continue;
    }

    const group = repoGroups.get(repo);

    if (group) {
      group.push(notification);
    } else {
      repoGroups.set(repo, [notification]);
    }
  }

  return repoGroups;
}

/**
 * Returns a flattened, ordered Notification[] according to repository-first-seen order
 * (when grouped) or the natural account->notification order otherwise.
 */
export function getFlattenedNotificationsByRepo(
  notifications: Notification[],
  settings: SettingsState,
): Notification[] {
  if (isGroupByRepository(settings)) {
    const groupedNotifications = groupNotificationsByRepository(notifications);

    return Array.from(groupedNotifications.values()).flat();
  }

  return notifications;
}
