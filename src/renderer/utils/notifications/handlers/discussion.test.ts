import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { Link } from '../../../types';
import type { Owner, Repository } from '../../../typesGitHub';
import {
  type AuthorFieldsFragment,
  type Discussion,
  DiscussionStateReason,
} from '../../api/graphql/generated/graphql';
import { discussionHandler } from './discussion';

const mockDiscussionAuthor: AuthorFieldsFragment = {
  login: 'discussion-author',
  url: 'https://github.com/discussion-author' as Link,
  avatar_url: 'https://avatars.githubusercontent.com/u/123456789?v=4' as Link,
  type: 'User',
};

describe('renderer/utils/notifications/handlers/discussion.ts', () => {
  describe('enrich', () => {
    const partialOwner: Partial<Owner> = {
      login: 'gitify-app',
    };

    const partialRepository: Partial<Repository> = {
      full_name: 'gitify-app/notifications-test',
      owner: partialOwner as Owner,
    };

    const mockNotification = createPartialMockNotification({
      title: 'This is a mock discussion',
      type: 'Discussion',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/discussions/123' as Link,
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
            repository: {
              discussion: mockDiscussionNode(null, true),
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
            repository: {
              discussion: mockDiscussionNode(
                DiscussionStateReason.Duplicate,
                false,
              ),
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
            repository: {
              discussion: mockDiscussionNode(null, false),
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
            repository: {
              discussion: mockDiscussionNode(
                DiscussionStateReason.Outdated,
                false,
              ),
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

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
            repository: {
              discussion: mockDiscussionNode(
                DiscussionStateReason.Reopened,
                false,
              ),
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

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
            repository: {
              discussion: mockDiscussionNode(
                DiscussionStateReason.Resolved,
                true,
              ),
            },
          },
        });

      const result = await discussionHandler.enrich(
        mockNotification,
        mockSettings,
      );

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
      } as Partial<Discussion>['labels'];
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              discussion: {
                ...mockDiscussion,
              },
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
            repository: {
              discussion: mockDiscussionNode(null, false),
            },
          },
        });

      const result = await discussionHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });
  });

  it('iconType', () => {
    expect(
      discussionHandler.iconType(createMockSubject({ type: 'Discussion' }))
        .displayName,
    ).toBe('CommentDiscussionIcon');

    expect(
      discussionHandler.iconType(
        createMockSubject({ type: 'Discussion', state: 'DUPLICATE' }),
      ).displayName,
    ).toBe('DiscussionDuplicateIcon');

    expect(
      discussionHandler.iconType(
        createMockSubject({ type: 'Discussion', state: 'OUTDATED' }),
      ).displayName,
    ).toBe('DiscussionOutdatedIcon');

    expect(
      discussionHandler.iconType(
        createMockSubject({ type: 'Discussion', state: 'RESOLVED' }),
      ).displayName,
    ).toBe('DiscussionClosedIcon');
  });
});

function mockDiscussionNode(
  state: DiscussionStateReason,
  isAnswered: boolean,
): Partial<Discussion> {
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
  } as unknown as Partial<Discussion>;
}
