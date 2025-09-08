import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export const SEARCH_QUALIFIERS = {
  author: {
    prefix: 'author:',
    description: 'filter by notification author',
    requiresDetailsNotifications: true,
  },
  org: {
    prefix: 'org:',
    description: 'filter by organization owner',
    requiresDetailsNotifications: false,
  },
  repo: {
    prefix: 'repo:',
    description: 'filter by repository full name',
    requiresDetailsNotifications: false,
  },
} as const;

export type SearchQualifierKey = keyof typeof SEARCH_QUALIFIERS;
export type SearchQualifier = (typeof SEARCH_QUALIFIERS)[SearchQualifierKey];
export type SearchPrefix = SearchQualifier['prefix'];

export const SEARCH_PREFIXES: readonly SearchPrefix[] = Object.values(
  SEARCH_QUALIFIERS,
).map((q) => q.prefix) as readonly SearchPrefix[];

export const AUTHOR_PREFIX: SearchPrefix = SEARCH_QUALIFIERS.author.prefix;
export const ORG_PREFIX: SearchPrefix = SEARCH_QUALIFIERS.org.prefix;
export const REPO_PREFIX: SearchPrefix = SEARCH_QUALIFIERS.repo.prefix;

export function hasIncludeSearchFilters(settings: SettingsState) {
  return settings.filterIncludeSearchTokens.length > 0;
}

export function hasExcludeSearchFilters(settings: SettingsState) {
  return settings.filterExcludeSearchTokens.length > 0;
}

export function matchQualifierByPrefix(token: string) {
  const prefix = SEARCH_PREFIXES.find((p) => token.startsWith(p));
  if (!prefix) {
    return null;
  }

  return (
    Object.values(SEARCH_QUALIFIERS).find((q) => q.prefix === prefix) || null
  );
}

function stripPrefix(token: string) {
  return token.substring(token.indexOf(':') + 1);
}

export function filterNotificationBySearchTerm(
  notification: Notification,
  token: string,
): boolean {
  const qualifier = matchQualifierByPrefix(token);
  if (!qualifier) {
    return false;
  }

  const value = stripPrefix(token);

  if (qualifier === SEARCH_QUALIFIERS.author) {
    const author = notification.subject?.user?.login;
    return author.toLowerCase() === value.toLowerCase();
  }

  if (qualifier === SEARCH_QUALIFIERS.org) {
    const owner = notification.repository?.owner?.login;
    return owner?.toLowerCase() === value.toLowerCase();
  }

  if (qualifier === SEARCH_QUALIFIERS.repo) {
    const name = notification.repository?.full_name;
    return name?.toLowerCase() === value.toLowerCase();
  }

  return false;
}
