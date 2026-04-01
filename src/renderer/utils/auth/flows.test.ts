// @vitest-environment happy-dom
// Use a hoist-safe mock factory for '@octokit/oauth-methods'
vi.mock('@octokit/oauth-methods', async () => {
  const actual = await vi.importActual<typeof import('@octokit/oauth-methods')>(
    '@octokit/oauth-methods',
  );
  return {
    ...actual,
    createDeviceCode: vi.fn(),
    exchangeDeviceCode: vi.fn(),
    exchangeWebFlowCode: vi.fn(),
  };
});

import {
  createDeviceCode,
  exchangeDeviceCode,
  exchangeWebFlowCode,
} from '@octokit/oauth-methods';
import { RequestError } from '@octokit/request-error';

import type { MockedFunction } from 'vitest';

import { Constants } from '../../constants';

import type { AuthCode, ClientID, ClientSecret, Hostname } from '../../types';
import type { DeviceFlowSession, LoginOAuthWebOptions } from './types';

import * as comms from '../../utils/system/comms';
import * as logger from '../core/logger';
import * as authUtils from './flows';
import { getRecommendedScopeNames } from './scopes';

const createDeviceCodeMock = createDeviceCode as unknown as MockedFunction<
  typeof createDeviceCode
>;

const exchangeDeviceCodeMock = exchangeDeviceCode as unknown as MockedFunction<
  typeof exchangeDeviceCode
>;

const exchangeWebFlowCodeMock =
  exchangeWebFlowCode as unknown as MockedFunction<typeof exchangeWebFlowCode>;

describe('renderer/utils/auth/flows.ts', () => {
  vi.spyOn(logger, 'rendererLogInfo').mockImplementation(vi.fn());
  const openExternalLinkSpy = vi
    .spyOn(comms, 'openExternalLink')
    .mockImplementation(vi.fn());

  beforeEach(() => {
    // Mock OAUTH_DEVICE_FLOW_CLIENT_ID value
    Constants.OAUTH_DEVICE_FLOW_CLIENT_ID = 'FAKE_CLIENT_ID_123' as ClientID;
  });

  describe('Gitify GitHub OAuth - Device Code Flow', () => {
    describe('startGitHubDeviceFlow', () => {
      it('should request a device code and return a session', async () => {
        createDeviceCodeMock.mockResolvedValueOnce({
          data: {
            device_code: 'device-code-xyz',
            user_code: 'user-code-xyz',
            verification_uri: 'https://github.com/login/device',
            expires_in: 600,
            interval: 5,
          },
        } as unknown as Awaited<ReturnType<typeof createDeviceCode>>);

        const session = await authUtils.startGitHubDeviceFlow();

        expect(createDeviceCodeMock).toHaveBeenCalledWith({
          clientType: 'oauth-app',
          clientId: 'FAKE_CLIENT_ID_123',
          scopes: getRecommendedScopeNames(),
          request: expect.any(Function),
        });

        expect(session.deviceCode).toBe('device-code-xyz');
        expect(session.userCode).toBe('user-code-xyz');
        expect(session.verificationUri).toBe('https://github.com/login/device');
        expect(session.intervalSeconds).toBe(5);
        expect(session.expiresAt).toBeGreaterThan(Date.now());
      });
    });

    describe('pollGitHubDeviceFlow', () => {
      const baseSession = {
        hostname: 'github.com',
        clientId: 'FAKE_CLIENT_ID_123',
        deviceCode: 'device-code',
        userCode: 'user-code',
        verificationUri: 'https://github.com/login/device',
        intervalSeconds: 5,
        expiresAt: Date.now() + 10000,
      } as const;

      it('returns token on successful exchange', async () => {
        exchangeDeviceCodeMock.mockResolvedValueOnce({
          authentication: { token: 'device-token-xyz' },
        } as unknown as Awaited<ReturnType<typeof exchangeDeviceCode>>);

        const token = await authUtils.pollGitHubDeviceFlow(
          baseSession as DeviceFlowSession,
        );

        expect(exchangeDeviceCodeMock).toHaveBeenCalledWith({
          clientType: 'oauth-app',
          clientId: 'FAKE_CLIENT_ID_123',
          code: 'device-code',
          request: expect.any(Function),
        });

        expect(token).toBe('device-token-xyz');
      });

      it('returns null when authorization is pending or slow_down', async () => {
        const pendingErr = Object.create(RequestError.prototype);
        pendingErr.response = { data: { error: 'authorization_pending' } };

        exchangeDeviceCodeMock.mockRejectedValueOnce(pendingErr);

        const token = await authUtils.pollGitHubDeviceFlow(
          baseSession as DeviceFlowSession,
        );

        expect(token).toBeNull();
      });

      it('throws on other errors', async () => {
        const otherErr = new Error('boom');

        exchangeDeviceCodeMock.mockRejectedValueOnce(otherErr);

        await expect(
          async () =>
            await authUtils.pollGitHubDeviceFlow(
              baseSession as DeviceFlowSession,
            ),
        ).rejects.toThrow('boom');
      });
    });
  });

  describe('performGitHubWebOAuth', () => {
    const webAuthOptions: LoginOAuthWebOptions = {
      hostname: 'github.com' as Hostname,
      clientId: 'FAKE_CLIENT_ID_123' as ClientID,
      clientSecret: 'FAKE_CLIENT_SECRET_123' as ClientSecret,
    };

    it('should call performGitHubWebOAuth using custom oauth app - success oauth flow', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback('gitify://oauth?code=123-456');
      });

      const res = await authUtils.performGitHubWebOAuth({
        clientId: 'BYO_CLIENT_ID' as ClientID,
        clientSecret: 'BYO_CLIENT_SECRET' as ClientSecret,
        hostname: 'my.git.com' as Hostname,
      });

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://my.git.com/login/oauth/authorize?allow_signup=false&client_id=BYO_CLIENT_ID&scope=notifications%2Cread%3Auser%2Crepo',
        ),
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );

      expect(res.authMethod).toBe('OAuth App');
      expect(res.authCode).toBe('123-456');
    });

    it('should call performGitHubWebOAuth - failure', async () => {
      window.gitify.onAuthCallback = vi.fn().mockImplementation((callback) => {
        callback(
          'gitify://auth?error=invalid_request&error_description=The+redirect_uri+is+missing+or+invalid.&error_uri=https://docs.github.com/en/developers/apps/troubleshooting-oauth-errors',
        );
      });

      await expect(
        async () => await authUtils.performGitHubWebOAuth(webAuthOptions),
      ).rejects.toEqual(
        new Error(
          "Oops! Something went wrong and we couldn't log you in using GitHub. Please try again. Reason: The redirect_uri is missing or invalid. Docs: https://docs.github.com/en/developers/apps/troubleshooting-oauth-errors",
        ),
      );

      expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
      expect(openExternalLinkSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://github.com/login/oauth/authorize?allow_signup=false&client_id=FAKE_CLIENT_ID_123&scope=notifications%2Cread%3Auser%2Crepo',
        ),
      );

      expect(window.gitify.onAuthCallback).toHaveBeenCalledTimes(1);
      expect(window.gitify.onAuthCallback).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    describe('exchangeAuthCodeForAccessToken', () => {
      const authCode = '123-456' as AuthCode;

      it('should exchange auth code for access token', async () => {
        exchangeWebFlowCodeMock.mockResolvedValueOnce({
          authentication: {
            token: 'this-is-a-token',
          },
        } as unknown as Awaited<ReturnType<typeof exchangeWebFlowCode>>);

        const res = await authUtils.exchangeAuthCodeForAccessToken(authCode, {
          ...webAuthOptions,
        });

        expect(exchangeWebFlowCodeMock).toHaveBeenCalledWith({
          clientType: 'oauth-app',
          clientId: 'FAKE_CLIENT_ID_123',
          clientSecret: 'FAKE_CLIENT_SECRET_123',
          code: '123-456',
          request: expect.any(Function),
        });
        expect(res).toBe('this-is-a-token');
      });

      it('should throw when client secret is missing', async () => {
        await expect(
          async () =>
            await authUtils.exchangeAuthCodeForAccessToken(authCode, {
              ...webAuthOptions,
              clientSecret: undefined as unknown as ClientSecret,
            }),
        ).rejects.toThrow('clientSecret is required to exchange an auth code');
      });
    });
  });
});
