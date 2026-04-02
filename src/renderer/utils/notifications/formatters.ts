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

/**
 * Normalise an array of text segments into a single display-ready string.
 *
 * Joins the segments with spaces, inserts a space between a lowercase
 * character followed by an uppercase one (camelCase splitting), replaces
 * underscores with spaces, trims whitespace, and applies proper-case
 * capitalisation.
 *
 * @param text - The array of raw text segments to format.
 * @returns The formatted, human-readable string.
 */
export function formatForDisplay(text: string[]): string {
  if (!text) {
    return '';
  }

  return formatProperCase(
    text
      .join(' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase character followed by an uppercase character
      .replaceAll('_', ' ') // Replace underscores with spaces
      .trim(),
  );
}

/**
 * Formats a string to proper case (capitalize the first letter of each word).
 *
 * @param text - The string to format.
 * @returns The proper-cased string.
 */
export function formatProperCase(text: string) {
  if (!text) {
    return '';
  }

  return text.replace(/\w+/g, (word) => {
    // Convert to proper case (capitalize first letter of each word)
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * Return the formatted notification type for this notification.
 *
 * @param notification - The notification whose type to format.
 * @returns A human-readable type string (e.g. "Open Pull Request").
 */
export function formatNotificationType(
  notification: GitifyNotification,
): string {
  return formatForDisplay([
    notification.subject.state ?? '',
    notification.subject.type,
  ]);
}

/**
 * Return the formatted (issue, pull request, discussion) number for this notification.
 *
 * @param num - The numeric issue/PR/discussion number.
 * @returns The number prefixed with `#` (e.g. `"#42"`).
 */
export function formatGitHubNumber(num: number): string {
  return `#${num}`;
}

/**
 * Return the formatted notification number for this notification.
 *
 * @param notification - The notification whose subject number to format.
 * @returns A `"#N"` string when a subject number is present, otherwise `""`.
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
 *
 * Appends the subject number in brackets when present
 * (e.g. `"Fix bug [#42]"`).
 *
 * @param notification - The notification whose title to format.
 * @returns The display title string.
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
 *
 * @param count - The numeric count for the metric.
 * @param singular - The singular noun for the metric (e.g. `"comment"`).
 * @param formatter - Optional custom formatter `(count, noun) => string`.
 * @returns The formatted description string, or `""` when `count` is falsy.
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
