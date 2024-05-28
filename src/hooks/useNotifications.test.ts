import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import nock from 'nock';

import { mockAccounts, mockSettings, mockUser } from '../__mocks__/state-mocks';
import type { AuthState } from '../types';
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
    describe('github.com & enterprise', () => {
      it('should fetch notifications with success - github.com & enterprise', async () => {
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
          result.current.fetchNotifications(mockAccounts, {
            ...mockSettings,
            detailedNotifications: false,
          });
        });

        expect(result.current.status).toBe('loading');

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].hostname).toBe('api.github.com');
        expect(result.current.notifications[0].notifications.length).toBe(2);

        expect(result.current.notifications[1].hostname).toBe(
          'github.gitify.io',
        );
        expect(result.current.notifications[1].notifications.length).toBe(2);
      });

      it('should fetch notifications with failures - github.com & enterprise', async () => {
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
          result.current.fetchNotifications(mockAccounts, mockSettings);
        });

        expect(result.current.status).toBe('loading');

        await waitFor(() => {
          expect(result.current.status).toBe('error');
        });

        expect(result.current.errorDetails).toBe(Errors.UNKNOWN);
      });
    });

    describe('enterprise', () => {
      it('should fetch notifications with success - enterprise only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          token: null,
        };

        const notifications = [
          { id: 1, title: 'This is a notification.' },
          { id: 2, title: 'This is another one.' },
        ];

        nock('https://github.gitify.io/api/v3/')
          .get('/notifications?participating=false')
          .reply(200, notifications);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            detailedNotifications: false,
          });
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].hostname).toBe(
          'github.gitify.io',
        );
        expect(result.current.notifications[0].notifications.length).toBe(2);
      });

      it('should fetch notifications with failure - enterprise only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          token: null,
        };

        nock('https://github.gitify.io/api/v3/')
          .get('/notifications?participating=false')
          .replyWithError({
            code: AxiosError.ERR_BAD_REQUEST,
            response: {
              status: 400,
              data: {
                message: 'Oops! Something went wrong.',
              },
            },
          });

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.status).toBe('error');
        });
      });
    });

    describe('github.com', () => {
      it('should fetch notifications with success - github.com only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
          user: mockUser,
        };

        const notifications = [
          { id: 1, title: 'This is a notification.' },
          { id: 2, title: 'This is another one.' },
        ];

        nock('https://api.github.com')
          .get('/notifications?participating=false')
          .reply(200, notifications);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            detailedNotifications: false,
          });
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].hostname).toBe('api.github.com');
        expect(result.current.notifications[0].notifications.length).toBe(2);
      });

      it('should fetch notifications with failures - github.com only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
        };

        nock('https://api.github.com/')
          .get('/notifications?participating=false')
          .replyWithError({
            code: AxiosError.ERR_BAD_REQUEST,
            response: {
              status: 400,
              data: {
                message: 'Oops! Something went wrong.',
              },
            },
          });

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.status).toBe('error');
          expect(result.current.errorDetails).toBe(Errors.UNKNOWN);
        });
      });
    });

    describe('with detailed notifications', () => {
      it('should fetch notifications with success', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
          user: mockUser,
        };

        const notifications = [
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
          .reply(200, notifications);

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
          });
        nock('https://api.github.com')
          .get('/repos/gitify-app/notifications-test/issues/4/comments')
          .reply(200, {
            user: mockNotificationUser,
          });

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            detailedNotifications: true,
          });
        });

        expect(result.current.status).toBe('loading');

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].hostname).toBe('api.github.com');
        expect(result.current.notifications[0].notifications.length).toBe(6);
      });
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
        result.current.fetchNotifications(mockAccounts, {
          ...mockSettings,
          detailedNotifications: false,
        });
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      act(() => {
        result.current.removeNotificationFromState(
          mockSettings,
          result.current.notifications[0].notifications[0].id,
          result.current.notifications[0].hostname,
        );
      });

      expect(result.current.notifications[0].notifications.length).toBe(1);
    });
  });

  describe('markNotificationRead', () => {
    const id = 'notification-123';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it('should mark a notification as read with success - github.com', async () => {
        nock('https://api.github.com/')
          .patch(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationRead(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - github.com', async () => {
        nock('https://api.github.com/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationRead(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it('should mark a notification as read with success - enterprise', async () => {
        nock('https://github.gitify.io/api/v3')
          .patch(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationRead(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - enterprise', async () => {
        nock('https://github.gitify.io/api/v3')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationRead(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });

  describe('markNotificationDone', () => {
    const id = 'notification-123';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it('should mark a notification as done with success - github.com', async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as done with failure - github.com', async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it('should mark a notification as done with success - enterprise', async () => {
        nock('https://github.gitify.io/api/v3')
          .delete(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as done with failure - enterprise', async () => {
        nock('https://github.gitify.io/api/v3')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });

  describe('unsubscribeNotification', () => {
    const id = 'notification-123';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it('should unsubscribe from a notification with success - github.com', async () => {
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
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should unsubscribe from a notification with failure - github.com', async () => {
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
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it('should unsubscribe from a notification with success - enterprise', async () => {
        // The unsubscribe endpoint call.
        nock('https://github.gitify.io/api/v3')
          .put(`/notifications/threads/${id}/subscription`)
          .reply(200);

        // The mark read endpoint call.
        nock('https://github.gitify.io/api/v3')
          .patch(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.unsubscribeNotification(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should unsubscribe from a notification with failure - enterprise', async () => {
        // The unsubscribe endpoint call.
        nock('https://github.gitify.io/api/v3')
          .put(`/notifications/threads/${id}/subscription`)
          .reply(400);

        // The mark read endpoint call.
        nock('https://github.gitify.io/api/v3')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.unsubscribeNotification(
            accounts,
            mockSettings,
            id,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });

  describe('markRepoNotifications', () => {
    const repoSlug = 'gitify-app/notifications-test';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it("should mark a repository's notifications as read with success - github.com", async () => {
        nock('https://api.github.com/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - github.com", async () => {
        nock('https://api.github.com/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it("should mark a repository's notifications as read with success - enterprise", async () => {
        nock('https://github.gitify.io/api/v3')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - enterprise", async () => {
        nock('https://github.gitify.io/api/v3')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });

  describe('markRepoNotificationsDone', () => {
    const repoSlug = 'gitify-app/notifications-test';
    const id = 'notification-123';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it("should mark a repository's notifications as done with success - github.com", async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as done with failure - github.com", async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it("should mark a repository's notifications as done with success - enterprise", async () => {
        nock('https://github.gitify.io/api/v3')
          .delete(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as done with failure - enterprise", async () => {
        nock('https://github.gitify.io/api/v3')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            mockSettings,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });
});
