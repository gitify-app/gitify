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
import { apiRequest } from '../api/request';
import { encryptValue, openExternalLink } from '../comms';
import { getPlatformFromHostname } from '../helpers';
import { rendererLogError, rendererLogInfo, rendererLogWarn } from '../logger';
import type { AuthMethod, AuthResponse, AuthTokenResponse } from './types';

export function authGitHub(
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    const authUrl = new URL(`https://${authOptions.hostname}`);
    authUrl.pathname = '/login/oauth/authorize';
    authUrl.searchParams.append('client_id', authOptions.clientId);
    authUrl.searchParams.append(
      'scope',
      Constants.OAUTH_SCOPES.RECOMMENDED.toString(),
    );

    openExternalLink(authUrl.toString() as Link);

    const handleCallback = (callbackUrl: string) => {
      const url = new URL(callbackUrl);

      const type = url.hostname;
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      const errorUri = url.searchParams.get('error_uri');

      if (code && (type === 'auth' || type === 'oauth')) {
        const authMethod: AuthMethod =
          type === 'auth' ? 'GitHub App' : 'OAuth App';

        resolve({
          authMethod: authMethod,
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

    // Check if auth callback is available (Tauri mode or test environment with mocks)
    if (
      typeof window !== 'undefined' &&
      window.gitify?.onAuthCallback !== undefined
    ) {
      window.gitify.onAuthCallback((callbackUrl: string) => {
        rendererLogInfo(
          'renderer:auth-callback',
          `received authentication callback URL ${callbackUrl}`,
        );
        handleCallback(callbackUrl);
      });
    } else {
      // Browser fallback - OAuth won't work without Tauri
      reject(
        new Error(
          'OAuth authentication is not available in browser mode. Please run the app with Tauri.',
        ),
      );
    }
  });
}

export async function getToken(
  authCode: AuthCode,
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
): Promise<AuthTokenResponse> {
  const url =
    `https://${authOptions.hostname}/login/oauth/access_token` as Link;
  const data = {
    client_id: authOptions.clientId,
    client_secret: authOptions.clientSecret,
    code: authCode,
  };

  const response = await apiRequest(url, 'POST', data);
  return {
    hostname: authOptions.hostname,
    token: response?.data?.access_token,
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
