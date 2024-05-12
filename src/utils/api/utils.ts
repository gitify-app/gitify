import Constants from '../constants';
import { isEnterpriseHost } from '../helpers';

export function getGitHubAPIBaseUrl(hostname: string): URL {
  const url = new URL(Constants.GITHUB_API_BASE_URL);

  if (isEnterpriseHost(hostname)) {
    url.hostname = hostname;
    url.pathname = '/api/v3/';
  }
  return url;
}

export function formatSearchQueryString(
  repo: string,
  title: string,
  lastUpdated: string,
): string {
  return `${title} in:title repo:${repo} updated:>${addHours(lastUpdated, -2)}`;
}

export function addHours(date: string, hours: number): string {
  return new Date(new Date(date).getTime() + hours * 36e5).toISOString();
}
