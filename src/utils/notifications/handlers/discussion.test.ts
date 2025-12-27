import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import {
  type GitifyDiscussionState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';
import type { Notification } from '../../../typesGitHub';
import type {
  DiscussionDetailsFragment,
  DiscussionStateReason,
} from '../../api/graphql/generated/graphql';
import { discussionHandler } from './discussion';

// Mock isTauriEnvironment to return false so axios is used instead of Tauri fetch
vi.mock('../../environment', () => ({
  isTauriEnvironment: () => false,
}));

// Mock decryptValue since isTauriEnvironment is false
vi.mock('../../comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

const mockAuthor = createPartialMockUser('discussion-author');
const mockCommenter = createPartialMockUser('discussion-commenter');
const mockReplier = createPartialMockUser('discussion-replier');

describe('renderer/utils/notifications/handlers/discussion.ts', () => {
  describe('enrich', () => {
    const mockNotification = createPartialMockNotification({
      title: 'This is a mock discussion',
      type: 'Discussion',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/discussions/123' as Link,
      latest_comment_url: undefined,
    });
    mockNotification.updated_at = '2024-01-01T00:00:00Z';

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
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as unknown as GitifySubject);
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
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as unknown as GitifySubject);
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
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as unknown as GitifySubject);
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
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        labels: ['enhancement'],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123',
      } as unknown as GitifySubject);
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
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        comments: 1,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-1234',
      } as unknown as GitifySubject);
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
          html_url: mockReplier.html_url,
          avatar_url: mockReplier.avatar_url,
          type: mockReplier.type,
        },
        comments: 1,
        labels: [],
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/discussions/123#discussioncomment-6789',
      } as unknown as GitifySubject);
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
      expect(
        discussionHandler.iconType(
          createMockSubject({ type: 'Discussion', state: discussionState }),
        )!.displayName,
      ).toBe(discussionIconType);
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
      expect(
        discussionHandler.iconColor(
          createMockSubject({ type: 'Discussion', state: discussionState }),
        ),
      ).toBe(discussionIconColor);
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      discussionHandler.defaultUrl({
        repository: {
          html_url: mockHtmlUrl,
        },
      } as Notification),
    ).toEqual(`${mockHtmlUrl}/discussions`);
  });
});

function mockDiscussionResponseNode(mocks: {
  stateReason?: DiscussionStateReason;
  isAnswered: boolean;
}): DiscussionDetailsFragment {
  return {
    __typename: 'Discussion',
    number: 123,
    title: 'This is a mock discussion',
    url: 'https://github.com/gitify-app/notifications-test/discussions/123' as Link,
    stateReason: mocks.stateReason,
    isAnswered: mocks.isAnswered,
    author: mockAuthor,
    comments: {
      nodes: [],
      totalCount: 0,
    },
    labels: null,
  };
}
