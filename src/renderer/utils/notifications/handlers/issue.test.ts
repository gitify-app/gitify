import axios from 'axios';
import nock from 'nock';

import {
  createMockSubject,
  createPartialMockNotification,
} from '../../../__mocks__/notifications-mocks';
import { mockSettings } from '../../../__mocks__/state-mocks';
import { createPartialMockUser } from '../../../__mocks__/user-mocks';
import { IconColor, type Link } from '../../../types';
import type { Notification } from '../../../typesGitHub';
import { issueHandler } from './issue';

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
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'open',
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'open',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        labels: [],
      });
    });

    it('closed issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'closed',
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'closed',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        labels: [],
      });
    });

    it('completed issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'closed',
          state_reason: 'completed',
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'completed',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        labels: [],
      });
    });

    it('not_planned issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'open',
          state_reason: 'not_planned',
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'not_planned',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        labels: [],
      });
    });

    it('reopened issue state', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'open',
          state_reason: 'reopened',
          user: mockAuthor,
          labels: [],
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
        .reply(200, { user: mockCommenter });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'reopened',
        user: {
          login: mockCommenter.login,
          html_url: mockCommenter.html_url,
          avatar_url: mockCommenter.avatar_url,
          type: mockCommenter.type,
        },
        labels: [],
      });
    });

    it('handle issues without latest_comment_url', async () => {
      mockNotification.subject.latest_comment_url = null;

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'open',
          draft: false,
          merged: false,
          user: mockAuthor,
          labels: [],
        });

      const result = await issueHandler.enrich(mockNotification, mockSettings);

      expect(result).toEqual({
        number: 123,
        state: 'open',
        user: {
          login: mockAuthor.login,
          html_url: mockAuthor.html_url,
          avatar_url: mockAuthor.avatar_url,
          type: mockAuthor.type,
        },
        labels: [],
      });
    });

    describe('Issue With Labels', () => {
      it('with labels', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, {
            number: 123,
            state: 'open',
            user: mockAuthor,
            labels: [{ name: 'enhancement' }],
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await issueHandler.enrich(
          mockNotification,
          mockSettings,
        );

        expect(result).toEqual({
          number: 123,
          state: 'open',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: ['enhancement'],
        });
      });

      it('handle null labels', async () => {
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/1')
          .reply(200, {
            number: 123,
            state: 'open',
            user: mockAuthor,
            labels: null,
          });

        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/comments/302888448')
          .reply(200, { user: mockCommenter });

        const result = await issueHandler.enrich(
          mockNotification,
          mockSettings,
        );

        expect(result).toEqual({
          number: 123,
          state: 'open',
          user: {
            login: mockCommenter.login,
            html_url: mockCommenter.html_url,
            avatar_url: mockCommenter.avatar_url,
            type: mockCommenter.type,
          },
          labels: [],
        });
      });
    });

    it('early return if issue state filtered out', async () => {
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/1')
        .reply(200, {
          number: 123,
          state: 'open',
          user: mockAuthor,
          labels: [],
        });

      const result = await issueHandler.enrich(mockNotification, {
        ...mockSettings,
        filterStates: ['closed'],
      });

      expect(result).toEqual(null);
    });
  });

  it('iconType', () => {
    expect(
      issueHandler.iconType(createMockSubject({ type: 'Issue' })).displayName,
    ).toBe('IssueOpenedIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({ type: 'Issue', state: 'draft' }),
      ).displayName,
    ).toBe('IssueDraftIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'closed',
        }),
      ).displayName,
    ).toBe('IssueClosedIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'completed',
        }),
      ).displayName,
    ).toBe('IssueClosedIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'not_planned',
        }),
      ).displayName,
    ).toBe('SkipIcon');

    expect(
      issueHandler.iconType(
        createMockSubject({
          type: 'Issue',
          state: 'reopened',
        }),
      ).displayName,
    ).toBe('IssueReopenedIcon');
  });

  it('iconColor', () => {
    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'open' }),
      ),
    ).toBe(IconColor.GREEN);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'reopened' }),
      ),
    ).toBe(IconColor.GREEN);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'closed' }),
      ),
    ).toBe(IconColor.RED);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'completed' }),
      ),
    ).toBe(IconColor.PURPLE);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'draft' }),
      ),
    ).toBe(IconColor.GRAY);

    expect(
      issueHandler.iconColor(
        createMockSubject({ type: 'Issue', state: 'not_planned' }),
      ),
    ).toBe(IconColor.GRAY);
  });
});
