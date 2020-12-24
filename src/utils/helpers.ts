import { parse } from 'url';
import { EnterpriseAccount } from '../types';

import { Constants } from './constants';

export function getEnterpriseAccountToken(
  hostname: string,
  accounts: EnterpriseAccount[]
): string {
  return accounts.find((obj) => obj.hostname === hostname).token;
}

export function generateGitHubAPIUrl(hostname) {
  const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
  return isEnterprise
    ? `https://${hostname}/api/v3/`
    : `https://api.${hostname}/`;
}

export function generateGitHubWebUrl(url: string) {
  const { hostname } = parse(url);
  const isEnterprise =
    hostname !== `api.${Constants.DEFAULT_AUTH_OPTIONS.hostname}`;

  let newUrl: string = isEnterprise
    ? url.replace(`${hostname}/api/v3/repos`, hostname)
    : url.replace('api.github.com/repos', 'github.com');

  if (newUrl.indexOf('/pulls/') !== -1) {
    newUrl = newUrl.replace('/pulls/', '/pull/');
  }

  if (newUrl.indexOf('/releases/') !== -1) {
    newUrl = newUrl.replace('/repos', '');
    newUrl = newUrl.substr(0, newUrl.lastIndexOf('/'));
  }

  return newUrl;
}
