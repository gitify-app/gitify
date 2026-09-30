import { mockGiteaAccount } from '../../../__mocks__/account-mocks';

import { useSettingsStore } from '../../../stores';

import type { Hostname } from '../../../types';

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

    it.each([
      ['gitea.example.com:3000', 'https://gitea.example.com:3000/api/v1/'],
      ['gitea.example.com:443', 'https://gitea.example.com/api/v1/'],
      ['GITEA.example.com:03000', 'https://gitea.example.com:3000/api/v1/'],
      ['gitea.example.com:1', 'https://gitea.example.com:1/api/v1/'],
      ['gitea.example.com:65535', 'https://gitea.example.com:65535/api/v1/'],
    ])('builds the HTTPS API base for %s', (hostname, expected) => {
      expect(getGiteaApiBaseUrl(hostname as Hostname).toString()).toBe(expected);
    });

    it.each([
      'gitea.example.com:',
      'gitea.example.com:0',
      'gitea.example.com:65536',
      'gitea.example.com:-1',
      'gitea.example.com:3.5',
      'gitea.example.com:https',
      'gitea.example.com:3000:4000',
      'https://gitea.example.com:3000',
      'http://gitea.example.com:3000',
      'user@gitea.example.com:3000',
      'gitea.example.com:3000/path',
      'gitea.example.com:3000?query',
      'gitea.example.com:3000#fragment',
      'gitea.example.com:3000\n',
      'gitea.example.com\n',
      ' gitea.example.com:3000',
      'gitea.example.com: 3000',
      'localhost:3000',
      '127.0.0.1:3000',
      '[::1]:3000',
    ])('rejects invalid hostname %j', (hostname) => {
      expect(() => getGiteaApiBaseUrl(hostname as Hostname)).toThrow(/invalid hostname/);
    });
  });

  describe('listGiteaNotifications', () => {
    it('fetches a single page when fetchAllNotifications is false', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse([{ id: 1 }]));

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: false });

      const result = await listGiteaNotifications(mockGiteaAccount);

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

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: true });

      await listGiteaNotifications(mockGiteaAccount);

      const calledUrl = fetchMock().mock.calls[0][0] as string;
      expect(calledUrl).toContain('status-types=unread');
      expect(calledUrl).toContain('status-types=read');
    });

    it('paginates until an empty page is returned', async () => {
      fetchMock()
        .mockResolvedValueOnce(jsonResponse(Array.from({ length: 100 }, (_, i) => ({ id: i }))))
        .mockResolvedValueOnce(jsonResponse([{ id: 100 }]))
        .mockResolvedValueOnce(jsonResponse([]));

      useSettingsStore.setState({ fetchAllNotifications: true, fetchReadNotifications: false });

      const result = await listGiteaNotifications(mockGiteaAccount);

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

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: false });

      await expect(listGiteaNotifications(mockGiteaAccount)).rejects.toThrow(
        /^Gitea API 403 Forbidden$/,
      );
      // The thrown error must not include the response body — a hostile
      // server could echo back the Authorization header into logs.
      await expect(listGiteaNotifications(mockGiteaAccount)).rejects.toThrow();
    });
  });

  describe('fetchGiteaAuthenticatedUser', () => {
    it('sends the token to the configured HTTPS port', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ id: 7, login: 'octocat' }));

      await fetchGiteaAuthenticatedUser({
        ...mockGiteaAccount,
        hostname: 'gitea.example.com:3000' as Hostname,
      });

      expect(fetchMock()).toHaveBeenCalledWith('https://gitea.example.com:3000/api/v1/user', {
        headers: { Accept: 'application/json', Authorization: 'token decrypted' },
      });
    });

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
    it.each([
      ['gitea.example.com:3000', 'https://gitea.example.com:3000/api/v1/x'],
      ['gitea.example.com:443', 'https://gitea.example.com/api/v1/x'],
    ])('follows URLs on the configured origin for %s', async (hostname, url) => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ id: 1 }));

      await expect(
        giteaGetJson({ ...mockGiteaAccount, hostname: hostname as Hostname }, url),
      ).resolves.toEqual({ id: 1 });
      expect(fetchMock()).toHaveBeenCalledWith(url, {
        headers: { Accept: 'application/json', Authorization: 'token decrypted' },
      });
    });

    it.each([
      ['gitea.example.com:3000', 'https://gitea.example.com:4000/api/v1/x'],
      ['gitea.example.com:3000', 'https://gitea.example.com/api/v1/x'],
      ['gitea.example.com', 'https://gitea.example.com:3000/api/v1/x'],
      ['gitea.example.com:3000', 'http://gitea.example.com:3000/api/v1/x'],
    ])('refuses to send the token from %s to %s', async (hostname, url) => {
      await expect(
        giteaGetJson({ ...mockGiteaAccount, hostname: hostname as Hostname }, url),
      ).rejects.toThrow(/cross-origin Gitea URL/);
      expect(fetchMock()).not.toHaveBeenCalled();
      expect(comms.decryptValue).not.toHaveBeenCalled();
    });

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
