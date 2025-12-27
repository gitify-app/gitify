import { act, renderHook, waitFor } from '@testing-library/react';

import axios, { AxiosError } from 'axios';
import nock from 'nock';

import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';
import { mockAuth, mockSettings, mockState } from '../__mocks__/state-mocks';
import type { SettingsState } from '../types';
import {
  mockNotificationUser,
  mockSingleNotification,
} from '../utils/api/__mocks__/response-mocks';
import { Errors } from '../utils/errors';
import * as logger from '../utils/logger';
import { useNotifications } from './useNotifications';

describe('renderer/hooks/useNotifications.ts', () => {
  const rendererLogErrorSpy = vi
    .spyOn(logger, 'rendererLogError')
    .mockImplementation(() => {});

  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
    rendererLogErrorSpy.mockReset();

    // Reset mock notification state between tests since it's mutated
    mockSingleNotification.unread = true;
  });

  const id = mockSingleNotification.id;

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
        {
          id: '1',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a notification.',
            type: 'Issue',
            url: null,
            latest_comment_url: null,
          },
          repository: {
            name: 'test-repo',
            full_name: 'org/test-repo',
            html_url: 'https://github.com/org/test-repo',
            owner: {
              login: 'org',
              avatar_url: 'https://avatar.url',
              type: 'Organization',
            },
          },
        },
        {
          id: '2',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is another one.',
            type: 'Issue',
            url: null,
            latest_comment_url: null,
          },
          repository: {
            name: 'test-repo',
            full_name: 'org/test-repo',
            html_url: 'https://github.com/org/test-repo',
            owner: {
              login: 'org',
              avatar_url: 'https://avatar.url',
              type: 'Organization',
            },
          },
        },
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
      const mockRepository = {
        name: 'notifications-test',
        full_name: 'gitify-app/notifications-test',
        html_url: 'https://github.com/gitify-app/notifications-test',
        owner: {
          login: 'gitify-app',
          avatar_url: 'https://avatar.url',
          type: 'Organization',
        },
      };

      const mockNotifications = [
        {
          id: '1',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a check suite workflow.',
            type: 'CheckSuite',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
        {
          id: '2',
          unread: true,
          updated_at: '2024-02-26T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a Discussion.',
            type: 'Discussion',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
        {
          id: '3',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is an Issue.',
            type: 'Issue',
            url: 'https://api.github.com/repos/gitify-app/notifications-test/issues/3',
            latest_comment_url:
              'https://api.github.com/repos/gitify-app/notifications-test/issues/3/comments',
          },
          repository: mockRepository,
        },
        {
          id: '4',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a Pull Request.',
            type: 'PullRequest',
            url: 'https://api.github.com/repos/gitify-app/notifications-test/pulls/4',
            latest_comment_url:
              'https://api.github.com/repos/gitify-app/notifications-test/issues/4/comments',
          },
          repository: mockRepository,
        },
        {
          id: '5',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is an invitation.',
            type: 'RepositoryInvitation',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
        },
        {
          id: '6',
          unread: true,
          updated_at: '2024-01-01T00:00:00Z',
          reason: 'subscribed',
          subject: {
            title: 'This is a workflow run.',
            type: 'WorkflowRun',
            url: null,
            latest_comment_url: null,
          },
          repository: mockRepository,
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

    // TODO: Fix nock replyWithError compatibility with vitest
    it.skip('should fetch notifications with same failures', async () => {
      const code = AxiosError.ERR_BAD_REQUEST;
      const status = 401;
      const message = 'Bad credentials';

      nock('https://api.github.com')
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

      nock('https://github.gitify.io/api/v3')
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

      expect(result.current.globalError).toBe(Errors.BAD_CREDENTIALS);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(4);
    });

    // TODO: Fix nock replyWithError compatibility with vitest
    it.skip('should fetch notifications with different failures', async () => {
      const code = AxiosError.ERR_BAD_REQUEST;

      nock('https://api.github.com')
        .get('/notifications?participating=false')
        .replyWithError({
          code,
          response: {
            status: 400,
            data: {
              message: 'Oops! Something went wrong.',
            },
          },
        });

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false')
        .replyWithError({
          code,
          response: {
            status: 401,
            data: {
              message: 'Bad credentials',
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

      expect(result.current.globalError).toBeNull();
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read with success', async () => {
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockSingleNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark notifications as read with failure', async () => {
      nock('https://api.github.com/')
        .patch(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockSingleNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('markNotificationsAsDone', () => {
    it('should mark notifications as done with success', async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockSingleNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark notifications as done with failure', async () => {
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockSingleNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribeNotification', () => {
    const id = 'notification-123';

    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = false', async () => {
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
        result.current.unsubscribeNotification(
          mockState,
          mockSingleNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = true', async () => {
      // The unsubscribe endpoint call.
      nock('https://api.github.com/')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark done endpoint call.
      nock('https://api.github.com/')
        .delete(`/notifications/threads/${id}`)
        .reply(200);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings,
              markAsDoneOnUnsubscribe: true,
            } as SettingsState,
          },
          mockSingleNotification,
        );
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
        result.current.unsubscribeNotification(
          mockState,
          mockSingleNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
