import type { GitifyNotificationUser, Link } from '../../../../types';
import { IconColor } from '../../../../types';

import type {
  AuthorFieldsFragment,
  IssueFieldSingleSelectOptionColor,
  IssueTypeColor,
} from '../graphql/generated/graphql';

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
 * GitHub color enum shared between native issue types and issue field single-select options.
 */
export type GitHubColor = IssueTypeColor | IssueFieldSingleSelectOptionColor;

/**
 * Map GitHub's native issue type color to a Gitify icon color token.
 */
export function mapIssueTypeColor(color: IssueTypeColor): IconColor {
  return mapGitHubColorToIconColor(color);
}

/**
 * Map a GitHub issue field option color to a Gitify icon color token.
 */
export function mapIssueFieldColor(color: IssueFieldSingleSelectOptionColor): IconColor {
  return mapGitHubColorToIconColor(color);
}

export function mapGitHubColorToIconColor(color: GitHubColor): IconColor {
  switch (color) {
    case 'RED':
      return IconColor.RED;
    case 'ORANGE':
      return IconColor.ORANGE;
    case 'YELLOW':
      return IconColor.YELLOW;
    case 'GREEN':
      return IconColor.GREEN;
    case 'BLUE':
      return IconColor.BLUE;
    case 'PURPLE':
      return IconColor.PURPLE;
    case 'PINK':
      return IconColor.PINK;
    case 'GRAY':
    default:
      return IconColor.GRAY;
  }
}
