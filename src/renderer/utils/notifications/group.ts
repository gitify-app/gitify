import type { GitifyNotification, SettingsState } from '../../types';

/**
 * Returns true when settings say to group by repository.
 */
export function isGroupByRepository(settings: SettingsState) {
  return settings.groupBy === 'REPOSITORY';
}

/**
 * Group notifications by repository.fullName preserving first-seen repository order.
 * Returns a Map where keys are repo fullNames and values are arrays of notifications.
 * Skips notifications without valid repository data.
 */
export function groupNotificationsByRepository(
  notifications: GitifyNotification[],
): Map<string, GitifyNotification[]> {
  const repoGroups = new Map<string, GitifyNotification[]>();

  for (const notification of notifications) {
    const repo = notification.repository?.fullName;

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
} /**
 * Returns a flattened, ordered notifications list according to:
 *   - repository-first-seen order (when grouped)
 *   - natural notifications order otherwise
 */
export function getFlattenedNotificationsByRepo(
  notifications: GitifyNotification[],
  settings: SettingsState,
): GitifyNotification[] {
  if (isGroupByRepository(settings)) {
    const groupedNotifications = groupNotificationsByRepository(notifications);

    return Array.from(groupedNotifications.values()).flat();
  }

  return notifications;
}
