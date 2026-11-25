import { createDeviceCode, exchangeDeviceCode } from '@octokit/oauth-methods';
import { request } from '@octokit/request';
import { RequestError } from '@octokit/request-error';

import { Constants } from '../../../constants';

import type { ClientID, Hostname, Token } from '../../../types';
import type { DeviceFlowSession } from '../../auth/types';

import i18n from '../../../i18n';
import { getRecommendedScopeNames } from '../../auth/scopeNames';
import { rendererLogError, toError } from '../../core/logger';
import { getGitHubAuthBaseUrl } from './auth';

type DeviceFlowErrorResponse = {
  error: string;
  error_description: string;
  error_uri: string;
};

/**
 * Start a GitHub Device Flow authorization session.
 *
 * Requests a device code from GitHub and returns the session state
 * (user code, verification URI, expiry) needed to complete the flow.
 *
 * @param hostname - The GitHub hostname to authenticate against. Defaults to github.com.
 * @param scopes - Array of scope names to request. Defaults to recommended (full) scopes.
 * @param clientId - The OAuth app client ID to authorize with. Defaults to Gitify's
 *                   own preconfigured app; a user-supplied custom app passes its own.
 * @returns The device flow session data.
 */
export async function startGitHubDeviceFlow(
  hostname: Hostname = Constants.GITHUB_HOSTNAME,
  scopes: string[] = getRecommendedScopeNames(),
  clientId: ClientID = Constants.OAUTH_DEVICE_FLOW_CLIENT_ID,
): Promise<DeviceFlowSession> {
  const deviceCode = await createDeviceCode({
    clientType: 'oauth-app' as const,
    clientId: clientId,
    scopes: scopes,
    request: request.defaults({
      baseUrl: getGitHubAuthBaseUrl(hostname).toString(),
    }),
  });

  return {
    hostname: hostname,
    clientId: clientId,
    deviceCode: deviceCode.data.device_code,
    userCode: deviceCode.data.user_code,
    verificationUri: deviceCode.data.verification_uri,
    intervalSeconds: deviceCode.data.interval,
    expiresAt: Date.now() + deviceCode.data.expires_in * 1000,
  } as DeviceFlowSession;
}

/**
 * Describe a device-flow start failure in actionable terms.
 *
 * A device flow can only start when the app has device flow enabled and the
 * client ID is known to the host. Both are common setup mistakes for a
 * user-supplied custom app, so they are surfaced with a named cause and fix
 * instead of a raw transport error.
 *
 * @param err - The error thrown while starting the device flow.
 * @param hostname - The host the session was started against.
 * @param clientId - The client ID supplied for a custom app, when any.
 * @returns A user-facing message, or `undefined` for an unrecognised failure.
 */
export function describeDeviceFlowStartError(
  err: unknown,
  hostname: Hostname,
  clientId?: ClientID,
): string | undefined {
  if (!(err instanceof RequestError)) {
    return undefined;
  }

  const errorCode = (err.response?.data as Partial<DeviceFlowErrorResponse> | undefined)?.error;

  switch (errorCode) {
    case 'device_flow_disabled':
      return clientId
        ? i18n.t(
            'login.device.error_disabled_custom',
            "Device flow is not enabled for this OAuth app. Enable it in that app's settings under {{url}}, then try again.",
            { url: `https://${hostname}/settings/developers` },
          )
        : i18n.t(
            'login.device.error_disabled',
            "Device flow is not enabled for this OAuth app. Enable it in the app's settings on {{hostname}}, then try again.",
            { hostname },
          );
    case 'incorrect_client_credentials':
      return i18n.t(
        'login.device.error_invalid_client_id',
        'The client ID is not valid for {{hostname}}. Check it and try again.',
        { hostname },
      );
    default:
      return undefined;
  }
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
