import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import { type GitifySubject, IconColor, type Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import type { FetchIssueByNumberQuery } from '../../api/graphql/generated/graphql';
import { issueHandler } from './issue';

type IssueResponse = FetchIssueByNumberQuery['repository']['issue'];

describe('renderer/utils/notifications/handlers/issue.ts', () => {
  describe('enrich', () => {
    const mockAuthor = createPartialMockUser('some-author');
    const mockCommenter = createPartialMockUser('some-commenter');

    let mockNotification: Notification;

    beforeEach(() => {
      mockNotification = createPartialMockNotification({
        title: 'This is a mock issue',
        type: 'Issue',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
        latest_comment_url:
          'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
      });

      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('open issue state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'OPEN',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: { nodes: [] },
                comments: { totalCount: 0, nodes: [] },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

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
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: null,
      } as GitifySubject);
    });

    it('closed issue state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'CLOSED',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: { nodes: [] },
                comments: { totalCount: 0, nodes: [] },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'CLOSED',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: null,
      } as GitifySubject);
    });

    it('completed issue state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'CLOSED',
                stateReason: 'COMPLETED',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: { nodes: [] },
                comments: { totalCount: 0, nodes: [] },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'COMPLETED',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: null,
      } as GitifySubject);
    });

    it('not_planned issue state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'CLOSED',
                stateReason: 'NOT_PLANNED',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: { nodes: [] },
                comments: { totalCount: 0, nodes: [] },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'NOT_PLANNED',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: null,
      } as GitifySubject);
    });

    it('reopened issue state', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'OPEN',
                stateReason: 'REOPENED',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: { nodes: [] },
                comments: { totalCount: 0, nodes: [] },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'REOPENED',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: null,
      } as GitifySubject);
    });

    it('with comments', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'OPEN',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: {
                  nodes: [],
                },
                comments: {
                  totalCount: 1,
                  nodes: [
                    {
                      author: mockCommenter,
                      url: 'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234',
                    },
                  ],
                },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        comments: 1,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234',
        labels: [],
        milestone: null,
      } as GitifySubject);
    });

    it('with labels', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'OPEN',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: {
                  nodes: [
                    {
                      name: 'enhancement',
                    },
                  ],
                },
                comments: { totalCount: 0, nodes: [] },
                milestone: null,
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

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
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: ['enhancement'],
        milestone: null,
      } as GitifySubject);
    });

    it('with milestone', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: {
                __typename: 'Issue',
                number: 123,
                title: 'PR Title',
                state: 'OPEN',
                url: 'https://github.com/gitify-app/notifications-test/issues/123',
                author: mockAuthor,
                labels: {
                  nodes: [],
                },
                comments: { totalCount: 0, nodes: [] },
                milestone: {
                  state: 'OPEN',
                  title: 'Open Milestone',
                },
              } as IssueResponse,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

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
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
      } as GitifySubject);
    });
  });

  it('iconType', () => {
    expect(
      issueHandler.iconType(createMockSubject({ type: 'Issue' })).displayName,
    ).toBe('IssueOpenedIcon');

    expect(
      issueHandler.iconType(createMockSubject({ type: 'Issue', state: 'OPEN' }))
        .displayName,
    ).toBe('IssueOpenedIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'CLOSED',
        }),
      ).displayName,
    ).toBe('IssueClosedIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'COMPLETED',
        }),
      ).displayName,
    ).toBe('IssueClosedIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'NOT_PLANNED',
        }),
      ).displayName,
    ).toBe('SkipIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'DUPLICATE',
        }),
      ).displayName,
    ).toBe('SkipIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'REOPENED',
        }),
      ).displayName,
    ).toBe('IssueReopenedIcon');
  });

  it('iconColor', () => {
    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'OPEN' }),
      ),
    ).toBe(IconColor.GREEN);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'REOPENED' }),
      ),
    ).toBe(IconColor.GREEN);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'CLOSED' }),
      ),
    ).toBe(IconColor.RED);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'COMPLETED' }),
      ),
    ).toBe(IconColor.PURPLE);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'NOT_PLANNED' }),
      ),
    ).toBe(IconColor.GRAY);
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      issueHandler.defaultUrl({
        repository: {
          html_url: mockHtmlUrl,
        },
      } as Notification),
    ).toEqual(`${mockHtmlUrl}/issues`);
  });
});
