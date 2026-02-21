import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockRawUser } from '../../api/__mocks__/response-mocks';

import { useFiltersStore } from '../../../stores';

import type { GitifyNotification, Link } from '../../../types';
import type { GetReleaseResponse } from '../../api/types';

import * as apiClient from '../../api/client';
import { releaseHandler } from './release';

describe('renderer/utils/notifications/handlers/release.ts', () => {
  const mockNotification = mockPartialGitifyNotification({
    title: 'This is a mock release',
    type: 'Release',
    url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
    latestCommentUrl:
      'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
  });

  describe('enrich', () => {
    const getReleaseSpy = vi.spyOn(apiClient, 'getRelease');

    const mockAuthor = mockRawUser('some-author');

    it('release notification', async () => {
      getReleaseSpy.mockResolvedValue({
        author: mockAuthor,
      } as GetReleaseResponse);

      const result = await releaseHandler.enrich(mockNotification);

      expect(result).toEqual({
        state: null,
        user: {
          login: mockAuthor.login,
          htmlUrl: mockAuthor.html_url,
          avatarUrl: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
      });
    });

    it('return early if release state filtered', async () => {
      useFiltersStore.setState({ states: ['closed'] });

      const result = await releaseHandler.enrich(mockNotification);

      // Returns empty object when filtered (no API call made)
      expect(result).toEqual({});
    });
  });

  it('iconType', () => {
    expect(releaseHandler.iconType(mockNotification).displayName).toBe(
      'TagIcon',
    );
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      releaseHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/releases`);
  });
});
