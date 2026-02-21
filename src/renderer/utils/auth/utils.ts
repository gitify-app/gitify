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
  ClientID,
  Hostname,
  Link,
  Token,
} from '../../types';
import type {
  AuthResponse,
  DeviceFlowErrorResponse,
  DeviceFlowSession,
  LoginOAuthWebOptions,
} from './types';

import { openExternalLink } from '../comms';
import { getPlatformFromHostname } from '../helpers';
import { rendererLogError, rendererLogInfo } from '../logger';

export function performGitHubWebOAuth(
  authOptions: LoginOAuthWebOptions,
): Promise<AuthResponse> {
  return new Promise((resolve, reject) => {
    const { url } = getWebFlowAuthorizationUrl({
      clientType: 'oauth-app',
      clientId: authOptions.clientId,
      scopes: Constants.OAUTH_SCOPES.RECOMMENDED,
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

export async function startGitHubDeviceFlow(): Promise<DeviceFlowSession> {
  const deviceCode = await createDeviceCode({
    clientType: 'oauth-app' as const,
    clientId: Constants.OAUTH_DEVICE_FLOW_CLIENT_ID,
    scopes: Constants.OAUTH_SCOPES.RECOMMENDED,
    request: request.defaults({
      baseUrl: getGitHubAuthBaseUrl(Constants.GITHUB_HOSTNAME).toString(),
    }),
  });

  return {
    hostname: Constants.GITHUB_HOSTNAME,
    clientId: Constants.OAUTH_DEVICE_FLOW_CLIENT_ID,
    deviceCode: deviceCode.data.device_code,
    userCode: deviceCode.data.user_code,
    verificationUri: deviceCode.data.verification_uri,
    intervalSeconds: deviceCode.data.interval,
    expiresAt: Date.now() + deviceCode.data.expires_in * 1000,
  } as DeviceFlowSession;
}

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

export async function performGitHubDeviceOAuth(): Promise<Token> {
  const session = await startGitHubDeviceFlow();

  const intervalMs = Math.max(5000, session.intervalSeconds * 1000);

  while (Date.now() < session.expiresAt) {
    const token = await pollGitHubDeviceFlow(session);

    if (token) {
      return token;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Device code expired before authorization completed');
}

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

export function extractHostVersion(version: string | null): string {
  if (version) {
    return semver.valid(semver.coerce(version));
  }

  return 'latest';
}

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

export function getAccountUUID(account: Account): AccountUUID {
  return btoa(
    `${account.hostname}-${account.user.id}-${account.method}`,
  ) as AccountUUID;
}

export function formatRecommendedOAuthScopes() {
  return Constants.OAUTH_SCOPES.RECOMMENDED.join(', ');
}

export function formatAlternateOAuthScopes() {
  return Constants.OAUTH_SCOPES.ALTERNATE.join(', ');
}
