import axios from 'axios';
import nock from 'nock';
import { act, renderHook } from '@testing-library/react-hooks';

import { mockAccounts, mockSettings } from '../__mocks__/mock-state';
import { useNotifications } from './useNotifications';
import { AuthState } from '../types';
import { mockedUser } from '../__mocks__/mockedData';

describe('hooks/useNotifications.ts', () => {
  beforeEach(() => {
    axios.defaults.adapter = require('axios/lib/adapters/http');
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.fetchNotifications(mockAccounts, mockSettings);
        });

        expect(result.current.isFetching).toBe(true);

        await waitForNextUpdate();

        expect(result.current.isFetching).toBe(false);
        expect(result.current.notifications[0].hostname).toBe(
          'github.gitify.io'
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.fetchNotifications(mockAccounts, mockSettings);
        });

        expect(result.current.isFetching).toBe(true);

        await waitForNextUpdate();

        expect(result.current.isFetching).toBe(false);
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitForNextUpdate();

        expect(result.current.notifications[0].hostname).toBe(
          'github.gitify.io'
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
          .reply(400, { message: 'Oops! Something went wrong.' });

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitForNextUpdate();

        expect(result.current.requestFailed).toBe(true);
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitForNextUpdate();

        expect(result.current.notifications[0].hostname).toBe('github.com');
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.fetchNotifications(accounts, mockSettings);
        });

        await waitForNextUpdate();

        expect(result.current.requestFailed).toBe(true);
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
            title: 'This is a notification.',
            subject: { type: 'Issue', url: 'https://api.github.com/1' },
          },
          {
            id: 2,
            title: 'A merged PR.',
            subject: { type: 'PullRequest', url: 'https://api.github.com/2' },
          },
          {
            id: 3,
            title: 'A closed PR.',
            subject: { type: 'PullRequest', url: 'https://api.github.com/3' },
          },
          {
            id: 4,
            title: 'A draft PR.',
            subject: { type: 'PullRequest', url: 'https://api.github.com/4' },
          },
          {
            id: 5,
            title: 'A draft PR.',
            subject: { type: 'PullRequest', url: 'https://api.github.com/5' },
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(true)
        );

        act(() => {
          result.current.fetchNotifications(accounts, {
            ...mockSettings,
            colors: true,
          });
        });

        expect(result.current.isFetching).toBe(true);

        await waitForNextUpdate();

        expect(result.current.notifications[0].hostname).toBe('github.com');
        expect(result.current.notifications[0].notifications.length).toBe(5);
        expect(
          result.current.notifications[0].notifications[0].subject.state
        ).toBe('open');
        expect(
          result.current.notifications[0].notifications[1].subject.state
        ).toBe('merged');
        expect(
          result.current.notifications[0].notifications[2].subject.state
        ).toBe('closed');
        expect(
          result.current.notifications[0].notifications[3].subject.state
        ).toBe('open');
        expect(
          result.current.notifications[0].notifications[4].subject.state
        ).toBe('draft');
      });
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitForNextUpdate();

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - github.com', async () => {
        nock('https://api.github.com/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitForNextUpdate();

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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitForNextUpdate();

        expect(result.current.notifications.length).toBe(0);
      });

      it('should mark a notification as read with failure - enterprise', async () => {
        nock('https://github.gitify.io/')
          .patch(`/notifications/threads/${id}`)
          .reply(400);

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markNotification(accounts, id, hostname);
        });

        await waitForNextUpdate();

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

        const { result, waitForValueToChange } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitForValueToChange(() => {
          return result.current.isFetching;
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

        const { result, waitForValueToChange } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitForValueToChange(() => {
          return result.current.isFetching;
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

        const { result, waitForValueToChange } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitForValueToChange(() => {
          return result.current.isFetching;
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

        const { result, waitForValueToChange } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.unsubscribeNotification(accounts, id, hostname);
        });

        await waitForValueToChange(() => {
          return result.current.isFetching;
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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitForNextUpdate();

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - github.com", async () => {
        nock('https://api.github.com/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitForNextUpdate();

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

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitForNextUpdate();

        expect(result.current.notifications.length).toBe(0);
      });

      it("should mark a repository's notifications as read with failure - enterprise", async () => {
        nock('https://github.gitify.io/')
          .put(`/repos/${repoSlug}/notifications`)
          .reply(400);

        const { result, waitForNextUpdate } = renderHook(() =>
          useNotifications(false)
        );

        act(() => {
          result.current.markRepoNotifications(accounts, repoSlug, hostname);
        });

        await waitForNextUpdate();

        expect(result.current.notifications.length).toBe(0);
      });
    });
  });
});
