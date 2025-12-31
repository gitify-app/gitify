import type { GitifyNotificationUser } from '../../../types';

/**
 * Construct the notification subject user based on an order prioritized list of users
 * @param users array of users in order or priority
 * @returns the subject user
 */
export function getNotificationAuthor(
  users: (GitifyNotificationUser | undefined)[],
): GitifyNotificationUser | undefined {
  for (const user of users) {
    if (user) {
      return {
        login: user.login,
        htmlUrl: user.htmlUrl,
        avatarUrl: user.avatarUrl,
        type: user.type,
      };
    }
  }

  return undefined;
}

export function formatForDisplay(text: (string | undefined)[]): string {
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
