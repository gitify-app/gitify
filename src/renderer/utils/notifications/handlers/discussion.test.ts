import axios from 'axios';
import nock from 'nock';

import { mockNotificationWithSubject } from '../../../__mocks__/notifications-mocks';
import { partialMockNotification } from '../../../__mocks__/partial-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import type {
  Discussion,
  DiscussionAuthor,
  DiscussionStateType,
  Repository,
  StateType,
} from '../../../typesGitHub';
import { createDiscussionHandler } from './discussion';

const mockDiscussionAuthor: DiscussionAuthor = {
  login: 'discussion-author',
  url: 'https://github.com/discussion-author' as Link,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
  type: 'User',
};

describe('renderer/utils/notifications/handlers/discussion.ts', () => {
  describe('enrich', () => {
    const partialRepository: Partial<Repository> = {
      full_name: 'gitify-app/notifications-test',
    };

    const mockNotification = partialMockNotification({
      title: 'This is a mock discussion',
      type: 'Discussion',
    });
    mockNotification.updated_at = '2024-01-01T00:00:00Z';
    mockNotification.repository = {
      ...(partialRepository as Repository),
    };

    beforeEach(() => {
      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('answered discussion state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode(null, true)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'ANSWERED',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: [],
      });
    });

    it('duplicate discussion state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode('DUPLICATE', false)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'DUPLICATE',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: [],
      });
    });

    it('open discussion state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode(null, false)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: [],
      });
    });

    it('outdated discussion state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode('OUTDATED', false)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OUTDATED',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: [],
      });
    });

    it('reopened discussion state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode('REOPENED', false)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'REOPENED',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: [],
      });
    });

    it('resolved discussion state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode('RESOLVED', true)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'RESOLVED',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: [],
      });
    });

    it('discussion with labels', async () => {
      const mockDiscussion = mockDiscussionNode(null, true);
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
            search: {
              nodes: [mockDiscussion],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich(mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'ANSWERED',
        user: {
          login: mockDiscussionAuthor.login,
          html_url: mockDiscussionAuthor.url,
          avatar_url: mockDiscussionAuthor.avatar_url,
          type: mockDiscussionAuthor.type,
        },
        comments: 0,
        labels: ['enhancement'],
      });
    });

    it('early return if discussion state filtered', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [mockDiscussionNode(null, false)],
            },
          },
        });

      const handler = createDiscussionHandler(mockNotification);
      const result = await handler.enrich({
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });
  });

  describe('iconType', () => {
    const cases: Array<[StateType, string]> = [
      [null, 'CommentDiscussionIcon'],
      ['DUPLICATE', 'DiscussionDuplicateIcon'],
      ['OUTDATED', 'DiscussionOutdatedIcon'],
      ['RESOLVED', 'DiscussionClosedIcon'],
    ];

    it.each(cases)('returns expected icon for %s', (state, expectedIcon) => {
      const handler = createDiscussionHandler(
        mockNotificationWithSubject({ type: 'Discussion', state }),
      );

      expect(handler.iconType().displayName).toBe(expectedIcon);
    });
  });
});

function mockDiscussionNode(
  state: DiscussionStateType,
  isAnswered: boolean,
): Discussion {
  return {
    number: 123,
    title: 'This is a mock discussion',
    url: 'https://github.com/gitify-app/notifications-test/discussions/1' as Link,
    stateReason: state,
    isAnswered: isAnswered,
    author: mockDiscussionAuthor,
    comments: {
      nodes: [],
      totalCount: 0,
    },
    labels: null,
  };
}
