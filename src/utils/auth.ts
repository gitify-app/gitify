import { shell } from 'electron';
import { generateGitHubAPIUrl } from './helpers';
import { apiRequest, apiRequestAuth } from '../utils/api-requests';
import { AuthResponse, AuthState, AuthTokenResponse } from '../types';
import { Constants } from '../utils/constants';
import { User } from '../typesGithub';

export const authGitHub = (
  authOptions = Constants.DEFAULT_AUTH_OPTIONS,
): Promise<AuthResponse> => {
  const callbackUrl = encodeURIComponent("gitify://oauth-callback")

  const githubUrl = `https://${authOptions.hostname}/login/oauth/authorize`;
  const authUrl = `${githubUrl}?client_id=${authOptions.clientId}&scope=${Constants.AUTH_SCOPE}&redirect_uri=${callbackUrl}`;

  shell.openExternal(authUrl);
};

export const handleAuthCallback = (url: string) => {
  const raw_code = /code=([^&]*)/.exec(url) || null;
  const authCode = raw_code && raw_code.length > 1 ? raw_code[1] : null;
  const error = /\?error=(.+)$/.exec(url);

  // If there is a code, proceed to get token from github
  if (authCode) {
    const { token } = await getToken(authCode);
  } else if (error) {
    // TODO: Error handling
    // reject(
    //   "Oops! Something went wrong and we couldn't " +
    //   'log you in using Github. Please try again.',
    // );
  }
};

export const getUserData = async (
  token: string,
  hostname: string,
): Promise<User> => {
  const response = await apiRequestAuth(
    `${generateGitHubAPIUrl(hostname)}user`,
    'GET',
    token,
  );

  return {
    id: response.data.id,
    login: response.data.login,
    name: response.data.name,
  };
};

const getToken = async (
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
  user?: User,
): AuthState => {
  if (hostname === Constants.DEFAULT_AUTH_OPTIONS.hostname) {
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
