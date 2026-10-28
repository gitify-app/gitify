// Use a hoist-safe mock factory for '@octokit/oauth-methods'
vi.mock('@octokit/oauth-methods', async () => {
  const actual =
    await vi.importActual<typeof import('@octokit/oauth-methods')>('@octokit/oauth-methods');
  return {
    ...actual,
    createDeviceCode: vi.fn(),
    exchangeDeviceCode: vi.fn(),
  };
});

import { createDeviceCode, exchangeDeviceCode } from '@octokit/oauth-methods';
import { RequestError } from '@octokit/request-error';

import type { MockedFunction } from 'vite-plus/test';

import { Constants } from '../../../constants';

import type { ClientID, Hostname } from '../../../types';
import type { DeviceFlowSession } from '../../auth/types';

import { getRecommendedScopeNames } from '../../auth/scopeNames';
import * as logger from '../../core/logger';
import * as flows from './flows';

const createDeviceCodeMock = createDeviceCode as unknown as MockedFunction<typeof createDeviceCode>;

const exchangeDeviceCodeMock = exchangeDeviceCode as unknown as MockedFunction<
  typeof exchangeDeviceCode
>;

describe('renderer/utils/forges/github/flows.ts', () => {
  const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());

  beforeEach(() => {
    // Mock OAUTH_DEVICE_FLOW_CLIENT_ID value
    Constants.OAUTH_DEVICE_FLOW_CLIENT_ID = 'FAKE_CLIENT_ID_123' as ClientID;
  });

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

      const session = await flows.startGitHubDeviceFlow();

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

    it('authorizes a supplied custom OAuth app client ID', async () => {
      createDeviceCodeMock.mockResolvedValueOnce({
        data: {
          device_code: 'device-code-xyz',
          user_code: 'user-code-xyz',
          verification_uri: 'https://github.example.com/login/device',
          expires_in: 600,
          interval: 5,
        },
      } as unknown as Awaited<ReturnType<typeof createDeviceCode>>);

      const session = await flows.startGitHubDeviceFlow(
        'github.example.com' as Hostname,
        getRecommendedScopeNames(),
        'CUSTOM_CLIENT_ID_123' as ClientID,
      );

      expect(createDeviceCodeMock).toHaveBeenCalledWith({
        clientType: 'oauth-app',
        clientId: 'CUSTOM_CLIENT_ID_123',
        scopes: getRecommendedScopeNames(),
        request: expect.any(Function),
      });
      expect(session.clientId).toBe('CUSTOM_CLIENT_ID_123');
      expect(session.hostname).toBe('github.example.com');
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

      const token = await flows.pollGitHubDeviceFlow(baseSession as DeviceFlowSession);

      expect(exchangeDeviceCodeMock).toHaveBeenCalledWith({
        clientType: 'oauth-app',
        clientId: 'FAKE_CLIENT_ID_123',
        code: 'device-code',
        request: expect.any(Function),
      });

      expect(token).toBe('device-token-xyz');
    });

    it("uses the session's own client ID when polling a custom app", async () => {
      exchangeDeviceCodeMock.mockResolvedValueOnce({
        authentication: { token: 'custom-token' },
      } as unknown as Awaited<ReturnType<typeof exchangeDeviceCode>>);

      const token = await flows.pollGitHubDeviceFlow({
        ...baseSession,
        clientId: 'CUSTOM_CLIENT_ID_123',
      } as DeviceFlowSession);

      expect(exchangeDeviceCodeMock).toHaveBeenCalledWith({
        clientType: 'oauth-app',
        clientId: 'CUSTOM_CLIENT_ID_123',
        code: 'device-code',
        request: expect.any(Function),
      });
      expect(token).toBe('custom-token');
    });

    it('returns null and does not change interval when authorization is pending', async () => {
      const pendingErr = Object.create(RequestError.prototype);
      pendingErr.response = { data: { error: 'authorization_pending' } };

      exchangeDeviceCodeMock.mockRejectedValueOnce(pendingErr);

      const session = { ...baseSession } as DeviceFlowSession;
      const token = await flows.pollGitHubDeviceFlow(session);

      expect(token).toBeNull();
      expect(session.intervalSeconds).toBe(5);
    });

    it('returns null and increases interval by 5 when slow_down', async () => {
      const slowDownErr = Object.create(RequestError.prototype);
      slowDownErr.response = { data: { error: 'slow_down' } };

      exchangeDeviceCodeMock.mockRejectedValueOnce(slowDownErr);

      const session = { ...baseSession } as DeviceFlowSession;
      const token = await flows.pollGitHubDeviceFlow(session);

      expect(token).toBeNull();
      expect(session.intervalSeconds).toBe(10);
    });

    it('throws on other errors', async () => {
      const otherErr = new Error('boom');

      exchangeDeviceCodeMock.mockRejectedValueOnce(otherErr);

      await expect(
        async () => await flows.pollGitHubDeviceFlow(baseSession as DeviceFlowSession),
      ).rejects.toThrow('boom');
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('describeDeviceFlowStartError', () => {
    it('explains how to enable device flow for a custom app', () => {
      const err = Object.create(RequestError.prototype);
      err.response = { data: { error: 'device_flow_disabled' } };

      const message = flows.describeDeviceFlowStartError(
        err,
        'github.example.com' as Hostname,
        'CUSTOM_CLIENT_ID_123' as ClientID,
      );

      expect(message).toContain('Device flow is not enabled');
      expect(message).toContain('https://github.example.com/settings/developers');
    });

    it('names an unrecognized client ID as invalid for the host', () => {
      const err = Object.create(RequestError.prototype);
      err.response = { data: { error: 'incorrect_client_credentials' } };

      expect(
        flows.describeDeviceFlowStartError(
          err,
          'github.example.com' as Hostname,
          'CUSTOM_CLIENT_ID_123' as ClientID,
        ),
      ).toBe('The client ID is not valid for github.example.com. Check it and try again.');
    });

    it('returns undefined for a non-RequestError', () => {
      expect(
        flows.describeDeviceFlowStartError(new Error('boom'), 'github.com' as Hostname),
      ).toBeUndefined();
    });
  });
});
