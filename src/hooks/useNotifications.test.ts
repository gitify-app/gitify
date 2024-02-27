import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import nock from 'nock';

import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { mockedDiscussionNotifications, mockedUser } from '../__mocks__/mockedData';
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
              title: 'This is a notification.',
              type: 'Issue',
              url: 'https://api.github.com/1',
            },
          },
          {
            id: 2,
            subject: {
              title: 'A merged PR.',
              type: 'PullRequest',
              url: 'https://api.github.com/2',
            },
          },
          {
            id: 3,
            subject: {
              title: 'A closed PR.',
              type: 'PullRequest',
              url: 'https://api.github.com/3',
            },
          },
          {
            id: 4,
            subject: {
              title: 'A draft PR.',
              type: 'PullRequest',
              url: 'https://api.github.com/4',
            },
          },
          {
            id: 5,
            subject: {
              title: 'A draft PR.',
              type: 'PullRequest',
              url: 'https://api.github.com/5',
            },
          },
        ];

        nock('https://api.github.com')
          .get('/notifications?participating=false')
          .reply(200, notifications);

        nock('https://api.github.com').get('/1').reply(200, { state: 'open' });
        nock('https://api.github.com')
          .get('/2')
          .reply(200, { state: 'closed', merged: true });
        nock('https://api.github.com')
          .get('/3')
          .reply(200, { state: 'closed', merged: false });
        nock('https://api.github.com')
          .get('/4')
          .reply(200, { state: 'open', draft: false });
        nock('https://api.github.com')
          .get('/5')
          .reply(200, { state: 'open', draft: true });

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

        expect(result.current.notifications[0].notifications.length).toBe(5);
        expect(
          result.current.notifications[0].notifications[0].subject.state,
        ).toBe('open');
        expect(
          result.current.notifications[0].notifications[1].subject.state,
        ).toBe('merged');
        expect(
          result.current.notifications[0].notifications[2].subject.state,
        ).toBe('closed');
        expect(
          result.current.notifications[0].notifications[3].subject.state,
        ).toBe('open');
        expect(
          result.current.notifications[0].notifications[4].subject.state,
        ).toBe('draft');
      });

      it('should fetch discussion notifications with success - with colors', async () => {
        const accounts: AuthState = {
          ...mockAccounts,
          enterpriseAccounts: [],
          user: mockedUser,
        };

        nock('https://api.github.com')
          .get('/notifications?participating=false')
          .reply(200, mockedDiscussionNotifications);

        nock('https://api.github.com')
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'This is an answered discussion',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: null,
                      isAnswered: true,
                    },
                  },
                ],
              },
            },
          })
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'This is a duplicate discussion',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: 'DUPLICATE',
                      isAnswered: false,
                    },
                  },
                ],
              },
            },
          })
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'This is an open discussion',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: null,
                      isAnswered: false,
                    },
                  },
                  {
                    node: {
                      title: 'This is an open discussion',
                      viewerSubscription: 'IGNORED',
                      stateReason: null,
                      isAnswered: false,
                    },
                  },
                ],
              },
            },
          })
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'This is nm outdated discussion',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: 'OUTDATED',
                      isAnswered: false,
                    },
                  },
                ],
              },
            },
          })
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'This is a reopened discussion',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: 'REOPENED',
                      isAnswered: false,
                    },
                  },
                ],
              },
            },
          })
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'This is a resolved discussion',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: 'RESOLVED',
                      isAnswered: false,
                    },
                  },
                ],
              },
            },
          })
          .post('/graphql')
          .reply(200, {
            data: {
              search: {
                edges: [
                  {
                    node: {
                      title: 'unknown search result',
                      viewerSubscription: 'SUBSCRIBED',
                      stateReason: null,
                      isAnswered: false,
                    },
                  },
                ],
              },
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

        const resultNotifications = result.current.notifications[0];

        expect(resultNotifications.notifications.length).toBe(7);
        expect(resultNotifications.notifications[0].subject.state).toBe(
          'ANSWERED',
        );
        expect(resultNotifications.notifications[1].subject.state).toBe(
          'DUPLICATE',
        );
        expect(resultNotifications.notifications[2].subject.state).toBe('OPEN');
        expect(resultNotifications.notifications[3].subject.state).toBe(
          'OUTDATED',
        );
        expect(resultNotifications.notifications[4].subject.state).toBe(
          'REOPENED',
        );
        expect(resultNotifications.notifications[5].subject.state).toBe(
          'RESOLVED',
        );
        expect(resultNotifications.notifications[6].subject.state).toBe('OPEN');
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
