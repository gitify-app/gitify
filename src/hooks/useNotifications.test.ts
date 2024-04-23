import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import nock from 'nock';

import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { mockedNotificationUser, mockedUser } from '../__mocks__/mockedData';
import type { AuthState } from '../types';
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
          result.current.fetchNotifications(mockAccounts, mockSettings);
        });

        expect(result.current.status).toBe('loading');

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].hostname).toBe(
          'github.gitify.io',
        );
        expect(result.current.notifications[1].hostname).toBe('github.com');
      });

      // TODO - continue refactoring the expect statements
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
          result.current.fetchNotifications(accounts, mockSettings);
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

        expect(result.current.errorDetails).toBe(Errors.UNKNOWN);
      });
    });

    describe('github.com', () => {
      it('should fetch notifications with success - github.com only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
          user: mockedUser,
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
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.notifications[0].hostname).toBe('github.com');
        });

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
        });

        expect(result.current.errorDetails).toBe(Errors.UNKNOWN);
      });
    });

    describe('with colors', () => {
      it('should fetch notifications with success - with colors', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
          user: mockedUser,
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
              full_name: 'some/repo',
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
              full_name: 'some/repo',
            },
            updated_at: '2024-02-26T00:00:00Z',
          },
          {
            id: 3,
            subject: {
              title: 'This is an Issue.',
              type: 'Issue',
              url: 'https://api.github.com/3',
              latest_comment_url: 'https://api.github.com/3/comments',
            },
            repository: {
              full_name: 'some/repo',
            },
          },
          {
            id: 4,
            subject: {
              title: 'This is a Pull Request.',
              type: 'PullRequest',
              url: 'https://api.github.com/4',
              latest_comment_url: 'https://api.github.com/4/comments',
            },
            repository: {
              full_name: 'some/repo',
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
              full_name: 'some/repo',
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
              full_name: 'some/repo',
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
                    viewerSubscription: 'SUBSCRIBED',
                    stateReason: null,
                    isAnswered: true,
                    url: 'https://github.com/manosim/notifications-test/discussions/612',
                    author: {
                      login: 'discussion-creator',
                      url: 'https://github.com/discussion-creator',
                      avatar_url:
                        'https://avatars.githubusercontent.com/u/1?v=4',
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

        nock('https://api.github.com').get('/3').reply(200, {
          state: 'closed',
          merged: true,
          user: mockedNotificationUser,
        });
        nock('https://api.github.com').get('/3/comments').reply(200, {
          user: mockedNotificationUser,
        });
        nock('https://api.github.com').get('/4').reply(200, {
          state: 'closed',
          merged: false,
          user: mockedNotificationUser,
        });
        nock('https://api.github.com').get('/4/comments').reply(200, {
          user: mockedNotificationUser,
        });

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            detailedNotifications: true,
          });
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].notifications.length).toBe(6);
      });
    });

    describe('showBots', () => {
      it('should hide bot notifications when set to false', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
          user: mockedUser,
        };

        const notifications = [
          {
            id: 1,
            subject: {
              title: 'This is an Issue.',
              type: 'Issue',
              url: 'https://api.github.com/1',
              latest_comment_url: null,
            },
            repository: {
              full_name: 'some/repo',
            },
          },
          {
            id: 2,
            subject: {
              title: 'This is a Pull Request.',
              type: 'PullRequest',
              url: 'https://api.github.com/2',
              latest_comment_url: null,
            },
            repository: {
              full_name: 'some/repo',
            },
          },
        ];

        nock('https://api.github.com')
          .get('/notifications?participating=false')
          .reply(200, notifications);
        nock('https://api.github.com')
          .get('/1')
          .reply(200, {
            state: 'closed',
            merged: true,
            user: {
              login: 'some-user',
              type: 'User',
            },
          });
        nock('https://api.github.com')
          .get('/2')
          .reply(200, {
            state: 'closed',
            merged: false,
            user: {
              login: 'some-bot',
              type: 'Bot',
            },
          });

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            detailedNotifications: true,
            showBots: false,
          });
        });

        await waitFor(() => {
          expect(result.current.status).toBe('success');
        });

        expect(result.current.notifications[0].notifications.length).toBe(1);
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
        result.current.fetchNotifications(mockAccounts, mockSettings);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      act(() => {
        result.current.removeNotificationFromState(
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
          result.current.markNotificationRead(accounts, id, hostname);
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
          result.current.markNotificationRead(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it('should mark a notification as read with success - enterprise', async () => {
        nock('https://github.gitify.io/')
          .patch(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationRead(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - enterprise', async () => {
        nock('https://github.gitify.io/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationRead(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
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
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as done with failure - github.com', async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it('should mark a notification as done with success - enterprise', async () => {
        nock('https://github.gitify.io/')
          .delete(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as done with failure - enterprise', async () => {
        nock('https://github.gitify.io/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
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
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
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
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it('should unsubscribe from a notification with success - enterprise', async () => {
        // The unsubscribe endpoint call.
        nock('https://github.gitify.io/')
          .put(`/notifications/threads/${id}/subscription`)
          .reply(200);

        // The mark read endpoint call.
        nock('https://github.gitify.io/')
          .patch(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should unsubscribe from a notification with failure - enterprise', async () => {
        // The unsubscribe endpoint call.
        nock('https://github.gitify.io/')
          .put(`/notifications/threads/${id}/subscription`)
          .reply(400);

        // The mark read endpoint call.
        nock('https://github.gitify.io/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });

  describe('markRepoNotifications', () => {
    const repoSlug = 'manosim/gitify';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it("should mark a repository's notifications as read with success - github.com", async () => {
        nock('https://api.github.com/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - github.com", async () => {
        nock('https://api.github.com/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it("should mark a repository's notifications as read with success - enterprise", async () => {
        nock('https://github.gitify.io/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - enterprise", async () => {
        nock('https://github.gitify.io/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });

  describe('markRepoNotificationsDone', () => {
    const repoSlug = 'manosim/gitify';
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
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
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
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });

    describe('enterprise', () => {
      const accounts = { ...mockAccounts, token: null };
      const hostname = 'github.gitify.io';

      it("should mark a repository's notifications as done with success - enterprise", async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as done with failure - enterprise", async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications());

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.status).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });
});
