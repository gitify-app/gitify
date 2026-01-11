import { format } from 'date-fns';
import semver from 'semver';

import { APPLICATION } from '../../shared/constants';

import { Constants } from '../../constants';
import type {
  Account,
  AuthCode,
  AuthState,
  ClientID,
  Hostname,
  Link,
  Token,
} from '../../types';
import { fetchAuthenticatedUserDetails } from '../api/client';
import {
  encryptValue,
  exchangeGitHubAppCode,
  exchangeOAuthCode,
  getGitHubAppClientId,
  openExternalLink,
} from '../comms';
import { getPlatformFromHostname } from '../helpers';
import { rendererLogError, rendererLogInfo, rendererLogWarn } from '../logger';
import type {
  AuthMethod,
  AuthResponse,
  AuthTokenResponse,
  LoginOAuthAppOptions,
} from './types';

// OAuth authentication timeout (5 minutes)
const OAUTH_TIMEOUT_MS = 300000;

/**
 * Generate a cryptographically secure random state parameter for OAuth CSRF protection.
 * Uses Web Crypto API for secure random generation.
 */
function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

/**
 * Initiate GitHub OAuth authentication flow.
 *
 * For GitHub App (default): Uses credentials embedded in the Rust backend.
 * For OAuth App: Uses user-provided credentials.
 *
 * @param authOptions - Optional OAuth app options for custom OAuth apps
 */
export async function authGitHub(
  authOptions?: LoginOAuthAppOptions,
): Promise<AuthResponse> {
  // Determine if using default GitHub App or custom OAuth App
  const isGitHubApp = !authOptions;

  // Get the client ID for the authorization URL
  const clientId = isGitHubApp
    ? await getGitHubAppClientId()
    : authOptions.clientId;

  const hostname = isGitHubApp
    ? Constants.DEFAULT_HOSTNAME
    : authOptions.hostname;

  // Generate state parameter for CSRF protection
  const oauthState = generateOAuthState();

  return new Promise((resolve, reject) => {
    let cleanupFn: (() => void) | undefined;

    // Set up timeout to prevent hanging OAuth flows
    const timeoutId = setTimeout(() => {
      cleanupFn?.();
      reject(new Error('OAuth authentication timed out. Please try again.'));
    }, OAUTH_TIMEOUT_MS);

    const authUrl = new URL(`https://${hostname}`);
    authUrl.pathname = '/login/oauth/authorize';
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append(
      'scope',
      Constants.OAUTH_SCOPES.RECOMMENDED.toString(),
    );
    authUrl.searchParams.append('state', oauthState);

    openExternalLink(authUrl.toString() as Link);

    const handleCallback = (callbackUrl: string) => {
      clearTimeout(timeoutId);
      cleanupFn?.();

      const url = new URL(callbackUrl);

      const type = url.hostname;
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      const errorUri = url.searchParams.get('error_uri');

      // Verify state parameter to prevent CSRF attacks
      if (returnedState !== oauthState) {
        reject(
          new Error(
            'OAuth state mismatch. This could indicate a CSRF attack. Please try again.',
          ),
        );
        return;
      }

      if (code && (type === 'auth' || type === 'oauth')) {
        const authMethod: AuthMethod =
          type === 'auth' ? 'GitHub App' : 'OAuth App';

        resolve({
          authMethod: authMethod,
          authCode: code as AuthCode,
          authOptions: authOptions ?? {
            hostname: Constants.DEFAULT_HOSTNAME,
            clientId: clientId as ClientID,
            clientSecret: '' as never, // Not needed for GitHub App flow
          },
        });
      } else if (error) {
        reject(
          new Error(
            `Oops! Something went wrong and we couldn't log you in using GitHub. Please try again. Reason: ${errorDescription} Docs: ${errorUri}`,
          ),
        );
      }
    };

    // Check if auth callback is available (Tauri mode or test environment with mocks)
    if (
      typeof window !== 'undefined' &&
      window.gitify?.onAuthCallback !== undefined
    ) {
      window.gitify
        .onAuthCallback((callbackUrl: string) => {
          rendererLogInfo(
            'renderer:auth-callback',
            `received authentication callback URL ${callbackUrl}`,
          );
          handleCallback(callbackUrl);
        })
        .then((unlisten) => {
          cleanupFn = unlisten;
        });
    } else {
      // Browser fallback - OAuth won't work without Tauri
      clearTimeout(timeoutId);
      reject(
        new Error(
          'OAuth authentication is not available in browser mode. Please run the app with Tauri.',
        ),
      );
    }
  });
}

/**
 * Exchange an authorization code for an access token.
 *
 * For GitHub App: Uses the secure backend exchange with embedded credentials.
 * For OAuth App: Uses user-provided credentials via secure backend exchange.
 *
 * @param authCode - The authorization code from the OAuth callback
 * @param authOptions - Optional OAuth app options for custom OAuth apps
 */
export async function getToken(
  authCode: AuthCode,
  authOptions?: LoginOAuthAppOptions,
): Promise<AuthTokenResponse> {
  // Determine if using default GitHub App or custom OAuth App
  const isGitHubApp = !authOptions || !authOptions.clientSecret;

  let token: string;

  if (isGitHubApp) {
    // Use the GitHub App flow with embedded credentials
    token = await exchangeGitHubAppCode(authCode);
  } else {
    // Use the OAuth App flow with user-provided credentials
    token = await exchangeOAuthCode(
      authOptions.hostname,
      authOptions.clientId,
      authOptions.clientSecret,
      authCode,
    );
  }

  const hostname = authOptions?.hostname ?? Constants.DEFAULT_HOSTNAME;

  return {
    hostname,
    token: token as Token,
  };
}

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
  } as Account;

  newAccount = await refreshAccount(newAccount);
  const newAccountUUID = getAccountUUID(newAccount);

  const accountAlreadyExists = accountList.some(
    (a) => getAccountUUID(a) === newAccountUUID,
  );

  if (accountAlreadyExists) {
    rendererLogWarn(
      'addAccount',
      `account for user ${newAccount.user?.login} already exists`,
    );
  } else {
    accountList.push(newAccount);
  }

  return {
    accounts: accountList,
  };
}

export function removeAccount(auth: AuthState, account: Account): AuthState {
  const updatedAccounts = auth.accounts.filter(
    (a) => a.token !== account.token,
  );

  return {
    accounts: updatedAccounts,
  };
}

export async function refreshAccount(account: Account): Promise<Account> {
  try {
    const response = await fetchAuthenticatedUserDetails(
      account.hostname,
      account.token,
    );
    const user = response.data?.viewer;

    if (!user) {
      return account;
    }

    // Refresh user data
    account.user = {
      id: user.id,
      login: user.login,
      name: user.name ?? null,
      avatar: user.avatarUrl,
    };

    account.version = extractHostVersion(
      response.headers['x-github-enterprise-version'] ?? null,
    );

    const accountScopes = response.headers['x-oauth-scopes']
      ?.split(',')
      .map((scope: string) => scope.trim());

    account.hasRequiredScopes =
      Constants.OAUTH_SCOPES.RECOMMENDED.every((scope) =>
        accountScopes?.includes(scope),
      ) ||
      Constants.OAUTH_SCOPES.ALTERNATE.every((scope) =>
        accountScopes?.includes(scope),
      );

    if (!account.hasRequiredScopes) {
      rendererLogWarn(
        'refreshAccount',
        `account for user ${account.user?.login} is missing required scopes`,
      );
    }
  } catch (err) {
    rendererLogError(
      'refreshAccount',
      `failed to refresh account for user ${account.user?.login}`,
      err as Error,
    );
  }

  return account;
}

export function extractHostVersion(version: string | null): string {
  if (version) {
    return semver.valid(semver.coerce(version)) ?? 'latest';
  }

  return 'latest';
}

export function getDeveloperSettingsURL(account: Account): Link {
  const settingsURL = new URL(`https://${account.hostname}`);

  switch (account.method) {
    case 'GitHub App':
      settingsURL.pathname =
        '/settings/connections/applications/27a352516d3341cee376';
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

export function getNewTokenURL(hostname: Hostname): Link {
  const date = format(new Date(), 'PP p');
  const newTokenURL = new URL(`https://${hostname}/settings/tokens/new`);
  newTokenURL.searchParams.append(
    'description',
    `${APPLICATION.NAME} (Created on ${date})`,
  );
  newTokenURL.searchParams.append(
    'scopes',
    Constants.OAUTH_SCOPES.RECOMMENDED.join(','),
  );

  return newTokenURL.toString() as Link;
}

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

export function isValidHostname(hostname: Hostname) {
  return /^([A-Z0-9]([A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}$/i.test(hostname);
}

export function isValidClientId(clientId: ClientID) {
  return /^[A-Z0-9_]{20}$/i.test(clientId);
}

export function isValidToken(token: Token) {
  return /^[A-Z0-9_]{40}$/i.test(token);
}

export function getAccountUUID(account: Account): string {
  return btoa(
    `${account.hostname}-${account.user?.id ?? 'unknown'}-${account.method}`,
  );
}

/**
 *  Return the primary (first) account hostname
 */
export function getPrimaryAccountHostname(auth: AuthState) {
  return auth.accounts[0]?.hostname ?? Constants.DEFAULT_HOSTNAME;
}

export function hasAccounts(auth: AuthState) {
  return auth.accounts.length > 0;
}

export function hasMultipleAccounts(auth: AuthState) {
  return auth.accounts.length > 1;
}

export function formatRecommendedOAuthScopes() {
  return Constants.OAUTH_SCOPES.RECOMMENDED.join(', ');
}

export function formatAlternateOAuthScopes() {
  return Constants.OAUTH_SCOPES.ALTERNATE.join(', ');
}
