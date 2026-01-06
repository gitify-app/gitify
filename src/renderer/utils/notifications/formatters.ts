import type { GitifyNotification } from '../../types';
import { createNotificationHandler } from './handlers';

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
 * Return the formatted notification number for this notification.
 */
export function formatNotificationNumber(
  notification: GitifyNotification,
): string {
  return notification.subject?.number ? `#${notification.subject.number}` : '';
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
