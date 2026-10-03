import { useFiltersStore } from '../../../stores';

import type { RawGitifyNotification } from '../../../types';

export const SEARCH_DELIMITER = ':';

const SEARCH_QUALIFIERS = {
  author: {
    prefix: 'author:',
    description: 'filter by thread author',
    requiresDetailsNotifications: true,
    extract: (n: RawGitifyNotification) => n.subject?.author?.login,
    normalizeValue: (value: string) => value,
    match: (field: string | undefined, valueLower: string) => field?.toLowerCase() === valueLower,
  },
  commenter: {
    prefix: 'commenter:',
    description: 'filter by latest comment author',
    requiresDetailsNotifications: true,
    extract: (n: RawGitifyNotification) => n.subject?.commenter?.login,
    normalizeValue: (value: string) => value,
    match: (field: string | undefined, valueLower: string) => field?.toLowerCase() === valueLower,
  },
  org: {
    prefix: 'org:',
    description: 'filter by organization owner',
    requiresDetailsNotifications: false,
    extract: (n: RawGitifyNotification) => n.repository?.owner?.login,
    normalizeValue: (value: string) => value,
    match: (field: string | undefined, valueLower: string) => field?.toLowerCase() === valueLower,
  },
  repo: {
    prefix: 'repo:',
    description: 'filter by repository full name',
    requiresDetailsNotifications: false,
    extract: (n: RawGitifyNotification) => n.repository?.fullName,
    normalizeValue: (value: string) => value,
    match: (field: string | undefined, valueLower: string) => field?.toLowerCase() === valueLower,
  },
  title: {
    prefix: 'title:',
    description: 'filter by subject title',
    requiresDetailsNotifications: false,
    extract: (n: RawGitifyNotification) => n.subject?.title,
    // Multi-word values are out of scope: keep only the first whitespace-delimited token,
    // so pasted input such as `title:deploy failed` matches on `deploy`.
    normalizeValue: (value: string) => value.split(/\s+/)[0] ?? '',
    match: (field: string | undefined, valueLower: string) =>
      field?.toLowerCase().includes(valueLower) ?? false,
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
  value: string; // original-case value after prefix (normalized)
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
      const value = qualifier.normalizeValue(valuePart);
      if (!value) {
        return null;
      }

      const token = qualifier.prefix + value;
      return {
        qualifier,
        value,
        valueLower: value.toLowerCase(),
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
  return parsed.qualifier.match(fieldValue, parsed.valueLower);
}
