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
