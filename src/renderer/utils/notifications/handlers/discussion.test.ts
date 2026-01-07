import axios from 'axios';
import nock from 'nock';

import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { GitifyNotification } from '../../../types';
import {
  type GitifyDiscussionState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';
import {
  mockAuthor,
  mockCommenter,
  mockDiscussionResponseNode,
  mockReplier,
} from '../../api/__mocks__/response-mocks';
import { discussionHandler } from './discussion';

describe('renderer/utils/notifications/handlers/discussion.ts', () => {
  describe('supportsMergedQueryEnrichment', () => {
    it('should support merge query', () => {
      expect(discussionHandler.supportsMergedQueryEnrichment).toBeTruthy();
    });
  });

  describe('enrich', () => {
    const mockNotification = mockPartialGitifyNotification({
      title: 'This is a mock discussion',
      type: 'Discussion',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/discussions/123' as Link,
      latestCommentUrl: null,
    });
    mockNotification.updatedAt = '2024-01-01T00:00:00Z';

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('answered discussion state - no stateReason', async () => {
      const mockDiscussion = mockDiscussionResponseNode({ isAnswered: true });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: mockDiscussion,
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'ANSWERED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        commentCount: 0,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as Partial<GitifySubject>);
    });

    it('open / unanswered discussion - no stateReason', async () => {
      const mockDiscussion = mockDiscussionResponseNode({ isAnswered: false });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: mockDiscussion,
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        commentCount: 0,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as Partial<GitifySubject>);
    });

    it('discussion with stateReason - stateReason always takes precedence', async () => {
      const mockDiscussion = mockDiscussionResponseNode({
        isAnswered: true,
        stateReason: 'DUPLICATE',
      });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: mockDiscussion,
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'DUPLICATE',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        commentCount: 0,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as Partial<GitifySubject>);
    });

    it('discussion with labels', async () => {
      const mockDiscussion = mockDiscussionResponseNode({ isAnswered: true });
      mockDiscussion.labels = {
        nodes: [
          {
            name: 'enhancement',
          },
        ],
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: mockDiscussion,
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'ANSWERED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        commentCount: 0,
        labels: ['enhancement'],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as Partial<GitifySubject>);
    });

    it('discussion with comments', async () => {
      const mockDiscussion = mockDiscussionResponseNode({ isAnswered: true });
      mockDiscussion.comments = {
        totalCount: 1,
        nodes: [
          {
            author: mockCommenter,
            createdAt: '2024-02-01T00:00:00Z',
            url: 'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-1234',
            replies: {
              totalCount: 0,
              nodes: [],
            },
          },
        ],
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: mockDiscussion,
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'ANSWERED',
        user: {
          login: mockCommenter.login,
          avatarUrl: mockCommenter.avatarUrl,
          htmlUrl: mockCommenter.htmlUrl,
          type: mockCommenter.type,
        },
        commentCount: 1,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-1234',
      } as Partial<GitifySubject>);
    });

    it('discussion with comments and replies', async () => {
      const mockDiscussion = mockDiscussionResponseNode({ isAnswered: true });
      mockDiscussion.comments = {
        totalCount: 1,
        nodes: [
          {
            author: mockCommenter,
            createdAt: '2024-01-01T00:00:00Z',
            url: 'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-1234',
            replies: {
              totalCount: 1,
              nodes: [
                {
                  author: mockReplier,
                  createdAt: '2024-01-01T00:00:00Z',
                  url: 'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-6789',
                },
              ],
            },
          },
        ],
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: mockDiscussion,
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

      expect(result).toEqual({
        number: 123,
        state: 'ANSWERED',
        user: {
          login: mockReplier.login,
          avatarUrl: mockReplier.avatarUrl,
          htmlUrl: mockReplier.htmlUrl,
          type: mockReplier.type,
        },
        commentCount: 1,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-6789',
      } as Partial<GitifySubject>);
    });
  });

  describe('iconType', () => {
    const cases = {
      ANSWERED: 'CommentDiscussionIcon',
      DUPLICATE: 'DiscussionDuplicateIcon',
      OPEN: 'CommentDiscussionIcon',
      OUTDATED: 'DiscussionOutdatedIcon',
      REOPENED: 'CommentDiscussionIcon',
      RESOLVED: 'DiscussionClosedIcon',
    } satisfies Record<GitifyDiscussionState, string>;

    it.each(
      Object.entries(cases) as Array<[GitifyDiscussionState, IconColor]>,
    )('iconType for discussion with state %s', (discussionState, discussionIconType) => {
      const mockNotification = mockPartialGitifyNotification({
        type: 'Discussion',
        state: discussionState,
      });

      expect(discussionHandler.iconType(mockNotification).displayName).toBe(
        discussionIconType,
      );
    });
  });

  describe('iconColor', () => {
    const cases = {
      ANSWERED: IconColor.GREEN,
      DUPLICATE: IconColor.GRAY,
      OPEN: IconColor.GRAY,
      OUTDATED: IconColor.GRAY,
      REOPENED: IconColor.GRAY,
      RESOLVED: IconColor.PURPLE,
    } satisfies Record<GitifyDiscussionState, IconColor>;

    it.each(
      Object.entries(cases) as Array<[GitifyDiscussionState, IconColor]>,
    )('iconColor for discussion with state %s', (discussionState, discussionIconColor) => {
      const mockNotification = mockPartialGitifyNotification({
        type: 'Discussion',
        state: discussionState,
      });

      expect(discussionHandler.iconColor(mockNotification)).toBe(
        discussionIconColor,
      );
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      discussionHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/discussions`);
  });
});
