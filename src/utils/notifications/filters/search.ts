import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export const SEARCH_DELIMITER = ':';

const SEARCH_QUALIFIERS = {
  author: {
    prefix: 'author:',
    description: 'filter by notification author',
    requiresDetailsNotifications: true,
    extract: (n: Notification) => n.subject?.user?.login,
  },
  org: {
    prefix: 'org:',
    description: 'filter by organization owner',
    requiresDetailsNotifications: false,
    extract: (n: Notification) => n.repository?.owner?.login,
  },
  repo: {
    prefix: 'repo:',
    description: 'filter by repository full name',
    requiresDetailsNotifications: false,
    extract: (n: Notification) => n.repository?.full_name,
  },
} as const;

export type SearchQualifierKey = keyof typeof SEARCH_QUALIFIERS;
export type SearchQualifier = (typeof SEARCH_QUALIFIERS)[SearchQualifierKey];
export type SearchPrefix = SearchQualifier['prefix'];

export const ALL_SEARCH_QUALIFIERS: readonly SearchQualifier[] = Object.values(
  SEARCH_QUALIFIERS,
) as readonly SearchQualifier[];

export const BASE_SEARCH_QUALIFIERS: readonly SearchQualifier[] =
  ALL_SEARCH_QUALIFIERS.filter((q) => !q.requiresDetailsNotifications);

export const DETAILED_ONLY_SEARCH_QUALIFIERS: readonly SearchQualifier[] =
  ALL_SEARCH_QUALIFIERS.filter((q) => q.requiresDetailsNotifications);

export function hasIncludeSearchFilters(settings: SettingsState) {
  return settings.filterIncludeSearchTokens.length > 0;
}

export function hasExcludeSearchFilters(settings: SettingsState) {
  return settings.filterExcludeSearchTokens.length > 0;
}

export interface ParsedSearchToken {
  qualifier: SearchQualifier; // matched qualifier
  value: string; // original-case value after prefix
  valueLower: string; // lowercase cached
  token: string; // canonical stored token (prefix + value)
}

export function parseSearchInput(raw: string): ParsedSearchToken | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();

  for (const qualifier of ALL_SEARCH_QUALIFIERS) {
    if (lower.startsWith(qualifier.prefix)) {
      const valuePart = trimmed.slice(qualifier.prefix.length).trim();
      if (!valuePart) {
        return null;
      }

      const token = qualifier.prefix + valuePart;
      return {
        qualifier,
        value: valuePart,
        valueLower: valuePart.toLowerCase(),
        token,
      };
    }
  }
  return null;
}

export function filterNotificationBySearchTerm(
  notification: Notification,
  token: string,
): boolean {
  const parsed = parseSearchInput(token);

  if (!parsed) {
    return false;
  }

  const fieldValue = parsed.qualifier.extract(notification);
  return fieldValue?.toLowerCase() === parsed.valueLower;
}
