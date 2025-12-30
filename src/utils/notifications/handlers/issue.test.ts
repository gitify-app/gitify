import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import {
  type GitifyIssueState,
  type GitifyNotification,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';
import type {
  IssueDetailsFragment,
  IssueState,
  IssueStateReason,
} from '../../api/graphql/generated/graphql';
import { issueHandler } from './issue';

// Mock isTauriEnvironment to return false so axios is used instead of Tauri fetch
vi.mock('../../environment', () => ({
  isTauriEnvironment: () => false,
}));

// Mock decryptValue since isTauriEnvironment is false
vi.mock('../../comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

// GraphQL-compatible user objects (camelCase)
const createGraphQLUser = (login: string) => ({
  __typename: 'User' as const,
  login,
  avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
  htmlUrl: `https://github.com/${login}` as Link,
  type: 'User' as const,
});

const mockAuthorGQL = createGraphQLUser('issue-author');
const mockCommenterGQL = createGraphQLUser('issue-commenter');

describe('renderer/utils/notifications/handlers/issue.ts', () => {
  describe('enrich', () => {
    let mockNotification: GitifyNotification;

    beforeEach(() => {
      mockNotification = createPartialMockNotification({
        title: 'This is a mock issue',
        type: 'Issue',
        url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
        latestCommentUrl:
          'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
      });

      // axios will default to using the XHR adapter which can't be intercepted
      // by nock. So, configure axios to use the node adapter.
      axios.defaults.adapter = 'http';
    });

    it('issue with only state', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthorGQL.login,
          htmlUrl: mockAuthorGQL.htmlUrl,
          avatarUrl: mockAuthorGQL.avatarUrl,
          type: mockAuthorGQL.type,
        },
        comments: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: [],
        milestone: undefined,
      } as unknown as GitifySubject);
    });

    it('issue with stateReason - prefer stateReason over state when available', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'CLOSED',
        stateReason: 'COMPLETED',
      });

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'COMPLETED',
        user: {
          login: mockAuthorGQL.login,
          htmlUrl: mockAuthorGQL.htmlUrl,
          avatarUrl: mockAuthorGQL.avatarUrl,
          type: mockAuthorGQL.type,
        },
        comments: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: [],
        milestone: undefined,
      } as unknown as GitifySubject);
    });

    it('issue with comments', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.comments = {
        totalCount: 1,
        nodes: [
          {
            author: mockCommenterGQL,
            url: 'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234',
          },
        ],
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockCommenterGQL.login,
          htmlUrl: mockCommenterGQL.htmlUrl,
          avatarUrl: mockCommenterGQL.avatarUrl,
          type: mockCommenterGQL.type,
        },
        comments: 1,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234',
        labels: [],
        milestone: undefined,
      } as unknown as GitifySubject);
    });

    it('with labels', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.labels = {
        nodes: [{ name: 'enhancement' }],
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthorGQL.login,
          htmlUrl: mockAuthorGQL.htmlUrl,
          avatarUrl: mockAuthorGQL.avatarUrl,
          type: mockAuthorGQL.type,
        },
        comments: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: ['enhancement'],
        milestone: undefined,
      } as unknown as GitifySubject);
    });

    it('with milestone', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.milestone = {
        state: 'OPEN',
        title: 'Open Milestone',
      };

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthorGQL.login,
          htmlUrl: mockAuthorGQL.htmlUrl,
          avatarUrl: mockAuthorGQL.avatarUrl,
          type: mockAuthorGQL.type,
        },
        comments: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: [],
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
      } as unknown as GitifySubject);
    });
  });

  describe('iconType', () => {
    const cases = {
      CLOSED: 'IssueClosedIcon',
      COMPLETED: 'IssueClosedIcon',
      DUPLICATE: 'SkipIcon',
      NOT_PLANNED: 'SkipIcon',
      OPEN: 'IssueOpenedIcon',
      REOPENED: 'IssueReopenedIcon',
    } satisfies Record<GitifyIssueState, string>;

    it.each(
      Object.entries(cases) as Array<[GitifyIssueState, IconColor]>,
    )('iconType for issue with state %s', (issueState, issueIconType) => {
      expect(
        issueHandler.iconType(
          createMockSubject({ type: 'Issue', state: issueState }),
        )?.displayName,
      ).toBe(issueIconType);
    });
  });

  describe('iconColor', () => {
    const cases = {
      CLOSED: IconColor.RED,
      COMPLETED: IconColor.PURPLE,
      DUPLICATE: IconColor.GRAY,
      NOT_PLANNED: IconColor.GRAY,
      OPEN: IconColor.GREEN,
      REOPENED: IconColor.GREEN,
    } satisfies Record<GitifyIssueState, IconColor>;

    it.each(
      Object.entries(cases) as Array<[GitifyIssueState, IconColor]>,
    )('iconColor for issue with state %s', (issueState, issueIconColor) => {
      expect(
        issueHandler.iconColor(
          createMockSubject({ type: 'Issue', state: issueState }),
        ),
      ).toBe(issueIconColor);
    });
  });

  it('defaultUrl', () => {
    const mockHtmlUrl =
      'https://github.com/gitify-app/notifications-test' as Link;

    expect(
      issueHandler.defaultUrl({
        repository: {
          htmlUrl: mockHtmlUrl,
        },
      } as GitifyNotification),
    ).toEqual(`${mockHtmlUrl}/issues`);
  });
});

function mockIssueResponseNode(mocks: {
  state: IssueState;
  stateReason?: IssueStateReason;
}): IssueDetailsFragment {
  return {
    __typename: 'Issue',
    number: 123,
    title: 'PR Title',
    state: mocks.state,
    stateReason: mocks.stateReason,
    url: 'https://github.com/gitify-app/notifications-test/issues/123',
    author: mockAuthorGQL,
    labels: { nodes: [] },
    comments: { totalCount: 0, nodes: [] },
    milestone: undefined,
  };
}
