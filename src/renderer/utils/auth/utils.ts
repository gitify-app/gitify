import { BrowserWindow } from '@electron/remote';
import { format } from 'date-fns';
import semver from 'semver';

import { logError } from '../../../shared/logger';
import type {
  Account,
  AuthCode,
  AuthState,
  ClientID,
  GitifyUser,
  Hostname,
  Link,
  Token,
} from '../../types';
import type { UserDetails } from '../../typesGitHub';
import { getAuthenticatedUser } from '../api/client';
import { apiRequest } from '../api/request';
import { Constants } from '../constants';
import { getPlatformFromHostname } from '../helpers';
import type { AuthMethod, AuthResponse, AuthTokenResponse } from './types';

// TODO - Refactor our OAuth2 flow to use system browser and local app gitify://callback - see #485 #561 #654
export function authGitHub(
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    // Build the OAuth consent page URL
    const authWindow = new BrowserWindow({
      width: 548,
      height: 736,
      show: true,
    });

    const authUrl = new URL(`https://${authOptions.hostname}`);
    authUrl.pathname = '/login/oauth/authorize';
    authUrl.searchParams.append('client_id', authOptions.clientId);
    authUrl.searchParams.append('scope', Constants.AUTH_SCOPE.toString());

    const session = authWindow.webContents.session;
    session.clearStorageData();

    authWindow.loadURL(authUrl.toString());

    const handleCallback = (url: Link) => {
      const raw_code = /code=([^&]*)/.exec(url) || null;
      const authCode =
        raw_code && raw_code.length > 1 ? (raw_code[1] as AuthCode) : null;
      const error = /\?error=(.+)$/.exec(url);
      if (authCode || error) {
        // Close the browser if code found or error
        authWindow.destroy();
      }
      // If there is a code, proceed to get token from github
      if (authCode) {
        resolve({ authCode, authOptions });
      } else if (error) {
        reject(
          "Oops! Something went wrong and we couldn't " +
            'log you in using GitHub. Please try again.',
        );
      }
    };

    // If "Done" button is pressed, hide "Loading"
    authWindow.on('close', () => {
      authWindow.destroy();
    });

    authWindow.webContents.on(
      'did-fail-load',
      (_event, _errorCode, _errorDescription, validatedURL) => {
        if (validatedURL.includes(authOptions.hostname)) {
          authWindow.destroy();
          reject(
            `Invalid Hostname. Could not load https://${authOptions.hostname}/.`,
          );
        }
      },
    );

    authWindow.webContents.on('will-redirect', (event, url) => {
      event.preventDefault();
      handleCallback(url as Link);
    });

    authWindow.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      handleCallback(url as Link);
    });
  });
}

export async function getUserData(
  token: Token,
  hostname: Hostname,
): Promise<GitifyUser> {
  const response: UserDetails = (await getAuthenticatedUser(hostname, token))
    .data;

  return {
    id: response.id,
    login: response.login,
    name: response.name,
    avatar: response.avatar_url,
  };
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
    token: response.data.access_token,
  };
}

export async function addAccount(
  auth: AuthState,
  method: AuthMethod,
  token: Token,
  hostname: Hostname,
): Promise<AuthState> {
  let newAccount = {
    hostname: hostname,
    method: method,
    platform: getPlatformFromHostname(hostname),
    token: token,
  } as Account;

  newAccount = await refreshAccount(newAccount);

  return {
    accounts: [...auth.accounts, newAccount],
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
    const res = await getAuthenticatedUser(account.hostname, account.token);

    // Refresh user data
    account.user = {
      id: res.data.id,
      login: res.data.login,
      name: res.data.name,
      avatar: res.data.avatar_url,
    };

    account.version = extractHostVersion(
      res.headers['x-github-enterprise-version'],
    );

    const accountScopes = res.headers['x-oauth-scopes']
      ?.split(',')
      .map((scope: string) => scope.trim());

    account.hasRequiredScopes = Constants.AUTH_SCOPE.every((scope) =>
      accountScopes.includes(scope),
    );
  } catch (err) {
    logError(
      'refreshAccount',
      `failed to refresh account for user ${account.user.login}`,
      err,
    );
  }

  return account;
}

export function extractHostVersion(version: string | null): string {
  if (version) {
    return semver.valid(semver.coerce(version));
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
  newTokenURL.searchParams.append('description', `Gitify (Created on ${date})`);
  newTokenURL.searchParams.append('scopes', Constants.AUTH_SCOPE.join(','));

  return newTokenURL.toString() as Link;
}

export function getNewOAuthAppURL(hostname: Hostname): Link {
  const date = format(new Date(), 'PP p');
  const newOAuthAppURL = new URL(
    `https://${hostname}/settings/applications/new`,
  );
  newOAuthAppURL.searchParams.append(
    'oauth_application[name]',
    `Gitify (Created on ${date})`,
  );
  newOAuthAppURL.searchParams.append(
    'oauth_application[url]',
    'https://www.gitify.io',
  );
  newOAuthAppURL.searchParams.append(
    'oauth_application[callback_url]',
    'https://www.gitify.io/callback',
  );

  return newOAuthAppURL.toString() as Link;
}

export function isValidHostname(hostname: Hostname) {
  return /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/i.test(
    hostname,
  );
}

export function isValidClientId(clientId: ClientID) {
  return /^[A-Z0-9_]{20}$/i.test(clientId);
}

export function isValidToken(token: Token) {
  return /^[A-Z0-9_]{40}$/i.test(token);
}

export function getAccountUUID(account: Account): string {
  return btoa(`${account.hostname}-${account.user.id}-${account.method}`);
}

export function hasAccounts(auth: AuthState) {
  return auth.accounts.length > 0;
}

export function hasMultipleAccounts(auth: AuthState) {
  return auth.accounts.length > 1;
}
