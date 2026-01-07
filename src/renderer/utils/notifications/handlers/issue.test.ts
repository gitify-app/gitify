import axios from 'axios';
import nock from 'nock';

import { mockPartialGitifyNotification } from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import type { GitifyNotification } from '../../../types';
import {
  type GitifyIssueState,
  type GitifySubject,
  IconColor,
  type Link,
} from '../../../types';
import {
  mockAuthor,
  mockCommenter,
  mockIssueResponseNode,
} from '../../api/__mocks__/response-mocks';
import { issueHandler } from './issue';

describe('renderer/utils/notifications/handlers/issue.ts', () => {
  describe('supportsMergedQueryEnrichment', () => {
    it('should support merge query', () => {
      expect(issueHandler.supportsMergedQueryEnrichment).toBeTruthy();
    });
  });

  describe('enrich', () => {
    let mockNotification: GitifyNotification;

    beforeEach(() => {
      mockNotification = mockPartialGitifyNotification({
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
