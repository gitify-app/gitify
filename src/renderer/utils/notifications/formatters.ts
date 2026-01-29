import type { GitifyNotification } from '../../types';

import { createNotificationHandler } from './handlers';

/**
 * Populates the display property on a notification with formatted,
 * UI-ready values. Must be called after enrichment has completed,
 * as formatting depends on enriched subject data (state, number, etc.).
 *
 * @param notification - The enriched notification to format
 * @returns The notification with populated display property
 */
export function formatNotification(
  notification: GitifyNotification,
): GitifyNotification {
  const handler = createNotificationHandler(notification);

  return {
    ...notification,
    display: {
      type: formatNotificationType(notification),
      number: formatNotificationNumber(notification),
      title: formatNotificationTitle(notification),
      icon: {
        type: handler.iconType(notification),
        color: handler.iconColor(notification),
      },
      defaultUserType: handler.defaultUserType(),
    },
  };
}

export function formatForDisplay(text: string[]): string {
  if (!text) {
    return '';
  }

  return text
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase character followed by an uppercase character
    .replaceAll('_', ' ') // Replace underscores with spaces
    .replace(/\w+/g, (word) => {
      // Convert to proper case (capitalize first letter of each word)
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .trim();
}

/**
 * Return the formatted notification type for this notification.
 */
export function formatNotificationType(
  notification: GitifyNotification,
): string {
  return formatForDisplay([
    notification.subject.state,
    notification.subject.type,
  ]);
}

/**
 * Return the formatted (issue, pull request, discussion) number for this notification.
 */
export function formatGitHubNumber(num: number): string {
  return `#${num}`;
}

/**
 * Return the formatted notification number for this notification.
 */
export function formatNotificationNumber(
  notification: GitifyNotification,
): string {
  return notification.subject?.number
    ? formatGitHubNumber(notification.subject.number)
    : '';
}

/**
 * Return the formatted notification title for this notification.
 */
export function formatNotificationTitle(
  notification: GitifyNotification,
): string {
  let title = notification.subject.title;
  const number = formatNotificationNumber(notification);

  if (number.length > 0) {
    title = `${title} [${number}]`;
  }

  return title;
}

/**
 * Helper to format the metric description, determine singular or plural noun,
 * and apply a custom formatter if needed.
 */
export function formatMetricDescription(
  count: number,
  singular: string,
  formatter?: (count: number, noun: string) => string,
) {
  if (!count) {
    return '';
  }

  const noun = count === 1 ? singular : `${singular}s`;

  return formatter ? formatter(count, noun) : `${count} ${noun}`;
}
