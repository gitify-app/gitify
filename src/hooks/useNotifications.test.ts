import { vi } from 'vitest';

// Mock to use axios instead of Tauri HTTP plugin
vi.mock('../utils/environment', () => ({ isTauriEnvironment: () => false }));

// Mock decryptValue to return 'decrypted' for consistent test expectations
vi.mock('../utils/comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

import { act, renderHook, waitFor } from '@testing-library/react';

import axios from 'axios';
import nock from 'nock';

import { mockAuth, mockSettings, mockState } from '../__mocks__/state-mocks';
import { mockSingleNotification } from '../utils/api/__mocks__/response-mocks';
import { Errors } from '../utils/errors';
import * as logger from '../utils/logger';
import { useNotifications } from './useNotifications';

describe('renderer/hooks/useNotifications.ts', () => {
  const rendererLogErrorSpy = vi
    .spyOn(logger, 'rendererLogError')
    .mockImplementation();

  beforeEach(() => {
    // axios will default to using the XHR adapter which can't be intercepted
    // by nock. So, configure axios to use the node adapter.
    axios.defaults.adapter = 'http';
    rendererLogErrorSpy.mockReset();

    // Reset mock notification state between tests since it's mutated
    mockSingleNotification.unread = true;

    // Disable real network connections to catch unmocked requests
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
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

    it('should fetch notifications with same failures', async () => {
      const status = 401;
      const message = 'Bad credentials';

      nock('https://api.github.com')
        .get('/notifications?participating=false')
        .reply(status, { message });

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false')
        .reply(status, { message });

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

    it('should fetch notifications with different failures', async () => {
      nock('https://api.github.com')
        .get('/notifications?participating=false')
        .reply(400, { message: 'Oops! Something went wrong.' });

      nock('https://github.gitify.io/api/v3')
        .get('/notifications?participating=false')
        .reply(401, { message: 'Bad credentials' });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.globalError).toBeUndefined();
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read with success', async () => {
      nock('https://api.github.com')
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
      nock('https://api.github.com')
        .patch(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockSingleNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('markNotificationsAsDone', () => {
    it('should mark notifications as done with success', async () => {
      nock('https://api.github.com')
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
      nock('https://api.github.com')
        .delete(`/notifications/threads/${id}`)
        .reply(400);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockSingleNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribeNotification', () => {
    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = false', async () => {
      // The unsubscribe endpoint call.
      nock('https://api.github.com')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark read endpoint call.
      nock('https://api.github.com')
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
      nock('https://api.github.com')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(200);

      // The mark done endpoint call.
      nock('https://api.github.com')
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
            },
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
      nock('https://api.github.com')
        .put(`/notifications/threads/${id}/subscription`)
        .reply(400);

      // The mark read endpoint call (won't be called since unsubscribe fails first).
      nock('https://api.github.com')
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
        expect(result.current.status).toBe('error');
      });

      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
