import type { AccountNotifications, SettingsState } from '../../types';
import type { Notification } from '../../typesGitHub';

export function isGroupByRepository(settings: SettingsState) {
  return settings.groupBy === 'REPOSITORY';
}

/**
 * Group notifications by repository.full_name preserving first-seen repo order.
 * Returns a Map where keys are repo full_names and values are arrays of notifications.
 */
export function groupNotificationsByRepository(
  accounts: AccountNotifications[],
): Map<string, Notification[]> {
  const repoGroups = new Map<string, Notification[]>();

  for (const account of accounts) {
    for (const notification of account.notifications) {
      const repo = notification.repository?.full_name ?? '';
      const group = repoGroups.get(repo);

      if (group) {
        group.push(notification);
      } else {
        repoGroups.set(repo, [notification]);
      }
    }
  }

  return repoGroups;
}

/**
 * Flatten the Map values into a single array, preserving Map insertion order (first-seen repo order).
 */
export function flattenRepoGroups(repoGroups: Map<string, Notification[]>) {
  return Array.from(repoGroups.values()).flat();
}
