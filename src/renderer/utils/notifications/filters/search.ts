import type { SettingsState } from '../../../types';
import type { Notification } from '../../../typesGitHub';

export const SEARCH_QUALIFIERS = {
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

export const SEARCH_PREFIXES: readonly SearchPrefix[] = Object.values(
  SEARCH_QUALIFIERS,
).map((q) => q.prefix) as readonly SearchPrefix[];

// Map prefix -> qualifier for fast lookup after prefix detection
export const QUALIFIER_BY_PREFIX: Record<SearchPrefix, SearchQualifier> =
  Object.values(SEARCH_QUALIFIERS).reduce(
    (acc, q) => {
      acc[q.prefix as SearchPrefix] = q;
      return acc;
    },
    {} as Record<SearchPrefix, SearchQualifier>,
  );

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
  // Iterate prefixes (tiny list) then direct map lookup; preserves ordering behavior
  for (const prefix of SEARCH_PREFIXES) {
    if (token.startsWith(prefix)) {
      return QUALIFIER_BY_PREFIX[prefix] || null;
    }
  }
  return null;
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
  const qualifier = matchQualifierByPrefix(token);
  if (!qualifier) return null;
  const value = stripPrefix(token, qualifier);
  if (!value) return null;
  return { qualifier, value, valueLower: value.toLowerCase() };
}

// Normalize raw user input from the token text field into a SearchToken (string)
// Returns null if no known prefix or no value after prefix yet.
export function normalizeSearchInputToToken(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const lower = value.toLowerCase();
  const matched = SEARCH_PREFIXES.find((p) => lower.startsWith(p));
  if (!matched) return null;
  const rest = value.substring(matched.length);
  if (rest.length === 0) return null; // prefix only, incomplete token
  return `${matched}${rest}`; // preserve original rest casing
}

export function filterNotificationBySearchTerm(
  notification: Notification,
  token: string,
): boolean {
  const parsed = parseSearchToken(token);
  if (!parsed) return false;
  const fieldValue = parsed.qualifier.extract(notification);
  return fieldValue?.toLowerCase() === parsed.valueLower;
}
