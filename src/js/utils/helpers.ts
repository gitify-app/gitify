import { parse } from 'url';
const { remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;
const dialog = remote.dialog;

import Constants from './constants';
import { loginUser } from '../actions';
import { AuthState } from '../../types/reducers';

export function getEnterpriseAccountToken(hostname, accounts): string {
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

export function authGithub(
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
  dispatch
) {
  // Build the OAuth consent page URL
  const authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
  });

  const githubUrl = `https://${authOptions.hostname}/login/oauth/authorize`;
  const authUrl = `${githubUrl}?client_id=${authOptions.clientId}&scope=${Constants.AUTH_SCOPE}`;

  const session = authWindow.webContents.session;
  session.clearStorageData();

  authWindow.loadURL(authUrl);

  function handleCallback(url) {
    const raw_code = /code=([^&]*)/.exec(url) || null;
    const code = raw_code && raw_code.length > 1 ? raw_code[1] : null;
    const error = /\?error=(.+)$/.exec(url);

    if (code || error) {
      // Close the browser if code found or error
      authWindow.destroy();
    }

    // If there is a code, proceed to get token from github
    if (code) {
      dispatch(loginUser(authOptions, code));
    } else if (error) {
      alert(
        "Oops! Something went wrong and we couldn't " +
          'log you in using Github. Please try again.'
      );
    }
  }

  // If "Done" button is pressed, hide "Loading"
  authWindow.on('close', () => {
    authWindow.destroy();
  });

  authWindow.webContents.on(
    'did-fail-load',
    (event, errorCode, errorDescription, validatedURL) => {
      if (validatedURL.includes(authOptions.hostname)) {
        authWindow.destroy();
        dialog.showErrorBox(
          'Invalid Hostname',
          `Could not load https://${authOptions.hostname}/.`
        );
      }
    }
  );

  authWindow.webContents.on('will-redirect', (event, url) => {
    event.preventDefault();
    handleCallback(url);
  });
}

export function isUserEitherLoggedIn(auth: AuthState) {
  return auth.token !== null || auth.enterpriseAccounts.length > 0;
}
