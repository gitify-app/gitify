import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import {
  mockAuthor,
  mockCommenter,
  mockIssueResponseNode,
  noReactionGroups,
} from '../../api/__mocks__/response-mocks';

import type { GitifyNotification } from '../../../types';
import {
  type GitifyIssueState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';

import * as apiClient from '../../api/client';
import type { FetchIssueByNumberQuery } from '../../api/graphql/generated/graphql';
import { issueHandler } from './issue';

describe('renderer/utils/notifications/handlers/issue.ts', () => {
  describe('supportsMergedQueryEnrichment', () => {
    it('should support merge query', () => {
      expect(issueHandler.supportsMergedQueryEnrichment).toBeTruthy();
    });
  });

  describe('enrich', () => {
    const fetchIssueByNumberSpy = jest.spyOn(apiClient, 'fetchIssueByNumber');

    const mockNotification = mockPartialGitifyNotification({
      title: 'This is a mock issue',
      type: 'Issue',
      url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/1' as Link,
      latestCommentUrl:
        'https://api.github.com/repos/gitify-app/notifications-test/issues/comments/302888448' as Link,
    });

    it('issue with only state', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });

      fetchIssueByNumberSpy.mockResolvedValue({
        repository: {
          issue: mockIssue,
        },
      } satisfies FetchIssueByNumberQuery);

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
        commentCount: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: [],
        milestone: undefined,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('issue with stateReason - prefer stateReason over state when available', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'CLOSED',
        stateReason: 'COMPLETED',
      });

      fetchIssueByNumberSpy.mockResolvedValue({
        repository: {
          issue: mockIssue,
        },
      } satisfies FetchIssueByNumberQuery);

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'COMPLETED',
        user: {
          login: mockAuthor.login,
          avatarUrl: mockAuthor.avatarUrl,
          htmlUrl: mockAuthor.htmlUrl,
          type: mockAuthor.type,
        },
        commentCount: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: [],
        milestone: undefined,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
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
            reactions: {
              totalCount: 0,
            },
          },
        ],
      };

      fetchIssueByNumberSpy.mockResolvedValue({
        repository: {
          issue: mockIssue,
        },
      } satisfies FetchIssueByNumberQuery);
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
        commentCount: 1,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123#issuecomment-1234' as Link,
        labels: [],
        milestone: undefined,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('with labels', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.labels = {
        nodes: [{ name: 'enhancement' }],
      };

      fetchIssueByNumberSpy.mockResolvedValue({
        repository: {
          issue: mockIssue,
        },
      } satisfies FetchIssueByNumberQuery);

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
        commentCount: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: ['enhancement'],
        milestone: undefined,
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
    });

    it('with milestone', async () => {
      const mockIssue = mockIssueResponseNode({
        state: 'OPEN',
      });
      mockIssue.milestone = {
        state: 'OPEN',
        title: 'Open Milestone',
      };

      fetchIssueByNumberSpy.mockResolvedValue({
        repository: {
          issue: mockIssue,
        },
      } satisfies FetchIssueByNumberQuery);

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
        commentCount: 0,
        htmlUrl:
          'https://github.com/gitify-app/notifications-test/issues/123' as Link,
        labels: [],
        milestone: {
          state: 'OPEN',
          title: 'Open Milestone',
        },
        reactionsCount: 0,
        reactionGroups: noReactionGroups,
      } satisfies Partial<GitifySubject>);
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
      const mockNotification = mockPartialGitifyNotification({
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
      const mockNotification = mockPartialGitifyNotification({
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
