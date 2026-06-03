import { format } from 'date-fns/format';
import semver from 'semver';

import { APPLICATION } from '../../../../shared/constants';

import { Constants } from '../../../constants';

import type { Account, ClientID, Hostname, Link, Token } from '../../../types';

import { getPlatformFromHostname } from '../../auth/platform';
import { getRecommendedScopeNames } from '../../auth/scopes';

/**
 * Normalize a GitHub Enterprise Server version string to a semver string.
 *
 * Returns `"latest"` when `version` is null/empty (GitHub Cloud or unknown),
 * which is treated as "supports all features" by capability checks.
 *
 * @param version - The raw version string from the `x-github-enterprise-version` header.
 * @returns A normalized semver string, or `"latest"` if unset.
 */
export function extractHostVersion(version: string | null): string | undefined {
  if (version) {
    return semver.valid(semver.coerce(version)) ?? undefined;
  }

  return 'latest';
}

/**
 * Build the GitHub authentication base URL for the given hostname.
 *
 * The URL structure differs by platform:
 * - GitHub.com → `https://github.com/`
 * - GitHub Enterprise Server → `https://<hostname>/api/v3/`
 * - GitHub Enterprise Cloud with Data Residency → `https://api.<hostname>/`
 *
 * @param hostname - The GitHub hostname.
 * @returns The base URL to use for OAuth API requests.
 */
export function getGitHubAuthBaseUrl(hostname: Hostname): URL {
  const platform = getPlatformFromHostname(hostname);
  const url = new URL(APPLICATION.GITHUB_BASE_URL);

  switch (platform) {
    case 'GitHub Enterprise Server':
      url.hostname = hostname;
      url.pathname = '/api/v3/';
      break;
    case 'GitHub Enterprise Cloud with Data Residency':
      url.hostname = `api.${hostname}`;
      url.pathname = '/';
      break;
    default:
      url.pathname = '/';
      break;
  }

  return url;
}

/**
 * Return the GitHub developer settings URL appropriate for the account's auth method.
 *
 * - GitHub App → application connections page
 * - OAuth App → developer settings page
 * - Personal Access Token → tokens settings page
 *
 * @param account - The account whose settings URL to build.
 * @returns The URL to the relevant GitHub developer settings page.
 */
export function getDeveloperSettingsURL(account: Account): Link {
  const settingsURL = new URL(`https://${account.hostname}`);

  switch (account.method) {
    case 'GitHub App':
      settingsURL.pathname = `/settings/connections/applications/${Constants.OAUTH_DEVICE_FLOW_CLIENT_ID}`;
      break;
    case 'OAuth App':
      settingsURL.pathname = '/settings/developers';
      break;
    case 'Personal Access Token':
      settingsURL.pathname = '/settings/tokens';
      break;
    default:
      settingsURL.pathname = '/settings';
      break;
  }
  return settingsURL.toString() as Link;
}

/**
 * Build a pre-filled URL for creating a new Personal Access Token.
 *
 * Pre-populates the token description (with app name and current date),
 * the required OAuth scopes, and a 90-day expiry.
 *
 * @param hostname - The GitHub hostname to create the token on.
 * @returns The URL with pre-filled query parameters.
 */
export function getNewTokenURL(hostname: Hostname): Link {
  const date = format(new Date(), 'PP p');
  const newTokenURL = new URL(`https://${hostname}/settings/tokens/new`);
  newTokenURL.searchParams.append('description', `${APPLICATION.NAME} (Created on ${date})`);
  newTokenURL.searchParams.append('scopes', getRecommendedScopeNames().join(','));
  newTokenURL.searchParams.append('default_expires_at', '90'); // 90 days

  return newTokenURL.toString() as Link;
}

/**
 * Build a pre-filled URL for registering a new OAuth App.
 *
 * Pre-populates the app name (with creation date), homepage URL, and
 * the `gitify://oauth` callback URL.
 *
 * @param hostname - The GitHub hostname to register the app on.
 * @returns The URL with pre-filled query parameters.
 */
export function getNewOAuthAppURL(hostname: Hostname): Link {
  const date = format(new Date(), 'PP p');
  const newOAuthAppURL = new URL(`https://${hostname}/settings/applications/new`);
  newOAuthAppURL.searchParams.append(
    'oauth_application[name]',
    `${APPLICATION.NAME} (Created on ${date})`,
  );
  newOAuthAppURL.searchParams.append('oauth_application[url]', 'https://gitify.io');
  newOAuthAppURL.searchParams.append('oauth_application[callback_url]', 'gitify://oauth');

  return newOAuthAppURL.toString() as Link;
}

/**
 * Return true if `clientId` matches the expected GitHub OAuth App format
 * (20 alphanumeric/underscore characters).
 */
export function isValidClientId(clientId: ClientID) {
  return /^[A-Z0-9_]{20}$/i.test(clientId);
}

/**
 * Return true if `token` matches the expected GitHub Personal Access Token
 * format (40 alphanumeric/underscore characters).
 */
export function isValidToken(token: Token) {
  return /^[A-Z0-9_]{40}$/i.test(token);
}
