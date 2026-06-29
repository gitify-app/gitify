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
  const fetchMock = () => vi.mocked(globalThis.fetch);

  function jsonResponse<T>(body: T, init: ResponseInit = { status: 200 }) {
    return new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
      ...init,
    });
  }

  beforeEach(() => {
    fetchMock().mockReset();
    vi.spyOn(comms, 'decryptValue').mockResolvedValue({ token: 'decrypted' });
  });

  describe('getGiteaApiBaseUrl', () => {
    it('builds https api v1 base', () => {
      const url = getGiteaApiBaseUrl('gitea.example.com' as Hostname);
      expect(url.toString()).toBe('https://gitea.example.com/api/v1/');
    });
  });

  describe('listGiteaNotifications', () => {
    it('fetches a single page when fetchAllNotifications is false', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse([{ id: 1 }]));

      const result = await listGiteaNotifications(mockGiteaAccount, {
        fetchAllNotifications: false,
        fetchReadNotifications: false,
      } as SettingsState);

      expect(result).toEqual([{ id: 1 }]);
      expect(fetchMock()).toHaveBeenCalledTimes(1);
      const calledUrl = fetchMock().mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://gitea.example.com/api/v1/');
      expect(calledUrl).toContain('status-types=unread');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).not.toContain('status-types=read');
    });

    it('includes read status when fetchReadNotifications is true', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse([]));

      await listGiteaNotifications(mockGiteaAccount, {
        fetchAllNotifications: false,
        fetchReadNotifications: true,
      } as SettingsState);

      const calledUrl = fetchMock().mock.calls[0][0] as string;
      expect(calledUrl).toContain('status-types=unread');
      expect(calledUrl).toContain('status-types=read');
    });

    it('paginates until an empty page is returned', async () => {
      fetchMock()
        .mockResolvedValueOnce(jsonResponse(Array.from({ length: 100 }, (_, i) => ({ id: i }))))
        .mockResolvedValueOnce(jsonResponse([{ id: 100 }]))
        .mockResolvedValueOnce(jsonResponse([]));

      const result = await listGiteaNotifications(mockGiteaAccount, {
        fetchAllNotifications: true,
        fetchReadNotifications: false,
      } as SettingsState);

      expect(result).toHaveLength(101);
      expect(fetchMock()).toHaveBeenCalledTimes(2);
    });

    it('throws on a non-ok status without echoing the response body', async () => {
      fetchMock().mockResolvedValue(
        new Response('Authorization: token leaked-pat', {
          status: 403,
          statusText: 'Forbidden',
        }),
      );

      await expect(
        listGiteaNotifications(mockGiteaAccount, {
          fetchAllNotifications: false,
          fetchReadNotifications: false,
        } as SettingsState),
      ).rejects.toThrow(/^Gitea API 403 Forbidden$/);
      // The thrown error must not include the response body — a hostile
      // server could echo back the Authorization header into logs.
      await expect(
        listGiteaNotifications(mockGiteaAccount, {
          fetchAllNotifications: false,
          fetchReadNotifications: false,
        } as SettingsState),
      ).rejects.toThrow();
    });
  });

  describe('fetchGiteaAuthenticatedUser', () => {
    it('returns the user payload', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ id: 7, login: 'octocat' }));

      const result = await fetchGiteaAuthenticatedUser(mockGiteaAccount);

      expect(result).toEqual({ id: 7, login: 'octocat' });
      expect(fetchMock().mock.calls[0][0]).toContain('/api/v1/user');
    });
  });

  describe('patchGiteaNotificationThread', () => {
    it('sends a PATCH with to-status query and resolves on 204', async () => {
      fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));

      await patchGiteaNotificationThread(mockGiteaAccount, '42', 'read');

      const [url, init] = fetchMock().mock.calls[0];
      expect(url).toContain('/notifications/threads/42?to-status=read');
      expect((init as RequestInit).method).toBe('PATCH');
    });
  });

  describe('giteaGetJson', () => {
    it('GETs the supplied URL with auth headers and parses JSON', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ html_url: 'x' }));

      const result = await giteaGetJson<{ html_url: string }>(
        mockGiteaAccount,
        'https://gitea.example.com/api/v1/repos/o/r/issues/1',
      );

      expect(result).toEqual({ html_url: 'x' });
      const headers = (fetchMock().mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(headers.Authorization).toBe('token decrypted');
    });

    it('throws on a non-ok response without echoing the body', async () => {
      fetchMock().mockResolvedValueOnce(
        new Response('echoed Authorization: token leaked-pat', {
          status: 500,
          statusText: 'Server Error',
        }),
      );

      await expect(
        giteaGetJson(mockGiteaAccount, 'https://gitea.example.com/api/v1/x'),
      ).rejects.toThrow(/^Gitea API 500 Server Error$/);
    });

    it('refuses cross-origin URLs without sending a request', async () => {
      await expect(giteaGetJson(mockGiteaAccount, 'https://attacker.com/api/v1/x')).rejects.toThrow(
        /cross-origin Gitea URL/,
      );
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('refuses non-https URLs without sending a request', async () => {
      await expect(giteaGetJson(mockGiteaAccount, 'http://gitea.example.com/x')).rejects.toThrow(
        /cross-origin Gitea URL/,
      );
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('refuses malformed URLs without sending a request', async () => {
      await expect(giteaGetJson(mockGiteaAccount, 'not-a-url')).rejects.toThrow(
        /malformed Gitea URL/,
      );
      expect(fetchMock()).not.toHaveBeenCalled();
    });
  });
});
