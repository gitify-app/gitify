import { vi } from 'vitest';

import {
  createMockResponse,
  fetch,
} from '../../../__mocks__/@tauri-apps/plugin-http';
import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { mockRawUser } from '../../api/__mocks__/response-mocks';

import type { GitifyNotification, Link } from '../../../types';

import { releaseHandler } from './release';

describe('renderer/utils/notifications/handlers/release.ts', () => {
  describe('enrich', () => {
    const mockAuthor = mockRawUser('some-author');

    beforeEach(() => {
      vi.clearAllMocks();
      fetch.mockResolvedValue(createMockResponse({}));
    });

    it('release notification', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      fetch.mockResolvedValueOnce(createMockResponse({ author: mockAuthor }));

      const result = await releaseHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        state: undefined,
        user: {
          login: mockAuthor.login,
          htmlUrl: mockAuthor.html_url,
          avatarUrl: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
      });
    });

    it('return early if release state filtered', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'This is a mock release',
        type: 'Release',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/releases/1' as Link,
      });

      const result = await releaseHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      // Returns empty object when filtered (no API call made)
      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({
      type: 'Release',
    });

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
