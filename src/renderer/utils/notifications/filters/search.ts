import { useFiltersStore } from '../../../stores';

import type { RawGitifyNotification } from '../../../types';

export const SEARCH_DELIMITER = ':';

const SEARCH_QUALIFIERS = {
  author: {
    prefix: 'author:',
    description: 'filter by thread author',
    requiresDetailsNotifications: true,
    extract: (n: RawGitifyNotification) => n.subject?.author?.login,
  },
  commenter: {
    prefix: 'commenter:',
    description: 'filter by latest comment author',
    requiresDetailsNotifications: true,
    extract: (n: RawGitifyNotification) => n.subject?.commenter?.login,
  },
  org: {
    prefix: 'org:',
    description: 'filter by organization owner',
    requiresDetailsNotifications: false,
    extract: (n: RawGitifyNotification) => n.repository?.owner?.login,
  },
  repo: {
    prefix: 'repo:',
    description: 'filter by repository full name',
    requiresDetailsNotifications: false,
    extract: (n: RawGitifyNotification) => n.repository?.fullName,
  },
} as const;

export type SearchQualifierKey = keyof typeof SEARCH_QUALIFIERS;
export type SearchQualifier = (typeof SEARCH_QUALIFIERS)[SearchQualifierKey];
export type SearchPrefix = SearchQualifier['prefix'];

export const ALL_SEARCH_QUALIFIERS: readonly SearchQualifier[] = Object.values(
  SEARCH_QUALIFIERS,
) as readonly SearchQualifier[];

export const BASE_SEARCH_QUALIFIERS: readonly SearchQualifier[] = ALL_SEARCH_QUALIFIERS.filter(
  (q) => !q.requiresDetailsNotifications,
);

export const DETAILED_ONLY_SEARCH_QUALIFIERS: readonly SearchQualifier[] =
  ALL_SEARCH_QUALIFIERS.filter((q) => q.requiresDetailsNotifications);

export function hasIncludeSearchFilters() {
  const filters = useFiltersStore.getState();
  return filters.includeSearchTokens.length > 0;
}

export function hasExcludeSearchFilters() {
  const filters = useFiltersStore.getState();
  return filters.excludeSearchTokens.length > 0;
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
  notification: RawGitifyNotification,
  token: string,
): boolean {
  const parsed = parseSearchInput(token);

  if (!parsed) {
    return false;
  }

  const fieldValue = parsed.qualifier.extract(notification);
  return fieldValue?.toLowerCase() === parsed.valueLower;
}
