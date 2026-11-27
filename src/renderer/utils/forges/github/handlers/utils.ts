import type {
  GitifyIssueStatus,
  GitifyIssueStatusKind,
  GitifyNotificationUser,
  Link,
} from '../../../../types';
import { IconColor } from '../../../../types';

import type {
  AuthorFieldsFragment,
  IssueDetailsFragment,
  IssueFieldSingleSelectOptionColor,
  IssueTypeColor,
} from '../graphql/generated/graphql';

// Author type from GraphQL or manually constructed
type AuthorInput = AuthorFieldsFragment | GitifyNotificationUser | null | undefined;

/**
 * Construct the notification subject user from users in priority order.
 *
 * @param users - Users in priority order.
 * @returns The first user with a value, or `undefined` when none is present.
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
 * Construct a GitHub Actions URL for a repository with workflow filters.
 *
 * Appends the provided filter strings as a `+`-joined `query` search parameter.
 * Note: `%2B` in the URL is un-encoded back to `+` because the GitHub Actions
 * UI does not handle encoded plus signs correctly.
 *
 * @param repositoryURL - The base HTML URL of the repository.
 * @param filters - Workflow filter strings to append as a query; pass an empty
 * array for none.
 * @returns The GitHub Actions URL, with filters applied.
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

/**
 * Normalize a GitHub planning status category and display name into a Gitify
 * issue status kind.
 *
 * The `started` category covers both In progress and In review, so the display
 * name is the only way to separate those two. An unrecognized name falls back
 * to in_progress rather than losing the started category entirely.
 */
export function mapIssueStatusKind(categoryKey: string, name: string): GitifyIssueStatusKind {
  switch (categoryKey) {
    case 'backlog':
      return 'backlog';
    case 'planned':
      return 'todo';
    case 'started':
      return name.toLowerCase() === 'in review' ? 'in_review' : 'in_progress';
    case 'completed':
      return 'done';
    case 'not_planned':
      return 'not_planned';
    case 'duplicate':
      return 'duplicate';
    default:
      return 'unknown';
  }
}

/**
 * Map a normalized issue status kind to its icon color token.
 */
export function mapIssueStatusColor(kind: GitifyIssueStatusKind): IconColor {
  switch (kind) {
    case 'done':
      return IconColor.PURPLE;
    case 'not_planned':
    case 'duplicate':
      return IconColor.GRAY;
    case 'backlog':
    case 'todo':
    case 'in_progress':
    case 'in_review':
      return IconColor.GREEN;
    default:
      return IconColor.GRAY;
  }
}

/**
 * Map a GitHub planning status to the normalized {@link GitifyIssueStatus}
 * attached to the notification subject.
 */
export function mapIssueStatus(
  status: NonNullable<IssueDetailsFragment['status']>,
): GitifyIssueStatus {
  const kind = mapIssueStatusKind(status.category.key, status.name);

  return {
    name: status.name,
    kind,
    color: mapIssueStatusColor(kind),
  };
}
