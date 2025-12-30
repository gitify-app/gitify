import type { GitifyNotificationUser, Link, UserType } from '../../../types';
import type { AuthorFieldsFragment } from '../../api/graphql/generated/graphql';

// Author type from GraphQL or manually constructed
type AuthorInput =
  | AuthorFieldsFragment
  | GitifyNotificationUser
  | null
  | undefined;

/**
 * Construct the notification subject user based on an order prioritized list of users
 * @param users array of users in order or priority
 * @returns the subject user
 */
export function getNotificationAuthor(
  users: AuthorInput[],
): GitifyNotificationUser {
  let subjectUser: GitifyNotificationUser = null;

  for (const user of users) {
    if (user) {
      // Handle both GraphQL AuthorFieldsFragment (snake_case) and GitifyNotificationUser (camelCase)
      const htmlUrl =
        'html_url' in user ? (user.html_url as Link) : user.htmlUrl;
      const avatarUrl =
        'avatar_url' in user ? (user.avatar_url as Link) : user.avatarUrl;

      subjectUser = {
        login: user.login,
        htmlUrl: htmlUrl,
        avatarUrl: avatarUrl,
        type: user.type as UserType,
      };

      return subjectUser;
    }
  }

  return subjectUser;
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
