import { mockGerritAccount } from '../../../__mocks__/account-mocks';

import type { IGerritResponse } from '../../../../shared/events';

import { useSettingsStore } from '../../../stores';

import type { Hostname } from '../../../types';

import { determineFailureType } from '../../api/errors';
import { getErrorDetails } from '../../core/errors';
import * as comms from '../../system/comms';
import {
  fetchGerritAuthenticatedUser,
  gerritGetJson,
  getGerritApiBaseUrl,
  listGerritChanges,
  removeSelfFromAttentionSet,
  stripGerritXssiPrefix,
} from './client';

describe('renderer/utils/forges/gerrit/client.ts', () => {
  const fetchMock = () => vi.mocked(window.gitify.gerritRequest);

  function xssiResponse<T>(body: T): IGerritResponse {
    return { status: 200, statusText: 'OK', body: `)]}'\n${JSON.stringify(body)}` };
  }

  const noContent: IGerritResponse = { status: 204, statusText: 'No Content', body: '' };

  beforeEach(() => {
    fetchMock().mockReset();
    vi.spyOn(comms, 'decryptValue').mockResolvedValue({ token: 'decrypted' });
  });

  describe('stripGerritXssiPrefix', () => {
    it("strips the leading )]}' magic prefix", () => {
      expect(stripGerritXssiPrefix(")]}'\n[1,2,3]")).toBe('\n[1,2,3]');
    });

    it('leaves text without the prefix untouched', () => {
      expect(stripGerritXssiPrefix('[1,2,3]')).toBe('[1,2,3]');
    });
  });

  describe('getGerritApiBaseUrl', () => {
    it('builds an authenticated https /a/ base', () => {
      const url = getGerritApiBaseUrl('gerrit.example.com' as Hostname);
      expect(url.toString()).toBe('https://gerrit.example.com/a/');
    });

    it('throws for an invalid hostname', () => {
      expect(() => getGerritApiBaseUrl('not a host' as Hostname)).toThrow(/invalid hostname/);
    });
  });

  describe('listGerritChanges', () => {
    it('sends the attention:self query with DETAILED_ACCOUNTS when fetchAllNotifications is false', async () => {
      fetchMock().mockResolvedValueOnce(xssiResponse([{ id: 'proj~1' }]));

      useSettingsStore.setState({ fetchAllNotifications: false });

      const result = await listGerritChanges(mockGerritAccount);

      expect(result).toEqual([{ id: 'proj~1' }]);
      expect(fetchMock()).toHaveBeenCalledTimes(1);
      const calledUrl = fetchMock().mock.calls[0][0].url;
      expect(calledUrl).toContain('https://gerrit.example.com/a/changes/?');
      expect(calledUrl).toContain('q=attention%3Aself');
      expect(calledUrl).toContain('o=DETAILED_ACCOUNTS');
      expect(calledUrl).not.toContain('S=');
    });

    it('paginates using S/_more_changes until a page reports no more results', async () => {
      const fullPage = Array.from({ length: 1 }, (_, i) => ({
        id: `proj~${i}`,
        _more_changes: true,
      }));

      fetchMock()
        .mockResolvedValueOnce(xssiResponse(fullPage))
        .mockResolvedValueOnce(xssiResponse([{ id: 'proj~last' }]));

      useSettingsStore.setState({ fetchAllNotifications: true });

      const result = await listGerritChanges(mockGerritAccount);

      expect(result).toHaveLength(2);
      expect(fetchMock()).toHaveBeenCalledTimes(2);
      const secondUrl = fetchMock().mock.calls[1][0].url;
      expect(secondUrl).toContain('S=1');
    });

    it('stops pagination immediately on an empty page', async () => {
      fetchMock().mockResolvedValueOnce(xssiResponse([]));

      useSettingsStore.setState({ fetchAllNotifications: true });

      const result = await listGerritChanges(mockGerritAccount);

      expect(result).toEqual([]);
      expect(fetchMock()).toHaveBeenCalledTimes(1);
    });

    it('throws on a non-ok status without echoing the response body', async () => {
      fetchMock().mockResolvedValue({
        status: 403,
        statusText: 'Forbidden',
        body: 'Authorization: Basic leaked-credentials',
      });

      useSettingsStore.setState({ fetchAllNotifications: false });

      await expect(listGerritChanges(mockGerritAccount)).rejects.toThrow(
        /^Gerrit API 403 Forbidden$/,
      );
    });

    it('reports a 401 as bad credentials so the UI offers re-authentication', async () => {
      fetchMock().mockResolvedValue({ status: 401, statusText: 'Unauthorized', body: '' });

      useSettingsStore.setState({ fetchAllNotifications: false });

      const err = await listGerritChanges(mockGerritAccount).catch((e: Error) => e);
      expect(determineFailureType(err as Error)).toEqual(getErrorDetails('BAD_CREDENTIALS'));
    });
  });

  describe('fetchGerritAuthenticatedUser', () => {
    it('fetches the account and server version in parallel', async () => {
      fetchMock()
        .mockResolvedValueOnce(xssiResponse({ _account_id: 7, username: 'jdoe' }))
        .mockResolvedValueOnce(xssiResponse({ gerrit_version: '3.13.2' }));

      const result = await fetchGerritAuthenticatedUser(mockGerritAccount);

      expect(result.account).toEqual({ _account_id: 7, username: 'jdoe' });
      expect(result.version).toBe('3.13.2');
    });

    it('accepts a plain string version response (non-verbose)', async () => {
      fetchMock()
        .mockResolvedValueOnce(xssiResponse({ _account_id: 7 }))
        .mockResolvedValueOnce(xssiResponse('3.9.0'));

      const result = await fetchGerritAuthenticatedUser(mockGerritAccount);

      expect(result.version).toBe('3.9.0');
    });

    it('resolves version as undefined rather than throwing when the endpoint is unreachable', async () => {
      fetchMock()
        .mockResolvedValueOnce(xssiResponse({ _account_id: 7 }))
        .mockResolvedValueOnce({ status: 403, statusText: 'Forbidden', body: 'nope' });

      const result = await fetchGerritAuthenticatedUser(mockGerritAccount);

      expect(result.version).toBeUndefined();
    });
  });

  describe('removeSelfFromAttentionSet', () => {
    it('POSTs to the attention/self/delete alias with a reason body', async () => {
      fetchMock().mockResolvedValueOnce(noContent);

      await removeSelfFromAttentionSet(mockGerritAccount, 'proj~42', 'Marked as read via Gitify');

      const [{ url, method, body }] = fetchMock().mock.calls[0];
      expect(url).toContain('/a/changes/proj~42/attention/self/delete');
      expect(method).toBe('POST');
      expect(body).toBe(JSON.stringify({ reason: 'Marked as read via Gitify' }));
    });

    it('does not re-encode a changeId whose project segment is already URL-encoded by Gerrit (regression: double-encoding 404)', async () => {
      fetchMock().mockResolvedValueOnce(noContent);

      // Gerrit's own ChangeInfo.id for a nested project (e.g. "modules/cache-infinispan")
      // already comes back with the project segment percent-encoded.
      const nestedProjectChangeId = 'modules%2Fcache-infinispan~593701';

      await removeSelfFromAttentionSet(mockGerritAccount, nestedProjectChangeId, 'reason');

      const [{ url }] = fetchMock().mock.calls[0];
      // Must appear verbatim — re-encoding would turn the existing `%2F`
      // into `%252F`, which Gerrit cannot resolve back to a project name.
      expect(url).toContain('/a/changes/modules%2Fcache-infinispan~593701/attention/self/delete');
      expect(url).not.toContain('%252F');
    });
  });

  describe('gerritGetJson', () => {
    it('GETs the supplied URL with Basic auth headers and strips the XSSI prefix', async () => {
      fetchMock().mockResolvedValueOnce(xssiResponse({ subject: 'x' }));

      const result = await gerritGetJson<{ subject: string }>(
        mockGerritAccount,
        'https://gerrit.example.com/a/changes/proj~1',
      );

      expect(result).toEqual({ subject: 'x' });
      expect(fetchMock().mock.calls[0][0].authorization).toBe(`Basic ${btoa('jdoe:decrypted')}`);
    });

    it('refuses cross-origin URLs without sending a request', async () => {
      await expect(
        gerritGetJson(mockGerritAccount, 'https://attacker.com/a/changes/proj~1'),
      ).rejects.toThrow(/cross-origin Gerrit URL/);
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('refuses malformed URLs without sending a request', async () => {
      await expect(gerritGetJson(mockGerritAccount, 'not-a-url')).rejects.toThrow(
        /malformed Gerrit URL/,
      );
      expect(fetchMock()).not.toHaveBeenCalled();
    });

    it('throws on a non-ok response without echoing the body', async () => {
      fetchMock().mockResolvedValueOnce({
        status: 500,
        statusText: 'Server Error',
        body: 'echoed Authorization header',
      });

      await expect(
        gerritGetJson(mockGerritAccount, 'https://gerrit.example.com/a/changes/proj~1'),
      ).rejects.toThrow(/^Gerrit API 500 Server Error$/);
    });
  });
});
