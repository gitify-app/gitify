import { vi } from 'vitest';

import {
  createMockResponse,
  fetch,
} from '../../../__mocks__/@tauri-apps/plugin-http';
import { createPartialMockNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import type { GitifyNotification, Link } from '../../../types';
import { commitHandler } from './commit';

describe('renderer/utils/notifications/handlers/commit.ts', () => {
  describe('enrich', () => {
    const mockAuthor = createPartialMockUser('some-author');
    const mockCommenter = createPartialMockUser('some-commenter');

    beforeEach(() => {
      vi.clearAllMocks();
      fetch.mockResolvedValue(createMockResponse({}));
    });

    it('get commit commenter', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/comments/141012658' as Link,
      });

      // First call returns comment data (latestCommentUrl is called first)
      fetch.mockResolvedValueOnce(createMockResponse({ user: mockCommenter }));

      const result = await commitHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        state: undefined,
        user: {
          login: mockCommenter.login,
          htmlUrl: mockCommenter.html_url,
          avatarUrl: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
      });
    });

    it('get commit without commenter', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl: null,
      });

      fetch.mockResolvedValueOnce(createMockResponse({ author: mockAuthor }));

      const result = await commitHandler.enrich(mockNotification, mockSettings);

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

    it('return early if commit state filtered', async () => {
      const mockNotification = createPartialMockNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl: null,
      });

      const result = await commitHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      // Returns empty object when filtered (no API call made)
      expect(result).toBeNull();
    });
  });

  it('iconType', () => {
    const mockNotification = createPartialMockNotification({
      type: 'Commit',
    });

    expect(commitHandler.iconType(mockNotification).displayName).toBe(
      'GitCommitIcon',
    );
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      commitHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(mockHtmlUrl);
  });
});
