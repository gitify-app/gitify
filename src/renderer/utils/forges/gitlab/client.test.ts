import { mockGitLabAccount } from '../../../__mocks__/account-mocks';

import { useSettingsStore } from '../../../stores';

import type { Hostname } from '../../../types';

import * as comms from '../../system/comms';
import {
  fetchGitLabAuthenticatedUser,
  fetchGitLabTokenMetadata,
  fetchGitLabVersion,
  getGitLabApiBaseUrl,
  gitlabGetJson,
  listGitLabTodos,
  markGitLabTodoAsDone,
} from './client';

describe('renderer/utils/forges/gitlab/client.ts', () => {
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

  describe('getGitLabApiBaseUrl', () => {
    it('builds https api v4 base', () => {
      const url = getGitLabApiBaseUrl('gitlab.com' as Hostname);
      expect(url.toString()).toBe('https://gitlab.com/api/v4/');
    });

    it('refuses invalid hostnames', () => {
      expect(() => getGitLabApiBaseUrl('not a hostname' as Hostname)).toThrow(/invalid hostname/);
    });
  });

  describe('listGitLabTodos', () => {
    it('fetches a single pending page when fetchAllNotifications is false', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse([{ id: 1 }]));

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: false });

      const result = await listGitLabTodos(mockGitLabAccount);

      expect(result).toEqual([{ id: 1 }]);
      expect(fetchMock()).toHaveBeenCalledTimes(1);
      const calledUrl = fetchMock().mock.calls[0][0] as string;
      expect(calledUrl).toContain('https://gitlab.com/api/v4/todos');
      expect(calledUrl).toContain('state=pending');
      expect(calledUrl).toContain('page=1');
    });

    it('sends the token as a PRIVATE-TOKEN header', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse([]));
      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: false });

      await listGitLabTodos(mockGitLabAccount);

      const headers = (fetchMock().mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(headers['PRIVATE-TOKEN']).toBe('decrypted');
    });

    it('makes a second request for done items when fetchReadNotifications is true', async () => {
      fetchMock()
        .mockResolvedValueOnce(jsonResponse([{ id: 1 }]))
        .mockResolvedValueOnce(jsonResponse([{ id: 2 }]));

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: true });

      const result = await listGitLabTodos(mockGitLabAccount);

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
      expect(fetchMock()).toHaveBeenCalledTimes(2);
      expect(fetchMock().mock.calls[0][0]).toContain('state=pending');
      expect(fetchMock().mock.calls[1][0]).toContain('state=done');
    });

    it('paginates until a short page is returned', async () => {
      fetchMock()
        .mockResolvedValueOnce(jsonResponse(Array.from({ length: 100 }, (_, i) => ({ id: i }))))
        .mockResolvedValueOnce(jsonResponse([{ id: 100 }]));

      useSettingsStore.setState({ fetchAllNotifications: true, fetchReadNotifications: false });

      const result = await listGitLabTodos(mockGitLabAccount);

      expect(result).toHaveLength(101);
      expect(fetchMock()).toHaveBeenCalledTimes(2);
    });

    it('stops paginating on an empty page', async () => {
      fetchMock()
        .mockResolvedValueOnce(jsonResponse(Array.from({ length: 100 }, (_, i) => ({ id: i }))))
        .mockResolvedValueOnce(jsonResponse([]));

      useSettingsStore.setState({ fetchAllNotifications: true, fetchReadNotifications: false });

      const result = await listGitLabTodos(mockGitLabAccount);

      expect(result).toHaveLength(100);
      expect(fetchMock()).toHaveBeenCalledTimes(2);
    });

    it('stops after the page cap rather than walking an unbounded done list', async () => {
      // GitLab never expires completed to-do items, so the walk must be bounded.
      // A fresh Response per call: a body can only be consumed once.
      const fullPage = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      fetchMock().mockImplementation(() => Promise.resolve(jsonResponse(fullPage)));

      useSettingsStore.setState({ fetchAllNotifications: true, fetchReadNotifications: false });

      const result = await listGitLabTodos(mockGitLabAccount);

      expect(fetchMock()).toHaveBeenCalledTimes(10);
      expect(result).toHaveLength(1000);
    });

    it('throws on a non-ok status without echoing the response body', async () => {
      fetchMock().mockResolvedValue(
        new Response('PRIVATE-TOKEN: leaked-pat', {
          status: 403,
          statusText: 'Forbidden',
        }),
      );

      useSettingsStore.setState({ fetchAllNotifications: false, fetchReadNotifications: false });

      await expect(listGitLabTodos(mockGitLabAccount)).rejects.toThrow(
        /^GitLab API 403 Forbidden$/,
      );
    });
  });

  describe('fetchGitLabAuthenticatedUser', () => {
    it('returns the user payload', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ id: 7, username: 'octocat' }));

      const result = await fetchGitLabAuthenticatedUser(mockGitLabAccount);

      expect(result).toEqual({ id: 7, username: 'octocat' });
      expect(fetchMock().mock.calls[0][0]).toContain('/api/v4/user');
    });
  });

  describe('fetchGitLabVersion', () => {
    it('returns the instance version', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ version: '19.4.0', revision: 'abc' }));

      const result = await fetchGitLabVersion(mockGitLabAccount);

      expect(result.version).toBe('19.4.0');
      expect(fetchMock().mock.calls[0][0]).toContain('/api/v4/version');
    });
  });

  describe('fetchGitLabTokenMetadata', () => {
    it('returns the token scopes', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ id: 1, scopes: ['api'], active: true }));

      const result = await fetchGitLabTokenMetadata(mockGitLabAccount);

      expect(result.scopes).toEqual(['api']);
      expect(fetchMock().mock.calls[0][0]).toContain('/api/v4/personal_access_tokens/self');
    });
  });

  describe('markGitLabTodoAsDone', () => {
    it('POSTs to mark_as_done and resolves on 204', async () => {
      fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));

      await markGitLabTodoAsDone(mockGitLabAccount, '42');

      const [url, init] = fetchMock().mock.calls[0];
      expect(url).toContain('/todos/42/mark_as_done');
      expect((init as RequestInit).method).toBe('POST');
    });
  });

  describe('gitlabGetJson', () => {
    it('GETs the supplied URL with auth headers and parses JSON', async () => {
      fetchMock().mockResolvedValueOnce(jsonResponse({ web_url: 'x' }));

      const result = await gitlabGetJson<{ web_url: string }>(
        mockGitLabAccount,
        'https://gitlab.com/api/v4/projects/1/issues/1',
      );

      expect(result).toEqual({ web_url: 'x' });
      const headers = (fetchMock().mock.calls[0][1] as RequestInit).headers as Record<
        string,
        string
      >;
      expect(headers['PRIVATE-TOKEN']).toBe('decrypted');
    });

    it('throws on a non-ok response without echoing the body', async () => {
      fetchMock().mockResolvedValueOnce(
        new Response('echoed PRIVATE-TOKEN: leaked-pat', {
          status: 500,
          statusText: 'Server Error',
        }),
      );

      await expect(gitlabGetJson(mockGitLabAccount, 'https://gitlab.com/api/v4/x')).rejects.toThrow(
        /^GitLab API 500 Server Error$/,
      );
    });

    it('refuses cross-origin URLs without sending a request', async () => {
      await expect(
        gitlabGetJson(mockGitLabAccount, 'https://attacker.com/api/v4/x'),
      ).rejects.toThrow(/cross-origin GitLab URL/);
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('refuses non-https URLs without sending a request', async () => {
      await expect(gitlabGetJson(mockGitLabAccount, 'http://gitlab.com/x')).rejects.toThrow(
        /cross-origin GitLab URL/,
      );
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('refuses malformed URLs without sending a request', async () => {
      await expect(gitlabGetJson(mockGitLabAccount, 'not-a-url')).rejects.toThrow(
        /malformed GitLab URL/,
      );
      expect(fetchMock()).not.toHaveBeenCalled();
    });
  });
});
