import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export const SEARCH_DELIMITER = ':';

const SEARCH_QUALIFIERS = {
  author: {
    prefix: 'author:',
    description: 'filter by notification author',
    requiresDetailsNotifications: true,
    extract: (n: Notification) => n.subject?.user?.login as string | undefined,
  },
  org: {
    prefix: 'org:',
    description: 'filter by organization owner',
    requiresDetailsNotifications: false,
    extract: (n: Notification) =>
      n.repository?.owner?.login as string | undefined,
  },
  repo: {
    prefix: 'repo:',
    description: 'filter by repository full name',
    requiresDetailsNotifications: false,
    extract: (n: Notification) => n.repository?.full_name as string | undefined,
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

export const DETAILED_ONLY_SEARCH_QUALIFIERS: readonly SearchQualifier[] = ALL_SEARCH_QUALIFIERS.filter(
  (q) => q.requiresDetailsNotifications,
);


export function hasIncludeSearchFilters(settings: SettingsState) {
  return settings.filterIncludeSearchTokens.length > 0;
}

export function hasExcludeSearchFilters(settings: SettingsState) {
  return settings.filterExcludeSearchTokens.length > 0;
}

function stripPrefix(token: string, qualifier: SearchQualifier) {
  return token.slice(qualifier.prefix.length).trim();
}

export interface ParsedSearchToken {
  qualifier: SearchQualifier;
  value: string;
  valueLower: string;
}

export function parseSearchToken(token: string): ParsedSearchToken | null {
  if (!token) {
    return null;
  }

  for (const qualifier of ALL_SEARCH_QUALIFIERS) {
    if (token.startsWith(qualifier.prefix)) {
      const value = stripPrefix(token, qualifier);
  
      if (!value) {
        return null; // prefix only
      }
      
      return { qualifier, value, valueLower: value.toLowerCase() };
    }
  }
  return null;
}

// Normalize raw user input from the token text field into a SearchToken (string)
// Returns null if no known prefix or no value after prefix yet.
export function normalizeSearchInputToToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) {
    return null;
  }

  const lower = value.toLowerCase();
  const matchedQualifier = ALL_SEARCH_QUALIFIERS.find((q) => lower.startsWith(q.prefix));

  if (!matchedQualifier) {
    return null;
  }

  const rest = value.substring(matchedQualifier.prefix.length);
  if (rest.length === 0) {
    return null; // prefix only, incomplete token
  }

  return `${matchedQualifier.prefix}${rest}`;
}

export function filterNotificationBySearchTerm(
  notification: Notification,
  token: string,
): boolean {
  const parsed = parseSearchToken(token);
  if (!parsed) {
    return false;
  }

  const fieldValue = parsed.qualifier.extract(notification);
  return fieldValue?.toLowerCase() === parsed.valueLower;
}
