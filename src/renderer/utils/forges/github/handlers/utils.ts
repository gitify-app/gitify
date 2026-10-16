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

const ISSUE_FIELD_FILL_COLORS = {
  RED: '#cf222e',
  ORANGE: '#bc4c00',
  YELLOW: '#9a6700',
  GREEN: '#1a7f37',
  BLUE: '#0969da',
  PURPLE: '#8250df',
  PINK: '#bf3989',
  GRAY: '#59636e',
} as const satisfies Record<IssueFieldSingleSelectOptionColor, string>;

/**
 * Map GitHub's native issue type color to a Gitify icon color token.
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

/**
 * Map a GitHub issue field option color to a Primer-compatible fill color.
 */
export function mapIssueFieldColor(color: IssueFieldSingleSelectOptionColor): string {
  return ISSUE_FIELD_FILL_COLORS[color] ?? ISSUE_FIELD_FILL_COLORS.GRAY;
}
