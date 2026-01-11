import { vi } from 'vitest';

// Mock decryptValue to return 'decrypted' for consistent test expectations
vi.mock('../utils/comms', () => ({
  decryptValue: vi.fn().mockResolvedValue('decrypted'),
}));

import { act, renderHook, waitFor } from '@testing-library/react';

import {
  createMockResponse,
  fetch,
} from '../__mocks__/@tauri-apps/plugin-http';
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
    vi.clearAllMocks();
    rendererLogErrorSpy.mockReset();

    // Reset mock notification state between tests since it's mutated
    mockSingleNotification.unread = true;

    // Default mock response
    fetch.mockResolvedValue(createMockResponse({}));
  });

  const id = mockSingleNotification.id;

  describe('fetchNotifications', () => {
    it('should fetch non-detailed notifications with success', async () => {
      const mockStateLocal = {
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

      // Mock both account API calls - github.com and github.gitify.io
      fetch
        .mockResolvedValueOnce(createMockResponse(notifications))
        .mockResolvedValueOnce(createMockResponse(notifications));

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockStateLocal);
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

      // Mock both account API calls to fail
      fetch
        .mockResolvedValueOnce(
          createMockResponse({ message }, { status, statusText: 'Unauthorized' }),
        )
        .mockResolvedValueOnce(
          createMockResponse({ message }, { status, statusText: 'Unauthorized' }),
        );

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
      // Mock API calls with different failure statuses
      fetch
        .mockResolvedValueOnce(
          createMockResponse(
            { message: 'Oops! Something went wrong.' },
            { status: 400, statusText: 'Bad Request' },
          ),
        )
        .mockResolvedValueOnce(
          createMockResponse(
            { message: 'Bad credentials' },
            { status: 401, statusText: 'Unauthorized' },
          ),
        );

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
      fetch.mockResolvedValueOnce(createMockResponse({}));

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
      fetch.mockResolvedValueOnce(
        createMockResponse({}, { status: 400, statusText: 'Bad Request' }),
      );

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
      fetch.mockResolvedValueOnce(createMockResponse({}));

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
      fetch.mockResolvedValueOnce(
        createMockResponse({}, { status: 400, statusText: 'Bad Request' }),
      );

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
      // The unsubscribe endpoint call, then mark read
      fetch
        .mockResolvedValueOnce(createMockResponse({}))
        .mockResolvedValueOnce(createMockResponse({}));

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
      // The unsubscribe endpoint call, then mark done
      fetch
        .mockResolvedValueOnce(createMockResponse({}))
        .mockResolvedValueOnce(createMockResponse({}));

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
      // The unsubscribe endpoint call fails
      fetch.mockResolvedValueOnce(
        createMockResponse({}, { status: 400, statusText: 'Bad Request' }),
      );

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
