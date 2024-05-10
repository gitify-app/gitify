import { subHours } from 'date-fns';

const SEARCH_RESULTS_WINDOW_HOURS = 2;

export function formatAsGitHubSearchSyntax(
  repo: string,
  title: string,
  lastUpdated: string,
): string {
  return `${title} in:title repo:${repo} updated:>${subHours(
    lastUpdated,
    SEARCH_RESULTS_WINDOW_HOURS,
  ).toISOString()}`;
}
