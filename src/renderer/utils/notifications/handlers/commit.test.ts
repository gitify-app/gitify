import axios from 'axios';
import nock from 'nock';
import { beforeEach, describe, expect, it } from 'vitest';

import { createSubjectMock } from '../../../__mocks__/notifications-mocks';
import {
  partialMockNotification,
  partialMockUser,
} from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import { commitHandler } from './commit';

describe('renderer/utils/notifications/handlers/commit.ts', () => {
  describe('enrich', () => {
    const mockAuthor = partialMockUser('some-author');
    const mockCommenter = partialMockUser('some-commenter');

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('get commit commenter', async () => {
      const mockNotification = partialMockNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/comments/141012658' as Link,
      });

      nock('https://api.github.com')
        .get(
          '/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8',
        )
        .reply(200, { author: mockAuthor });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/comments/141012658')
        .reply(200, { user: mockCommenter });

      const result = await commitHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        state: null,
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
      });
    });

    it('get commit without commenter', async () => {
      const mockNotification = partialMockNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latest_comment_url: null,
      });

      nock('https://api.github.com')
        .get(
          '/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8',
        )
        .reply(200, { author: mockAuthor });

      const result = await commitHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        state: null,
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
      });
    });

    it('return early if commit state filtered', async () => {
      const mockNotification = partialMockNotification({
        title: 'This is a commit with comments',
        type: 'Commit',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/commits/d2a86d80e3d24ea9510d5de6c147e53c30f313a8' as Link,
        latest_comment_url: null,
      });

      const result = await commitHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });
  });

  it('iconType', () => {
    expect(
      commitHandler.iconType(createSubjectMock({ type: 'Commit' })).displayName,
    ).toBe('GitCommitIcon');
  });
});
