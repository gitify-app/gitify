import { format } from 'date-fns/format';
import semver from 'semver';

import { APPLICATION } from '../../../../shared/constants';

import { Constants } from '../../../constants';

import type { Account, ClientID, Hostname, Link, Token } from '../../../types';

import { getRecommendedScopeNames } from '../../auth/scopeNames';
import { getGitHubPlatform } from './platform';

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
  const platform = getGitHubPlatform(hostname);
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
 * Build the URL where a user reviews and revokes an authorized OAuth app's access.
 *
 * Omit `clientId` for Gitify's preconfigured app; pass one for a user-supplied app.
 *
 * @param hostname - The GitHub hostname the app is authorized on.
 * @param clientId - The OAuth app's client ID, when the account supplied one.
 * @returns The authorized-applications URL for that client ID.
 */
export function getAuthorizedOAuthAppURL(hostname: Hostname, clientId?: ClientID): Link {
  const url = new URL(`https://${hostname}`);
  url.pathname = `/settings/connections/applications/${
    clientId ?? Constants.OAUTH_DEVICE_FLOW_CLIENT_ID
  }`;
  return url.toString() as Link;
}

/**
 * Return the GitHub developer settings URL appropriate for the account's auth method.
 *
 * - Gitify OAuth App → Gitify's authorized-applications page
 * - Custom OAuth App → the account's own app when its client ID is known; otherwise
 *   the host's OAuth apps list, where a migrated account can find its client ID again
 * - GitHub CLI → authorized applications page
 * - Personal Access Token → tokens settings page
 *
 * @param account - The account whose settings URL to build.
 * @returns The URL to the relevant GitHub developer settings page.
 */
export function getDeveloperSettingsURL(account: Account): Link {
  switch (account.method) {
    case 'Gitify OAuth App':
      return getAuthorizedOAuthAppURL(account.hostname);
    case 'Custom OAuth App':
      return account.clientId
        ? getAuthorizedOAuthAppURL(account.hostname, account.clientId)
        : (`https://${account.hostname}/settings/developers` as Link);
    case 'GitHub CLI':
      return `https://${account.hostname}/settings/applications` as Link;
    case 'Personal Access Token':
      return `https://${account.hostname}/settings/tokens` as Link;
    default:
      return `https://${account.hostname}/settings` as Link;
  }
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
 * Pre-populates the app name (with creation date), homepage URL, and an inert
 * callback URL. GitHub's registration form asks for a callback URL even though
 * the custom OAuth app authorizes through the device flow, which never
 * redirects; the project site is used so the form can be submitted without the
 * user inventing a value. The user must still enable the device flow in the
 * app's settings after registering it.
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
  newOAuthAppURL.searchParams.append('oauth_application[callback_url]', 'https://gitify.io');

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
