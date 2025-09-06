import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export const SEARCH_QUALIFIERS = {
  author: { prefix: 'author:', description: 'filter by notification author' },
  org: { prefix: 'org:', description: 'filter by organization owner' },
  repo: { prefix: 'repo:', description: 'filter by repository full name' },
} as const;

export type SearchQualifierKey = keyof typeof SEARCH_QUALIFIERS; // 'author' | 'org' | 'repo'
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
  if (!prefix) return null;
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
  if (!qualifier) return false;

  if (qualifier === SEARCH_QUALIFIERS.author) {
    const handle = stripPrefix(token);
    return notification.subject?.user?.login === handle;
  }
  if (qualifier === SEARCH_QUALIFIERS.org) {
    const org = stripPrefix(token);
    const owner = notification.repository?.owner?.login;
    return owner?.toLowerCase() === org.toLowerCase();
  }
  if (qualifier === SEARCH_QUALIFIERS.repo) {
    const repo = stripPrefix(token);
    const name = notification.repository?.full_name;
    return name?.toLowerCase() === repo.toLowerCase();
  }

  return false;
}

export function buildSearchToken(type: SearchQualifierKey, value: string) {
  return `${SEARCH_QUALIFIERS[type].prefix}${value}`;
}
