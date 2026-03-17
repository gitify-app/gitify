import {
  createDeviceCode,
  exchangeDeviceCode,
  exchangeWebFlowCode,
  getWebFlowAuthorizationUrl,
} from '@octokit/oauth-methods';
import { request } from '@octokit/request';
import { RequestError } from '@octokit/request-error';

import { format } from 'date-fns';
import semver from 'semver';

import { APPLICATION } from '../../../shared/constants';

import { Constants } from '../../constants';

import type {
  Account,
  AccountUUID,
  AuthCode,
  AuthState,
  ClientID,
  Hostname,
  Link,
  Token,
} from '../../types';
import type {
  AuthMethod,
  AuthResponse,
  DeviceFlowErrorResponse,
  DeviceFlowSession,
  LoginOAuthWebOptions,
} from './types';

import { fetchAuthenticatedUserDetails } from '../api/client';
import { clearOctokitClientCacheForAccount } from '../api/octokit';
import {
  rendererLogError,
  rendererLogInfo,
  rendererLogWarn,
} from '../core/logger';
import { encryptValue, openExternalLink } from '../system/comms';
import { getPlatformFromHostname } from './platform';

/**
 * Initiate a GitHub OAuth Web Flow (OAuth App) authentication.
 *
 * Opens the GitHub authorization URL in the user's browser, then waits for the
 * app's custom `gitify://oauth` callback to receive the authorization code.
 *
 * @param authOptions - The OAuth App client configuration and target hostname.
 * @returns Resolves with the authorization code and options on success.
 */
export function performGitHubWebOAuth(
  authOptions: LoginOAuthWebOptions,
): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    const { url } = getWebFlowAuthorizationUrl({
      clientType: 'oauth-app',
      clientId: authOptions.clientId,
      scopes: getRecommendedScopeNames(),
      allowSignup: false,
      request: request.defaults({
        baseUrl: `https://${authOptions.hostname}`,
      }),
    });

    openExternalLink(url as Link);

    const handleCallback = (callbackUrl: string) => {
      const url = new URL(callbackUrl);

      const type = url.hostname;
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      const errorUri = url.searchParams.get('error_uri');

      if (code && type === 'oauth') {
        resolve({
          authMethod: 'OAuth App',
          authCode: code as AuthCode,
          authOptions: authOptions,
        });
      } else if (error) {
        reject(
          new Error(
            `Oops! Something went wrong and we couldn't log you in using GitHub. Please try again. Reason: ${errorDescription} Docs: ${errorUri}`,
          ),
        );
      }
    };

    window.gitify.onAuthCallback((callbackUrl: string) => {
      rendererLogInfo(
        'renderer:auth-callback',
        `received authentication callback URL ${callbackUrl}`,
      );
      handleCallback(callbackUrl);
    });
  });
}

/**
 * Start a GitHub Device Flow authorization session.
 *
 * Requests a device code from GitHub and returns the session state
 * (user code, verification URI, expiry) needed to complete the flow.
 *
 * @param hostname - The GitHub hostname to authenticate against. Defaults to github.com.
 * @param scopes - Array of scope names to request. Defaults to recommended (full) scopes.
 * @returns The device flow session data.
 */
export async function startGitHubDeviceFlow(
  hostname: Hostname = Constants.GITHUB_HOSTNAME,
  scopes: string[] = getRecommendedScopeNames(),
): Promise<DeviceFlowSession> {
  const deviceCode = await createDeviceCode({
    clientType: 'oauth-app' as const,
    clientId: Constants.OAUTH_DEVICE_FLOW_CLIENT_ID,
    scopes: scopes,
    request: request.defaults({
      baseUrl: getGitHubAuthBaseUrl(hostname).toString(),
    }),
  });

  return {
    hostname: hostname,
    clientId: Constants.OAUTH_DEVICE_FLOW_CLIENT_ID,
    deviceCode: deviceCode.data.device_code,
    userCode: deviceCode.data.user_code,
    verificationUri: deviceCode.data.verification_uri,
    intervalSeconds: deviceCode.data.interval,
    expiresAt: Date.now() + deviceCode.data.expires_in * 1000,
  } as DeviceFlowSession;
}

/**
 * Poll GitHub to exchange a device code for an access token.
 *
 * Returns `null` when authorization is still pending ("authorization_pending"
 * or "slow_down" error codes), allowing the caller to retry later.
 * Throws for any other error.
 *
 * @param session - The active device flow session.
 * @returns The access token when granted, or `null` when still pending.
 */
export async function pollGitHubDeviceFlow(
  session: DeviceFlowSession,
): Promise<Token | null> {
  try {
    const { authentication } = await exchangeDeviceCode({
      clientType: 'oauth-app' as const,
      clientId: session.clientId,
      code: session.deviceCode,
      request: request.defaults({
        baseUrl: getGitHubAuthBaseUrl(session.hostname).toString(),
      }),
    });

    return authentication.token as Token;
  } catch (err) {
    if (err instanceof RequestError) {
      const response = err.response.data as DeviceFlowErrorResponse;
      const errorCode = response.error;

      if (errorCode === 'authorization_pending' || errorCode === 'slow_down') {
        return null;
      }
    }

    rendererLogError(
      'pollGitHubDeviceFlow',
      'Error exchanging device code',
      err,
    );

    throw err;
  }
}

/**
 * Exchange an OAuth authorization code for an access token.
 *
 * `authOptions.clientSecret` is required; this step must be performed
 * server-side or in a trusted context to keep the secret confidential.
 *
 * @param authCode - The authorization code received from the OAuth callback.
 * @param authOptions - The OAuth App options, including the client secret.
 * @returns The access token.
 * @throws If `clientSecret` is absent.
 */
export async function exchangeAuthCodeForAccessToken(
  authCode: AuthCode,
  authOptions: LoginOAuthWebOptions,
): Promise<Token> {
  if (!authOptions.clientSecret) {
    throw new Error('clientSecret is required to exchange an auth code');
  }

  const { authentication } = await exchangeWebFlowCode({
    clientType: 'oauth-app',
    clientId: authOptions.clientId,
    clientSecret: authOptions.clientSecret,
    code: authCode,
    request: request.defaults({
      baseUrl: getGitHubAuthBaseUrl(authOptions.hostname)
        .toString()
        .replace(/\/$/, ''),
    }),
  });

  return authentication.token as Token;
}

/**
 * Add or update an account in the auth state.
 *
 * Encrypts the token, refreshes the user profile, then upserts the account:
 * if an account with the same UUID (hostname + user ID + method) already
 * exists it is replaced (e.g. on re-authentication); otherwise it is appended.
 *
 * @param auth - The current auth state.
 * @param method - The authentication method used.
 * @param token - The plaintext access token to store (will be encrypted).
 * @param hostname - The GitHub hostname for the account.
 * @returns The updated auth state.
 */
export async function addAccount(
  auth: AuthState,
  method: AuthMethod,
  token: Token,
  hostname: Hostname,
): Promise<AuthState> {
  const accountList = auth.accounts;
  const encryptedToken = await encryptValue(token);

  let newAccount = {
    hostname: hostname,
    method: method,
    platform: getPlatformFromHostname(hostname),
    token: encryptedToken,
    user: null, // Will be updated during the refresh call below
  } as Account;

  newAccount = await refreshAccount(newAccount);
  const newAccountUUID = getAccountUUID(newAccount);

  const existingIndex = accountList.findIndex(
    (a) => getAccountUUID(a) === newAccountUUID,
  );

  if (existingIndex >= 0) {
    // Clear the cached Octokit client so the new token is used
    clearOctokitClientCacheForAccount(accountList[existingIndex]);
    // Replace the existing account (e.g. re-authentication with a new token)
    rendererLogInfo(
      'addAccount',
      `updating existing account for user ${newAccount.user.login}`,
    );
    accountList[existingIndex] = newAccount;
  } else {
    accountList.push(newAccount);
  }

  return {
    accounts: accountList,
  };
}

/**
 * Remove an account from the auth state.
 *
 * @param auth - The current auth state.
 * @param account - The account to remove.
 * @returns A new auth state with the account removed.
 */
export function removeAccount(auth: AuthState, account: Account): AuthState {
  const updatedAccounts = auth.accounts.filter(
    (a) => a.token !== account.token,
  );

  return {
    accounts: updatedAccounts,
  };
}

/**
 * Refresh an account's user profile, version, and OAuth scopes from the API.
 *
 * Mutates the `account` object in-place and returns it.
 * Re-throws any error encountered so callers can handle auth failures.
 *
 * @param account - The account to refresh.
 * @returns The same account object with updated user, version, and scopes.
 * @throws If the API call fails.
 */
export async function refreshAccount(account: Account): Promise<Account> {
  try {
    const response = await fetchAuthenticatedUserDetails(account);

    const user = response.data;

    // Refresh user data
    account.user = {
      id: String(user.id),
      login: user.login,
      name: user.name,
      avatar: user.avatar_url as Link,
    };

    account.version = 'latest';

    account.version = extractHostVersion(
      response.headers['x-github-enterprise-version'] as string,
    );

    const accountScopes = response.headers['x-oauth-scopes']
      ?.split(',')
      .map((scope: string) => scope.trim());

    account.scopes = accountScopes ?? [];

    if (!hasRequiredScopes(account)) {
      rendererLogWarn(
        'refreshAccount',
        `account for user ${account.user.login} is missing required scopes`,
      );
    }
  } catch (err) {
    rendererLogError(
      'refreshAccount',
      `failed to refresh account for user ${account.user?.login ?? account.hostname}`,
      err,
    );
    throw err;
  }

  return account;
}

/**
 * Normalize a GitHub Enterprise Server version string to a semver string.
 *
 * Returns `"latest"` when `version` is null/empty (GitHub Cloud or unknown),
 * which is treated as "supports all features" by feature-flag checks.
 *
 * @param version - The raw version string from the `x-github-enterprise-version` header.
 * @returns A normalized semver string, or `"latest"` if unset.
 */
export function extractHostVersion(version: string | null): string {
  if (version) {
    return semver.valid(semver.coerce(version));
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
  newTokenURL.searchParams.append(
    'description',
    `${APPLICATION.NAME} (Created on ${date})`,
  );
  newTokenURL.searchParams.append(
    'scopes',
    getRecommendedScopeNames().join(','),
  );
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
  const newOAuthAppURL = new URL(
    `https://${hostname}/settings/applications/new`,
  );
  newOAuthAppURL.searchParams.append(
    'oauth_application[name]',
    `${APPLICATION.NAME} (Created on ${date})`,
  );
  newOAuthAppURL.searchParams.append(
    'oauth_application[url]',
    'https://gitify.io',
  );
  newOAuthAppURL.searchParams.append(
    'oauth_application[callback_url]',
    'gitify://oauth',
  );

  return newOAuthAppURL.toString() as Link;
}

/**
 * Return true if `hostname` is a valid DNS hostname (e.g. `github.com`).
 * Accepts hostnames with 2-6 character TLDs; rejects IP addresses and bare labels.
 *
 * @param hostname - The hostname string to validate.
 * @returns `true` if valid.
 */
export function isValidHostname(hostname: Hostname) {
  return /^([A-Z0-9]([A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}$/i.test(hostname);
}

/**
 * Return true if `clientId` matches the expected GitHub OAuth App format
 * (20 alphanumeric/underscore characters).
 *
 * @param clientId - The client ID string to validate.
 * @returns `true` if valid.
 */
export function isValidClientId(clientId: ClientID) {
  return /^[A-Z0-9_]{20}$/i.test(clientId);
}

/**
 * Return true if `token` matches the expected Personal Access Token format
 * (40 alphanumeric/underscore characters).
 *
 * @param token - The token string to validate.
 * @returns `true` if valid.
 */
export function isValidToken(token: Token) {
  return /^[A-Z0-9_]{40}$/i.test(token);
}

/**
 * Derive a stable, unique identifier for an account.
 *
 * Encodes `"<hostname>-<userId>-<method>"` as a base-64 string so the UUID
 * is safe for use as a cache key or map key.
 *
 * @param account - The account to identify.
 * @returns A base-64 encoded UUID string.
 */
export function getAccountUUID(account: Account): AccountUUID {
  return btoa(
    `${account.hostname}-${account.user.id}-${account.method}`,
  ) as AccountUUID;
}

/**
 * Return the primary (first) account hostname, or the default GitHub.com hostname
 * if no accounts are present.
 *
 * @param auth - The current auth state.
 * @returns The hostname of the first account.
 */
export function getPrimaryAccountHostname(auth: AuthState) {
  return auth.accounts[0]?.hostname ?? Constants.GITHUB_HOSTNAME;
}

/**
 * Return true if at least one account is authenticated.
 *
 * @param auth - The current auth state.
 */
export function hasAccounts(auth: AuthState) {
  return auth.accounts.length > 0;
}

/**
 * Return true if more than one account is authenticated.
 *
 * @param auth - The current auth state.
 */
export function hasMultipleAccounts(auth: AuthState) {
  return auth.accounts.length > 1;
}

/**
 * Return true if the account has all required OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasRequiredScopes(account: Account): boolean {
  return Constants.OAUTH_SCOPES.REQUIRED.every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}

/**
 * Return true if the account has all recommended OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasRecommendedScopes(account: Account): boolean {
  return Constants.OAUTH_SCOPES.RECOMMENDED.every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}

/**
 * Return true if the account has all alternate OAuth scopes.
 *
 * @param account - The account whose scopes to check.
 */
export function hasAlternateScopes(account: Account): boolean {
  return Constants.OAUTH_SCOPES.ALTERNATE.every(({ name }) =>
    (account.scopes ?? []).includes(name),
  );
}

/**
 * Return the list of required OAuth scope names.
 *
 * @returns Array of required scope name strings.
 */
export function getRequiredScopeNames(): string[] {
  return Constants.OAUTH_SCOPES.REQUIRED.map(({ name }) => name);
}

/**
 * Return the list of recommended OAuth scope names.
 *
 * @returns Array of recommended scope name strings.
 */
export function getRecommendedScopeNames(): string[] {
  return Constants.OAUTH_SCOPES.RECOMMENDED.map(({ name }) => name);
}

/**
 * Return the list of alternate OAuth scope names.
 *
 * @returns Array of alternate scope name strings.
 */
export function getAlternateScopeNames(): string[] {
  return Constants.OAUTH_SCOPES.ALTERNATE.map(({ name }) => name);
}

/**
 * Return the required OAuth scopes as a comma-separated string.
 *
 * @returns Comma-separated required scope names.
 */
export function formatRequiredOAuthScopes(): string {
  return getRequiredScopeNames().join(', ');
}

/**
 * Return the recommended OAuth scopes as a comma-separated string.
 *
 * @returns Comma-separated recommended scope names.
 */
export function formatRecommendedOAuthScopes(): string {
  return getRecommendedScopeNames().join(', ');
}

/**
 * Return the alternate OAuth scopes as a comma-separated string.
 *
 * @returns Comma-separated alternate scope names.
 */
export function formatAlternateOAuthScopes(): string {
  return getAlternateScopeNames().join(', ');
}
