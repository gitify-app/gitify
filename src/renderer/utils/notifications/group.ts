import type { GitifyNotification, SettingsState } from '../../types';

/**
 * Returns true when settings say to group by date.
 *
 * @param settings - The application settings.
 * @returns `true` when `groupBy` is `"DATE"`.
 */
export function isGroupByDate(settings: SettingsState) {
  return settings.groupBy === 'DATE';
}

/**
 * Returns true when settings say to group by repository.
 *
 * @param settings - The application settings.
 * @returns `true` when `groupBy` is `"REPOSITORY"`.
 */
export function isGroupByRepository(settings: SettingsState) {
  return settings.groupBy === 'REPOSITORY';
}

/**
 * Group notifications by repository.fullName preserving first-seen repository order.
 * Returns a Map where keys are repo fullNames and values are arrays of notifications.
 * Skips notifications without valid repository data.
 *
 * @param notifications - The notifications to group.
 * @returns A Map of repository full names to their arrays of notifications.
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
 *   - repository-first-seen order (when grouped by repository)
 *   - natural notifications order otherwise
 *
 * @param notifications - The notifications to flatten and order.
 * @param settings - Application settings controlling the groupBy strategy.
 * @returns A flat, ordered array of notifications.
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
