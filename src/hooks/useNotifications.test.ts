import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import nock from 'nock';

import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { mockedUser } from '../__mocks__/mockedData';
import { AuthState } from '../types';
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.fetchNotifications(mockAccounts, mockSettings);
        });

        expect(result.current.isFetching).toBe(true);

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications[0].hostname).toBe(
          'github.gitify.io',
        );
        expect(result.current.notifications[1].hostname).toBe('github.com');
      });

      it('should fetch notifications with failure - github.com & enterprise', async () => {
        const message = 'Oops! Something went wrong.';

        nock('https://api.github.com/')
          .get('/notifications?participating=false')
          .reply(400, { message });

        nock('https://github.gitify.io/api/v3/')
          .get('/notifications?participating=false')
          .reply(400, { message });

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.fetchNotifications(mockAccounts, mockSettings);
        });

        expect(result.current.isFetching).toBe(true);

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.requestFailed).toBe(true);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.notifications[0].hostname).toBe(
            'github.gitify.io',
          );
        });

        expect(result.current.notifications[0].notifications.length).toBe(2);
      });

      it('should fetch notifications with failure - enterprise only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          token: null,
        };

        nock('https://github.gitify.io/api/v3/')
          .get('/notifications?participating=false')
          .reply(400, { message: 'Oops! Something went wrong.' });

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.requestFailed).toBe(true);
        });
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.notifications[0].hostname).toBe('github.com');
        });

        expect(result.current.notifications[0].notifications.length).toBe(2);
      });

      it('should fetch notifications with failure - github.com only', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
        };

        nock('https://api.github.com/')
          .get('/notifications?participating=false')
          .reply(400, { message: 'Oops! Something went wrong.' });

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitFor(() => {
          expect(result.current.requestFailed).toBe(true);
        });
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
              url: 'https://api.github.com/1',
            },
            repository: {
              full_name: 'some/repo',
            },
            updated_at: '2024-02-26T00:00:00Z',
          },
          {
            id: 2,
            subject: {
              title: 'This is a Discussion.',
              type: 'Discussion',
              url: 'https://api.github.com/2',
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
          },
          {
            id: 4,
            subject: {
              title: 'This is a Pull Request.',
              type: 'PullRequest',
              url: 'https://api.github.com/4',
              latest_comment_url: 'https://api.github.com/4/comments',
            },
          },
          {
            id: 5,
            subject: {
              title: 'This is an invitation.',
              type: 'RepositoryInvitation',
              url: 'https://api.github.com/5',
            },
          },
          {
            id: 6,
            subject: {
              title: 'This is a workflow run.',
              type: 'WorkflowRun',
              url: 'https://api.github.com/6',
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
                    comments: {
                      nodes: [
                        {
                          databaseId: 2297637,
                          createdAt: '2022-03-04T20:39:44Z',
                          author: {
                            login: 'comment-user',
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
          .get('/3')
          .reply(200, {
            state: 'closed',
            merged: true,
            user: {
              login: 'some-user',
              html_url: 'https://github.com/some-user',
            },
          });
        nock('https://api.github.com')
          .get('/3/comments')
          .reply(200, {
            user: {
              login: 'some-commenter',
              html_url: 'https://github.com/some-commenter',
            },
          });
        nock('https://api.github.com')
          .get('/4')
          .reply(200, {
            state: 'closed',
            merged: false,
            user: {
              login: 'some-user',
              html_url: 'https://github.com/some-user',
            },
          });
        nock('https://api.github.com')
          .get('/4/comments')
          .reply(200, {
            user: {
              login: 'some-commenter',
              html_url: 'https://github.com/some-commenter',
            },
          });

        const { result } = renderHook(() => useNotifications(true));

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            colors: true,
          });
        });

        expect(result.current.isFetching).toBe(true);

        await waitFor(() => {
          expect(result.current.notifications[0].hostname).toBe('github.com');
        });

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

      const { result } = renderHook(() => useNotifications(false));

      act(() => {
        result.current.fetchNotifications(mockAccounts, mockSettings);
      });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
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

  describe('markNotification', () => {
    const id = 'notification-123';

    describe('github.com', () => {
      const accounts = { ...mockAccounts, enterpriseAccounts: [] };
      const hostname = 'github.com';

      it('should mark a notification as read with success - github.com', async () => {
        nock('https://api.github.com/')
          .patch(`/notifications/threads/${id}`)
          .reply(200);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - github.com', async () => {
        nock('https://api.github.com/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - enterprise', async () => {
        nock('https://github.gitify.io/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as done with failure - github.com', async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as done with failure - enterprise', async () => {
        nock('https://github.gitify.io/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markNotificationDone(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - github.com", async () => {
        nock('https://api.github.com/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - enterprise", async () => {
        nock('https://github.gitify.io/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as done with failure - github.com", async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
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

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as done with failure - enterprise", async () => {
        nock('https://api.github.com/')
          .delete(`/notifications/threads/${id}`)
          .reply(400);

        const { result } = renderHook(() => useNotifications(false));

        act(() => {
          result.current.markRepoNotificationsDone(
            accounts,
            repoSlug,
            hostname,
          );
        });

        await waitFor(() => {
          expect(result.current.isFetching).toBe(false);
        });

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });
});
