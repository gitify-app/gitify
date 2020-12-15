const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

import { apiRequest } from '../utils/api-requests';
import { AuthResponse, AuthTokenResponse } from '../types';
import { Constants } from '../utils/constants';

export const useGitHubAuth = (authOptions = Constants.DEFAULT_AUTH_OPTIONS) => {
  const { hostname } = authOptions;

  const authGitHub = (): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      // Build the OAuth consent page URL
      const authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: true,
      });

      const githubUrl = `https://${hostname}/login/oauth/authorize`;
      const authUrl = `${githubUrl}?client_id=${authOptions.clientId}&scope=${Constants.AUTH_SCOPE}`;

      const session = authWindow.webContents.session;
      session.clearStorageData();

      authWindow.loadURL(authUrl);

      const handleCallback = (url: string) => {
        const raw_code = /code=([^&]*)/.exec(url) || null;
        const code = raw_code && raw_code.length > 1 ? raw_code[1] : null;
        const error = /\?error=(.+)$/.exec(url);
        if (code || error) {
          // Close the browser if code found or error
          authWindow.destroy();
        }
        // If there is a code, proceed to get token from github
        if (code) {
          resolve({ hostname, code });
        } else if (error) {
          reject(
            "Oops! Something went wrong and we couldn't " +
              'log you in using Github. Please try again.'
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
          if (validatedURL.includes(hostname)) {
            authWindow.destroy();
            reject(`Invalid Hostname. Could not load https://${hostname}/.`);
          }
        }
      );

      authWindow.webContents.on('will-redirect', (event, url) => {
        event.preventDefault();
        handleCallback(url);
      });
    });
  };

  const getToken = async (
    code: string,
    authOptions = Constants.DEFAULT_AUTH_OPTIONS
  ): Promise<AuthTokenResponse> => {
    const url = `https://${authOptions.hostname}/login/oauth/access_token`;
    const data = {
      client_id: authOptions.clientId,
      client_secret: authOptions.clientSecret,
      code: code,
    };

    const response = await apiRequest(url, 'POST', data);
    return {
      hostname,
      token: response.data.access_token,
    };
  };

  return { authGitHub, getToken };
};
