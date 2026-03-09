import type { GitifyNotificationUser, Link } from '../../../types';

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
      subjectUser = {
        login: user.login,
        avatarUrl: user.avatarUrl,
        htmlUrl: user.htmlUrl,
        type: user.type,
      };

      return subjectUser;
    }
  }

  return subjectUser;
}

/**
 * Construct a GitHub Actions URL for a repository with optional filters.
 */
export function actionsURL(repositoryURL: string, filters: string[]): Link {
  const url = new URL(repositoryURL);
  url.pathname += '/actions';

  if (filters.length > 0) {
    url.searchParams.append('query', filters.join('+'));
  }

  // Note: the GitHub Actions UI cannot handle encoded '+' characters.
  return url.toString().replaceAll('%2B', '+') as Link;
}
