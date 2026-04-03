import { act, renderHook, waitFor } from '@testing-library/react';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import {
  mockGitHubCloudGitifyNotifications,
  mockGitifyNotification,
  mockMultipleAccountNotifications,
  mockSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';
import { mockAuth, mockSettings, mockState } from '../__mocks__/state-mocks';

import * as apiClient from '../utils/api/client';
import { Errors } from '../utils/core/errors';
import * as logger from '../utils/core/logger';
import * as notificationsUtils from '../utils/notifications/notifications';
import * as sound from '../utils/system/audio';
import * as native from '../utils/system/native';
import { useNotifications } from './useNotifications';

describe('renderer/hooks/useNotifications.ts', () => {
  let rendererLogErrorSpy: ReturnType<typeof vi.spyOn>;
  let raiseSoundNotificationSpy: ReturnType<typeof vi.spyOn>;
  let raiseNativeNotificationSpy: ReturnType<typeof vi.spyOn>;
  let getAllNotificationsSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();

    rendererLogErrorSpy = vi
      .spyOn(logger, 'rendererLogError')
      .mockImplementation(vi.fn());
    raiseSoundNotificationSpy = vi
      .spyOn(sound, 'raiseSoundNotification')
      .mockImplementation(vi.fn());
    raiseNativeNotificationSpy = vi
      .spyOn(native, 'raiseNativeNotification')
      .mockImplementation(vi.fn());
    getAllNotificationsSpy = vi
      .spyOn(notificationsUtils, 'getAllNotifications')
      .mockResolvedValue([]);

    // Reset mock notification state between tests since it's mutated
    // FIXME - isolate test data between tests
    mockGitifyNotification.unread = true;
  });

  describe('fetchNotifications', () => {
    it('should fetch non-detailed notifications with success', async () => {
      getAllNotificationsSpy.mockResolvedValue(
        mockMultipleAccountNotifications,
      );

      const mockStateNonDetailed = {
        auth: mockAuth,
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockStateNonDetailed);
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
      getAllNotificationsSpy.mockResolvedValue(mockSingleAccountNotifications);

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
      expect(result.current.notifications[0].notifications.length).toBe(1);
    });

    it('should fetch notifications with same failures', async () => {
      getAllNotificationsSpy.mockResolvedValue([
        {
          account: mockGitHubCloudAccount,
          notifications: [],
          error: Errors.BAD_CREDENTIALS,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [],
          error: Errors.BAD_CREDENTIALS,
        },
      ]);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.globalError).toBe(Errors.BAD_CREDENTIALS);
    });

    it('should fetch notifications with different failures', async () => {
      getAllNotificationsSpy.mockResolvedValue([
        {
          account: mockGitHubCloudAccount,
          notifications: [],
          error: Errors.UNKNOWN,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [],
          error: Errors.BAD_CREDENTIALS,
        },
      ]);

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(mockState);
      });

      expect(result.current.status).toBe('loading');

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.globalError).toBeUndefined();
    });

    it('should play sound when new notifications arrive and playSound is enabled', async () => {
      getAllNotificationsSpy.mockResolvedValue(mockSingleAccountNotifications);

      const stateWithSound = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: true,
          showNotifications: false,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithSound);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1);
      expect(raiseNativeNotificationSpy).not.toHaveBeenCalled();
    });

    it('should show native notification when new notifications arrive and showNotifications is enabled', async () => {
      getAllNotificationsSpy.mockResolvedValue(mockSingleAccountNotifications);

      const stateWithNotifications = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: false,
          showNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithNotifications);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).not.toHaveBeenCalled();
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should play sound and show notification when both are enabled', async () => {
      getAllNotificationsSpy.mockResolvedValue(mockSingleAccountNotifications);

      const stateWithBoth = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: true,
          showNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithBoth);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1);
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should not play sound or show notification when no new notifications', async () => {
      getAllNotificationsSpy.mockResolvedValue([]);

      const stateWithBoth = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          playSound: true,
          showNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithBoth);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).not.toHaveBeenCalled();
      expect(raiseNativeNotificationSpy).not.toHaveBeenCalled();
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark notifications as read with success', async () => {
      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark notifications as read with failure', async () => {
      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockRejectedValue(
        new Error('Bad request'),
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsRead(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should only mark specific notifications as read while keeping others unread', async () => {
      getAllNotificationsSpy.mockResolvedValue([
        {
          account: mockGitHubCloudAccount,
          notifications: [...mockGitHubCloudGitifyNotifications],
          error: null,
        },
      ]);

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const stateWithFetchRead = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          fetchReadNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      // First fetch notifications to populate the state
      act(() => {
        result.current.fetchNotifications(stateWithFetchRead);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].notifications.length).toBe(2);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        true,
      );
      expect(result.current.notifications[0].notifications[1].unread).toBe(
        true,
      );

      // Mark only the first notification as read
      act(() => {
        result.current.markNotificationsAsRead(stateWithFetchRead, [
          result.current.notifications[0].notifications[0],
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // First notification should be marked as read
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        false,
      );
      // Second notification should remain unread
      expect(result.current.notifications[0].notifications[1].unread).toBe(
        true,
      );
    });

    it('should only update notifications for the correct account when fetchReadNotifications is enabled', async () => {
      getAllNotificationsSpy.mockResolvedValue(
        mockMultipleAccountNotifications,
      );

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const stateWithMultipleAccounts = {
        auth: mockAuth,
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          fetchReadNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      // First fetch notifications to populate the state
      act(() => {
        result.current.fetchNotifications(stateWithMultipleAccounts);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(2);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        true,
      );
      expect(result.current.notifications[1].notifications[0].unread).toBe(
        true,
      );

      // Mark only the cloud notification as read
      act(() => {
        result.current.markNotificationsAsRead(
          stateWithMultipleAccounts,
          result.current.notifications[0].notifications,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Cloud notification should be marked as read
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        false,
      );
      // Enterprise notification should remain unread
      expect(result.current.notifications[1].notifications[0].unread).toBe(
        true,
      );
    });

    it('should keep notifications in list when fetchReadNotifications is enabled', async () => {
      getAllNotificationsSpy.mockResolvedValue(mockSingleAccountNotifications);

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const stateWithFetchRead = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
          fetchReadNotifications: true,
        },
      };

      const { result } = renderHook(() => useNotifications());

      // First fetch notifications to populate the state
      act(() => {
        result.current.fetchNotifications(stateWithFetchRead);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        true,
      );

      // Now mark as read with fetchReadNotifications enabled
      act(() => {
        result.current.markNotificationsAsRead(
          stateWithFetchRead,
          result.current.notifications[0].notifications,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Notifications should still be in the list but marked as read
      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].notifications.length).toBe(1);
      expect(result.current.notifications[0].notifications[0].unread).toBe(
        false,
      );
    });
  });

  describe('markNotificationsAsDone', () => {
    it('should mark notifications as done with success', async () => {
      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockGitifyNotification,
        ]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should not mark as done when account does not support the feature', async () => {
      // GitHub Enterprise Server without version doesn't support mark as done
      const mockEnterpriseNotification = {
        ...mockGitifyNotification,
        account: mockGitHubEnterpriseServerAccount, // No version set
      };

      const { result } = renderHook(() => useNotifications());

      // The API should NOT be called when account doesn't support the feature
      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockEnterpriseNotification,
        ]);
      });

      // Status should remain 'success' (not change to 'loading' since we return early)
      expect(result.current.status).toBe('success');
      // No API calls should have been made - nock will fail if unexpected calls are made
    });

    it('should mark notifications as done with failure', async () => {
      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockRejectedValue(
        new Error('Bad request'),
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.markNotificationsAsDone(mockState, [
          mockGitifyNotification,
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
    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = false', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined as any);

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          mockState,
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = true', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined as any);

      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings!,
              markAsDoneOnUnsubscribe: true,
            },
          },
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should unsubscribe from a notification with failure', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockRejectedValue(new Error('Bad request'));

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockRejectedValue(
        new Error('Bad request'),
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          mockState,
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should mark as done when markAsDoneOnUnsubscribe is true even with fetchReadNotifications enabled', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined as any);

      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings!,
              markAsDoneOnUnsubscribe: true,
              fetchReadNotifications: true,
            },
          },
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should mark as read when markAsDoneOnUnsubscribe is false and fetchReadNotifications is enabled', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined as any);

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.unsubscribeNotification(
          {
            ...mockState,
            settings: {
              ...mockState.settings!,
              markAsDoneOnUnsubscribe: false,
              fetchReadNotifications: true,
            },
          },
          mockGitifyNotification,
        );
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('removeAccountNotifications', () => {
    it('should remove notifications for a specific account', async () => {
      getAllNotificationsSpy.mockResolvedValue(mockSingleAccountNotifications);

      const stateWithSingleAccount = {
        auth: {
          accounts: [mockGitHubCloudAccount],
        },
        settings: {
          ...mockSettings,
          detailedNotifications: false,
        },
      };

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.fetchNotifications(stateWithSingleAccount);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(1);

      // Now remove the account notifications
      act(() => {
        result.current.removeAccountNotifications(mockGitHubCloudAccount);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications.length).toBe(0);
    });
  });
});
