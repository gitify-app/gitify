import nock from 'nock';

import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { mockRawUser } from '../../api/__mocks__/response-mocks';

import type { GitifyNotification, Link } from '../../../types';
import type {
  GetCommitCommentResponse,
  GetCommitResponse,
} from '../../api/types';

import { commitHandler } from './commit';

describe('renderer/utils/notifications/handlers/commit.ts', () => {
  describe('enrich', () => {
    const mockAuthor = mockRawUser('some-author');
    const mockCommenter = mockRawUser('some-commenter');

    it('get commit commenter', async () => {
      const mockNotification = mockPartialGitifyNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/comments/141012658' as Link,
      });

      nock('https://api.github.com')
        .get(
          '/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8',
        )
        .reply(200, { author: mockAuthor });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/comments/141012658')
        .reply(200, {
          user: mockCommenter,
        } satisfies Partial<GetCommitCommentResponse>);

      const result = await commitHandler.enrich(mockNotification, mockSettings);

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

      nock('https://api.github.com')
        .get(
          '/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8',
        )
        .reply(200, {
          author: mockAuthor,
        } satisfies Partial<GetCommitResponse>);

      const result = await commitHandler.enrich(mockNotification, mockSettings);

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
      const mockNotification = mockPartialGitifyNotification({
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
      expect(result).toEqual({});
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
