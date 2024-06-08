import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import nock from 'nock';

import {
  mockAuth,
  mockGitHubCloudAccount,
  mockSettings,
  mockState,
} from '../__mocks__/state-mocks';
import { mockNotificationUser } from '../utils/api/__mocks__/response-mocks';
import { Errors } from '../utils/constants';
import { useNotifications } from './useNotifications';

describe('hooks/useNotifications.ts', () => {
  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
  });

  describe('fetchNotifications', () => {
    it('should fetch non-detailed notifications with success', async () => {
      const mockState = {
        auth: mockAuth,
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      };

      const notifications = [
        { id: 1, title: 'This is a notification.' },
        { id: 2, title: 'This is another one.' },
      ];

      nock('https://api.github.com')
        .get('/notifications?participating=false')
        .reply(200, notifications);

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false')
        .reply(200, notifications);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].account.hostname).toBe(
        'github.com',
      );
      expect(result.current.notifications[0].notifications.length).toBe(2);

      expect(result.current.notifications[1].account.hostname).toBe(
        'github.gitify.io',
      );
      expect(result.current.notifications[1].notifications.length).toBe(2);
    });

    it('should fetch detailed notifications with success', async () => {
      const mockNotifications = [
        {
          id: 1,
          subject: {
            title: 'This is a check suite workflow.',
            type: 'CheckSuite',
            url: null,
            latest_comment_url: null,
          },
          repository: {
            full_name: 'gitify-app/notifications-test',
          },
        },
        {
          id: 2,
          subject: {
            title: 'This is a Discussion.',
            type: 'Discussion',
            url: null,
            latest_comment_url: null,
          },
          repository: {
            full_name: 'gitify-app/notifications-test',
          },
          updated_at: '2024-02-26T00:00:00Z',
        },
        {
          id: 3,
          subject: {
            title: 'This is an Issue.',
            type: 'Issue',
            url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/3',
            latest_comment_url:
              'https://api.github.com/repos/gitify-app/notifications-test/issues/3/comments',
          },
          repository: {
            full_name: 'gitify-app/notifications-test',
          },
        },
        {
          id: 4,
          subject: {
            title: 'This is a Pull Request.',
            type: 'PullRequest',
            url: 'https://api.github.com/repos/gitify-app/notifications-test/pulls/4',
            latest_comment_url:
              'https://api.github.com/repos/gitify-app/notifications-test/issues/4/comments',
          },
          repository: {
            full_name: 'gitify-app/notifications-test',
          },
        },
        {
          id: 5,
          subject: {
            title: 'This is an invitation.',
            type: 'RepositoryInvitation',
            url: null,
            latest_comment_url: null,
          },
          repository: {
            full_name: 'gitify-app/notifications-test',
          },
        },
        {
          id: 6,
          subject: {
            title: 'This is a workflow run.',
            type: 'WorkflowRun',
            url: null,
            latest_comment_url: null,
          },
          repository: {
            full_name: 'gitify-app/notifications-test',
          },
        },
      ];

      nock('https://api.github.com')
        .get('/notifications?participating=false')
        .reply(200, mockNotifications);

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            search: {
              nodes: [
                {
                  title: 'This is a Discussion.',
                  stateReason: null,
                  isAnswered: true,
                  url: 'https://github.com/gitify-app/notifications-test/discussions/612',
                  author: {
                    login: 'discussion-creator',
                    url: 'https://github.com/discussion-creator',
                    avatar_url:
                      'https://avatars.githubusercontent.com/u/133795385?s=200&v=4',
                    type: 'User',
                  },
                  comments: {
                    nodes: [
                      {
                        databaseId: 2297637,
                        createdAt: '2022-03-04T20:39:44Z',
                        author: {
                          login: 'comment-user',
                          url: 'https://github.com/comment-user',
                          avatar_url:
                            'https://avatars.githubusercontent.com/u/1?v=4',
                          type: 'User',
                        },
                        replies: {
                          nodes: [],
                        },
                      },
                    ],
                  },
                  labels: null,
                },
              ],
            },
          },
        });

      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/3')
        .reply(200, {
          state: 'closed',
          merged: true,
          user: mockNotificationUser,
          labels: [],
        });
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/3/comments')
        .reply(200, {
          user: mockNotificationUser,
        });
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/4')
        .reply(200, {
          state: 'closed',
          merged: false,
          user: mockNotificationUser,
          labels: [],
        });
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/pulls/4/reviews')
        .reply(200, {});
      nock('https://api.github.com')
        .get('/repos/gitify-app/notifications-test/issues/4/comments')
        .reply(200, {
          user: mockNotificationUser,
        });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications({
          auth: {
            accounts: [mockGitHubCloudAccount],
          },
          settings: {
            ...mockSettings,
            detailedNotifications: true,
          },
        });
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].account.hostname).toBe(
        'github.com',
      );
      expect(result.current.notifications[0].notifications.length).toBe(6);
    });

    it('should fetch notifications with failures', async () => {
      const code = AxiosError.ERR_BAD_REQUEST;
      const status = 400;
      const message = 'Oops! Something went wrong.';

      nock('https://api.github.com/')
        .get('/notifications?participating=false')
        .replyWithError({
          code,
          response: {
            status,
            data: {
              message,
            },
          },
        });

      nock('https://github.gitify.io/api/v3/')
        .get('/notifications?participating=false')
        .replyWithError({
          code,
          response: {
            status,
            data: {
              message,
            },
          },
        });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.errorDetails).toBe(Errors.UNKNOWN);
    });
  });

  describe('removeNotificationFromState', () => {
    it('should remove a notification from state', async () => {
      const notifications = [
        { id: 1, title: 'This is a notification.' },
        { id: 2, title: 'This is another one.' },
      ];

      nock('https://api.github.com')
        .get('/notifications?participating=false')
        .reply(200, notifications);

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false')
        .reply(200, notifications);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications({
          ...mockState,
          settings: { ...mockSettings, detailedNotifications: false },
        });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      act(() => {
        result.current.removeNotificationFromState(
          mockSettings,
          result.current.notifications[0].notifications[0].id,
          result.current.notifications[0].account.hostname,
        );
      });

      expect(result.current.notifications[0].notifications.length).toBe(1);
    });
  });

  describe('markNotificationRead', () => {
    const hostname = 'github.com';
    const id = 'notification-123';

    it('should mark a notification as read with success', async () => {
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationRead(mockState, id, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark a notification as read with failure', async () => {
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationRead(mockState, id, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('markNotificationDone', () => {
    const hostname = 'github.com';
    const id = 'notification-123';

    it('should mark a notification as done with success', async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationDone(mockState, id, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark a notification as done with failure', async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationDone(mockState, id, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('unsubscribeNotification', () => {
    const hostname = 'github.com';
    const id = 'notification-123';

    it('should unsubscribe from a notification with success', async () => {
      // The unsubscribe endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark read endpoint call.
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(mockState, id, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should unsubscribe from a notification with failure', async () => {
      // The unsubscribe endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(400);

      // The mark read endpoint call.
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(mockState, id, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('markRepoNotificationsRead', () => {
    const hostname = 'github.com';
    const repoSlug = 'gitify-app/notifications-test';

    it("should mark a repository's notifications as read with success", async () => {
      nock('https://api.github.com/')
        .put(`/repos/${repoSlug}/notifications`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markRepoNotificationsRead(mockState, repoSlug, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it("should mark a repository's notifications as read with failure", async () => {
      nock('https://api.github.com/')
        .put(`/repos/${repoSlug}/notifications`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markRepoNotificationsRead(mockState, repoSlug, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('markRepoNotificationsDone', () => {
    const hostname = 'github.com';
    const repoSlug = 'gitify-app/notifications-test';
    const id = 'notification-123';

    it("should mark a repository's notifications as done with success", async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markRepoNotificationsDone(mockState, repoSlug, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it("should mark a repository's notifications as done with failure", async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markRepoNotificationsDone(mockState, repoSlug, hostname);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });
});
