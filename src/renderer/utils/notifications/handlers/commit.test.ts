import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockRawUser } from '../../api/__mocks__/response-mocks';

import { useFiltersStore } from '../../../stores';

import type { GitifyNotification, Link } from '../../../types';
import type {
  GetCommitCommentResponse,
  GetCommitResponse,
} from '../../api/types';

import * as apiClient from '../../api/client';
import { commitHandler } from './commit';

describe('renderer/utils/notifications/handlers/commit.ts', () => {
  describe('enrich', () => {
    const getCommitSpy = vi.spyOn(apiClient, 'getCommit');
    const getCommitCommentSpy = vi.spyOn(apiClient, 'getCommitComment');

    const mockAuthor = mockRawUser('some-author');
    const mockCommenter = mockRawUser('some-commenter');

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('get commit commenter', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/comments/141012658' as Link,
      });

      getCommitSpy.mockResolvedValue({
        author: mockAuthor,
      } as GetCommitResponse);

      getCommitCommentSpy.mockResolvedValue({
        user: mockCommenter,
      } as GetCommitCommentResponse);

      const result = await commitHandler.enrich(mockNotification);

      expect(result).toEqual({
        state: null,
        user: {
          login: mockCommenter.login,
          htmlUrl: mockCommenter.html_url,
          avatarUrl: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
      });
    });

    it('get commit without commenter', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl: null,
      });

      getCommitSpy.mockResolvedValue({
        author: mockAuthor,
      } as GetCommitResponse);

      const result = await commitHandler.enrich(mockNotification);

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

    it('return early if commit state filtered', async () => {
      useFiltersStore.setState({ states: ['closed'] });

      const mockNotification = mockPartialGitifyNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl: null,
      });

      const result = await commitHandler.enrich(mockNotification);

      // Returns empty object when filtered (no API call made)
      expect(result).toEqual({});
      expect(getCommitSpy).not.toHaveBeenCalled();
    });
  });

  it('iconType', () => {
    const mockNotification = mockPartialGitifyNotification({
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
