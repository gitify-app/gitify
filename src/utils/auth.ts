import { BrowserWindow } from '@electron/remote';

import { format } from 'date-fns';
import type {
  AuthResponse,
  AuthState,
  AuthTokenResponse,
  GitifyUser,
} from '../types';
import type { UserDetails } from '../typesGitHub';
import { Constants } from '../utils/constants';
import { getAuthenticatedUser } from './api/client';
import { apiRequest } from './api/request';
import { isEnterpriseHost } from './helpers';

export const authGitHub = (
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    // Build the OAuth consent page URL
    const authWindow = new BrowserWindow({
      width: 548,
      height: 736,
      show: true,
    });

    const githubUrl = `https://${authOptions.hostname}/login/oauth/authorize`;
    const authUrl = `${githubUrl}?client_id=${authOptions.clientId}&scope=${Constants.AUTH_SCOPE}`;

    const session = authWindow.webContents.session;
    session.clearStorageData();

    authWindow.loadURL(authUrl);

    const handleCallback = (url: string) => {
      const raw_code = /code=([^&]*)/.exec(url) || null;
      const authCode = raw_code && raw_code.length > 1 ? raw_code[1] : null;
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
      (event, errorCode, errorDescription, validatedURL) => {
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
      handleCallback(url);
    });

    authWindow.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      handleCallback(url);
    });
  });
};

export const getUserData = async (
  token: string,
  hostname: string,
): Promise<GitifyUser> => {
  const response: UserDetails = (await getAuthenticatedUser(hostname, token))
    .data;

  return {
    id: response.id,
    login: response.login,
    name: response.name,
  };
};

export const getToken = async (
  authCode: string,
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
): Promise<AuthTokenResponse> => {
  const url = `https://${authOptions.hostname}/login/oauth/access_token`;
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
};

export const addAccount = (
  accounts: AuthState,
  token,
  hostname,
  user?: GitifyUser,
): AuthState => {
  if (!isEnterpriseHost(hostname)) {
    return {
      ...accounts,
      token,
      user: user ?? null,
    };
  }

  return {
    ...accounts,
    enterpriseAccounts: [
      ...accounts.enterpriseAccounts,
      {
        token,
        hostname: hostname,
      },
    ],
  };
};

export function getNewOAuthAppURL(hostname: string): string {
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

  return newOAuthAppURL.toString();
}
