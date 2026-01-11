import { vi } from 'vitest';

import {
  createMockResponse,
  fetch,
} from '../../../__mocks__/@tauri-apps/plugin-http';
import { createPartialMockNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createMockGraphQLAuthor } from '../../../__mocks__/user-mocks';
import type { GitifyNotification } from '../../../types';
import {
  type GitifyIssueState,
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

const mockAuthor = createMockGraphQLAuthor('issue-author');
const mockCommenter = createMockGraphQLAuthor('issue-commenter');

describe('renderer/utils/notifications/handlers/issue.ts', () => {
  describe('supportsMergedQueryEnrichment', () => {
    it('should support merge query', () => {
      expect(issueHandler.supportsMergedQueryEnrichment).toBeTruthy();
    });
  });

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

      vi.clearAllMocks();
      fetch.mockResolvedValue(createMockResponse({}));
    });

    it('issue with only state', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });

      fetch.mockResolvedValueOnce(
        createMockResponse({
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        }),
      );

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: undefined,
      } as Partial<GitifySubject>);
    });

    it('issue with stateReason - prefer stateReason over state when available', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'CLOSED',
        stateReason: 'COMPLETED',
      });

      fetch.mockResolvedValueOnce(
        createMockResponse({
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        }),
      );

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'COMPLETED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockCommenter.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: undefined,
      } as Partial<GitifySubject>);
    });

    it('issue with comments', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.comments = {
        totalCount: 1,
        nodes: [
          {
            author: mockCommenter,
            url: 'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234',
          },
        ],
      };

      fetch.mockResolvedValueOnce(
        createMockResponse({
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        }),
      );

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockCommenter.login,
          avatarUrl: mockCommenter.avatarUrl,
          htmlUrl: mockCommenter.htmlUrl,
          type: mockCommenter.type,
        },
        comments: 1,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234',
        labels: [],
        milestone: undefined,
      } as Partial<GitifySubject>);
    });

    it('with labels', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.labels = {
        nodes: [{ name: 'enhancement' }],
      };

      fetch.mockResolvedValueOnce(
        createMockResponse({
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        }),
      );

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: ['enhancement'],
        milestone: undefined,
      } as Partial<GitifySubject>);
    });

    it('with milestone', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.milestone = {
        state: 'OPEN',
        title: 'Open Milestone',
      };

      fetch.mockResolvedValueOnce(
        createMockResponse({
          data: {
            repository: {
              issue: mockIssue,
            },
          },
        }),
      );

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'OPEN',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        comments: 0,
        htmlUrl: 'https://github.com/gitify-app/notifications-test/issues/123',
        labels: [],
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
      } as Partial<GitifySubject>);
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
      const mockNotification = createPartialMockNotification({
        type: 'Issue',
        state: issueState,
      });

      expect(issueHandler.iconType(mockNotification).displayName).toBe(
        issueIconType,
      );
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
      const mockNotification = createPartialMockNotification({
        type: 'Issue',
        state: issueState,
      });

      expect(issueHandler.iconColor(mockNotification)).toBe(issueIconColor);
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
    author: mockAuthor,
    labels: { nodes: [] },
    comments: { totalCount: 0, nodes: [] },
    milestone: null,
  };
}
