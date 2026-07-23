import {
  createDeviceCode,
  exchangeDeviceCode,
  exchangeWebFlowCode,
  getWebFlowAuthorizationUrl,
} from '@octokit/oauth-methods';
import { request } from '@octokit/request';
import { RequestError } from '@octokit/request-error';

import { Constants } from '../../../constants';

import type { AuthCode, Hostname, Link, Token } from '../../../types';
import type { AuthResponse, DeviceFlowSession, LoginOAuthWebOptions } from '../../auth/types';

import { getRecommendedScopeNames } from '../../auth/scopes';
import { rendererLogError, rendererLogInfo, toError } from '../../core/logger';
import { openExternalLink } from '../../system/comms';
import { getGitHubAuthBaseUrl } from './auth';

type DeviceFlowErrorResponse = {
  error: string;
  error_description: string;
  error_uri: string;
};

/**
 * Initiate a GitHub OAuth Web Flow (OAuth App) authentication.
 *
 * Opens the GitHub authorization URL in the user's browser, then waits for the
 * app's custom `gitify://oauth` callback to receive the authorization code.
 *
 * @param authOptions - The OAuth App client configuration and target hostname.
 * @returns Resolves with the authorization code and options on success.
 */
export function performGitHubWebOAuth(authOptions: LoginOAuthWebOptions): Promise<AuthResponse> {
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

    // Assigned once the listener is registered below; optional-chained in
    // `handleCallback` so a synchronously-firing callback cannot hit the
    // temporal dead zone.
    let unsubscribeAuthCallback: (() => void) | undefined;

    const handleCallback = (callbackUrl: string) => {
      let url: URL;
      try {
        url = new URL(callbackUrl);
      } catch {
        unsubscribeAuthCallback?.();
        reject(new Error(`Received an invalid authentication callback URL: ${callbackUrl}`));
        return;
      }

      const type = url.hostname;
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      const errorUri = url.searchParams.get('error_uri');

      if (code && type === 'oauth') {
        unsubscribeAuthCallback?.();
        resolve({
          authMethod: 'OAuth App',
          authCode: code as AuthCode,
          authOptions: authOptions,
        });
      } else if (error) {
        unsubscribeAuthCallback?.();
        reject(
          new Error(
            `Oops! Something went wrong and we couldn't log you in using GitHub. Please try again. Reason: ${errorDescription} Docs: ${errorUri}`,
          ),
        );
      }
    };

    // Unsubscribed inside `handleCallback` once the flow settles so repeated
    // login attempts do not accumulate stale ipcRenderer listeners.
    unsubscribeAuthCallback = window.gitify.onAuthCallback((callbackUrl: string) => {
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
export async function pollGitHubDeviceFlow(session: DeviceFlowSession): Promise<Token | null> {
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
      const response = err.response?.data as DeviceFlowErrorResponse;
      const errorCode = response.error;

      if (errorCode === 'authorization_pending') {
        return null;
      }

      if (errorCode === 'slow_down') {
        session.intervalSeconds += 5;
        return null;
      }
    }

    rendererLogError('pollGitHubDeviceFlow', 'Error exchanging device code', toError(err));

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
      baseUrl: getGitHubAuthBaseUrl(authOptions.hostname).toString().replace(/\/$/, ''),
    }),
  });

  return authentication.token as Token;
}
