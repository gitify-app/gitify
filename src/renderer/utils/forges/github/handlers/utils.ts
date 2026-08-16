import type { GitifyNotificationUser, Link } from '../../../../types';
import { IconColor } from '../../../../types';

import type { AuthorFieldsFragment, IssueTypeColor } from '../graphql/generated/graphql';

// Author type from GraphQL or manually constructed
type AuthorInput = AuthorFieldsFragment | GitifyNotificationUser | null | undefined;

/**
 * Construct the notification subject user based on an order prioritized list of users
 * @param users array of users in order or priority
 * @returns the subject user
 */
export function getNotificationAuthor(users: AuthorInput[]): GitifyNotificationUser | undefined {
  for (const user of users) {
    if (user) {
      return {
        login: user.login,
        ...('name' in user && user.name ? { name: user.name } : {}),
        avatarUrl: user.avatarUrl,
        htmlUrl: user.htmlUrl,
        type: user.type,
      };
    }
  }

  return undefined;
}

/**
 * Construct a GitHub Actions URL for a repository with optional workflow filters.
 *
 * Appends the provided filter strings as a `+`-joined `query` search parameter.
 * Note: `%2B` in the URL is un-encoded back to `+` because the GitHub Actions
 * UI does not handle encoded plus signs correctly.
 *
 * @param repositoryURL - The base HTML URL of the repository.
 * @param filters - Optional workflow filter strings to append as a query.
 * @returns The GitHub Actions URL, with filters applied if provided.
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

/**
 * Map GitHub's native issue type color to a Gitify icon color token.
 * GitHub supports more colors than Gitify's fixed design token set, so
 * this collapses to the closest available token.
 */
export function mapIssueTypeColor(color: IssueTypeColor): IconColor {
  switch (color) {
    case 'RED':
      return IconColor.RED;
    case 'GREEN':
      return IconColor.GREEN;
    case 'YELLOW':
    case 'ORANGE':
      return IconColor.YELLOW;
    case 'BLUE':
    case 'PURPLE':
    case 'PINK':
      return IconColor.PURPLE;
    default:
      return IconColor.GRAY;
  }
}
