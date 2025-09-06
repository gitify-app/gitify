import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

const AUTHOR_PREFIX = 'author:';
const ORG_PREFIX = 'org:';
const REPO_PREFIX = 'repo:';

export const SEARCH_PREFIXES = [AUTHOR_PREFIX, ORG_PREFIX, REPO_PREFIX];

export function hasIncludeSearchFilters(settings: SettingsState) {
  return settings.filterIncludeSearchTokens.length > 0;
}

export function hasExcludeSearchFilters(settings: SettingsState) {
  return settings.filterExcludeSearchTokens.length > 0;
}

export function isAuthorToken(token: string) {
  return token.startsWith(AUTHOR_PREFIX);
}

export function isOrgToken(token: string) {
  return token.startsWith(ORG_PREFIX);
}

export function isRepoToken(token: string) {
  return token.startsWith(REPO_PREFIX);
}

function stripPrefix(token: string) {
  return token.substring(token.indexOf(':') + 1);
}

export function filterNotificationBySearchTerm(
  notification: Notification,
  token: string,
): boolean {
  if (isAuthorToken(token)) {
    const handle = stripPrefix(token);
    return notification.subject?.user?.login === handle;
  }

  if (isOrgToken(token)) {
    const org = stripPrefix(token);
    const owner = notification.repository?.owner?.login;
    return owner?.toLowerCase() === org.toLowerCase();
  }

  if (isRepoToken(token)) {
    const repo = stripPrefix(token);
    const name = notification.repository?.full_name;
    return name?.toLowerCase() === repo.toLowerCase();
  }

  return false;
}

export function buildSearchToken(
  type: 'author' | 'org' | 'repo',
  value: string,
) {
  return `${type}:${value}`;
}
