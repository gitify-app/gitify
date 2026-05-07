import { mockGiteaAccount } from '../../../__mocks__/account-mocks';

import type { Hostname, SettingsState } from '../../../types';

import * as comms from '../../system/comms';
import {
  fetchGiteaAuthenticatedUser,
  getGiteaApiBaseUrl,
  giteaGetJson,
  listGiteaNotifications,
  patchGiteaNotificationThread,
} from './client';

describe('renderer/utils/forges/gitea/client.ts', () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');

  beforeEach(() => {
    fetchSpy.mockReset();
    vi.spyOn(comms, 'decryptValue').mockResolvedValue({ token: 'decrypted' });
  });

  function jsonResponse<T>(body: T, init: ResponseInit = { status: 200 }) {
    return new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
      ...init,
    });
  }

  describe('getGiteaApiBaseUrl', () => {
    it('builds https api v1 base', () => {
      const url = getGiteaApiBaseUrl('gitea.example.com' as Hostname);
      expect(url.toString()).toBe('https://gitea.example.com/api/v1/');
    });
  });

  describe('listGiteaNotifications', () => {
    it('fetches a single page when fetchAllNotifications is false', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([{ id: 1 }]));

      const result = await listGiteaNotifications(mockGiteaAccount, {
        fetchAllNotifications: false,
        fetchReadNotifications: false,
      } as SettingsState);

      expect(result).toEqual([{ id: 1 }]);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://gitea.example.com/api/v1/');
      expect(calledUrl).toContain('status-types=unread');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).not.toContain('status-types=read');
    });

    it('includes read status when fetchReadNotifications is true', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse([]));

      await listGiteaNotifications(mockGiteaAccount, {
        fetchAllNotifications: false,
        fetchReadNotifications: true,
      } as SettingsState);

      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('status-types=unread');
      expect(calledUrl).toContain('status-types=read');
    });

    it('paginates until an empty page is returned', async () => {
      fetchSpy
        .mockResolvedValueOnce(
          jsonResponse(Array.from({ length: 100 }, (_, i) => ({ id: i }))),
        )
        .mockResolvedValueOnce(jsonResponse([{ id: 100 }]))
        .mockResolvedValueOnce(jsonResponse([]));

      const result = await listGiteaNotifications(mockGiteaAccount, {
        fetchAllNotifications: true,
        fetchReadNotifications: false,
      } as SettingsState);

      expect(result).toHaveLength(101);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });

    it('throws when the API responds with a non-ok status', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('forbidden', { status: 403, statusText: 'Forbidden' }),
      );

      await expect(
        listGiteaNotifications(mockGiteaAccount, {
          fetchAllNotifications: false,
          fetchReadNotifications: false,
        } as SettingsState),
      ).rejects.toThrow(/Gitea API 403 Forbidden: forbidden/);
    });
  });

  describe('fetchGiteaAuthenticatedUser', () => {
    it('returns the user payload', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ id: 7, login: 'octocat' }));

      const result = await fetchGiteaAuthenticatedUser(mockGiteaAccount);

      expect(result).toEqual({ id: 7, login: 'octocat' });
      expect(fetchSpy.mock.calls[0][0]).toContain('/api/v1/user');
    });
  });

  describe('patchGiteaNotificationThread', () => {
    it('sends a PATCH with to-status query and resolves on 204', async () => {
      fetchSpy.mockResolvedValueOnce(new Response(null, { status: 204 }));

      await patchGiteaNotificationThread(mockGiteaAccount, '42', 'read');

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toContain('/notifications/threads/42?to-status=read');
      expect((init as RequestInit).method).toBe('PATCH');
    });
  });

  describe('giteaGetJson', () => {
    it('GETs the supplied URL with auth headers and parses JSON', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse({ html_url: 'x' }));

      const result = await giteaGetJson<{ html_url: string }>(
        mockGiteaAccount,
        'https://gitea.example.com/api/v1/repos/o/r/issues/1',
      );

      expect(result).toEqual({ html_url: 'x' });
      const headers = (fetchSpy.mock.calls[0][1] as RequestInit)
        .headers as Record<string, string>;
      expect(headers.Authorization).toBe('token decrypted');
    });

    it('throws on a non-ok response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('nope', { status: 500, statusText: 'Server Error' }),
      );

      await expect(
        giteaGetJson(mockGiteaAccount, 'https://gitea.example.com/x'),
      ).rejects.toThrow(/Gitea API 500 Server Error: nope/);
    });
  });
});
