import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import {
  mockGitifyNotification,
  mockMultipleAccountNotifications,
  mockSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';

import { useAccountsStore, useFiltersStore, useSettingsStore } from '../stores';

import type { AccountNotifications, Percentage } from '../types';

import { Errors } from '../utils/core/errors';
import * as logger from '../utils/core/logger';
import { getAdapter } from '../utils/forges/registry';
import * as notificationsUtils from '../utils/notifications/notifications';
import * as audio from '../utils/system/audio';
import * as native from '../utils/system/native';
import { useNotifications } from './useNotifications';

vi.mock('../utils/notifications/notifications', async () => {
  const actual = await vi.importActual<typeof import('../utils/notifications/notifications')>(
    '../utils/notifications/notifications',
  );
  return {
    ...actual,
    getAllNotifications: vi.fn(),
  };
});

const getAllNotificationsMock = vi.mocked(notificationsUtils.getAllNotifications);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const renderNotificationsHook = () =>
  renderHook(() => useNotifications(), { wrapper: createWrapper() });

describe('renderer/hooks/useNotifications.ts', () => {
  const githubAdapter = getAdapter('github');

  const rendererLogErrorSpy = vi.spyOn(logger, 'rendererLogError').mockImplementation(vi.fn());

  const raiseSoundNotificationSpy = vi
    .spyOn(audio, 'raiseSoundNotification')
    .mockImplementation(vi.fn());

  const raiseNativeNotificationSpy = vi
    .spyOn(native, 'raiseNativeNotification')
    .mockImplementation(vi.fn());

  beforeEach(() => {
    rendererLogErrorSpy.mockClear();
    raiseSoundNotificationSpy.mockClear();
    raiseNativeNotificationSpy.mockClear();
    getAllNotificationsMock.mockReset();

    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

    // Reset mock notification state between tests since it's mutated
    mockGitifyNotification.unread = true;
  });

  describe('fetching notifications', () => {
    it('fetches notifications and exposes counts', async () => {
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();

      await waitFor(() => expect(result.current.status).toBe('success'));

      expect(getAllNotificationsMock).toHaveBeenCalledTimes(1);
      expect(result.current.notifications).toEqual(mockSingleAccountNotifications);
      expect(result.current.notificationCount).toBe(1);
      expect(result.current.unreadNotificationCount).toBe(1);
      expect(result.current.hasNotifications).toBe(true);
      expect(result.current.hasUnreadNotifications).toBe(true);
      expect(result.current.globalError).toBeUndefined();
    });

    it('applies and loosens filters instantly from the cache without refetching', async () => {
      // Two cloud notifications with reasons 'subscribed' and 'author'
      getAllNotificationsMock.mockResolvedValue([mockMultipleAccountNotifications[0]]);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.notificationCount).toBe(2));

      // Narrowing: only the 'author' notification remains visible
      act(() => {
        useFiltersStore.setState({ reasons: ['author'] });
      });
      await waitFor(() => expect(result.current.notificationCount).toBe(1));

      // Loosening: the hidden notification reappears from the cache
      act(() => {
        useFiltersStore.getState().reset();
      });
      await waitFor(() => expect(result.current.notificationCount).toBe(2));

      expect(getAllNotificationsMock).toHaveBeenCalledTimes(1);
    });

    it('sets error status and global error when all accounts share the same error', async () => {
      const erroredNotifications: AccountNotifications[] = [
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
      ];
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
      getAllNotificationsMock.mockResolvedValue(erroredNotifications);

      const { result } = renderNotificationsHook();

      await waitFor(() => expect(result.current.status).toBe('error'));

      expect(result.current.globalError).toBe(Errors.BAD_CREDENTIALS);
    });

    it('sets error status without global error when account errors differ', async () => {
      const erroredNotifications: AccountNotifications[] = [
        {
          account: mockGitHubCloudAccount,
          notifications: [],
          error: Errors.BAD_CREDENTIALS,
        },
        {
          account: mockGitHubEnterpriseServerAccount,
          notifications: [],
          error: Errors.RATE_LIMITED,
        },
      ];
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
      getAllNotificationsMock.mockResolvedValue(erroredNotifications);

      const { result } = renderNotificationsHook();

      await waitFor(() => expect(result.current.status).toBe('error'));

      expect(result.current.globalError).toBeUndefined();
    });
  });

  describe('sound and native notifications', () => {
    it('raises sound and native notifications for new notifications', async () => {
      useSettingsStore.setState({
        playSound: true,
        showNotifications: true,
        notificationVolume: 20 as Percentage,
      });
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();

      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await waitFor(() => expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1));
      expect(raiseSoundNotificationSpy).toHaveBeenCalledWith(20);
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('does not raise sound or native notifications when disabled', async () => {
      useSettingsStore.setState({
        playSound: false,
        showNotifications: false,
      });
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();

      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      expect(raiseSoundNotificationSpy).not.toHaveBeenCalled();
      expect(raiseNativeNotificationSpy).not.toHaveBeenCalled();
    });
  });

  describe('markNotificationsAsRead', () => {
    it('marks notifications as read via the forge adapter and removes them', async () => {
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsRead([mockGitifyNotification]);
      });

      expect(markThreadAsReadSpy).toHaveBeenCalledTimes(1);
      expect(markThreadAsReadSpy).toHaveBeenCalledWith(
        mockGitifyNotification.account,
        mockGitifyNotification.id,
      );
      await waitFor(() => expect(result.current.notificationCount).toBe(0));
    });

    it('logs an error when marking as read fails', async () => {
      vi.spyOn(githubAdapter, 'markThreadAsRead').mockRejectedValue(new Error('boom'));
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsRead([mockGitifyNotification]).catch(() => {});
      });

      expect(rendererLogErrorSpy).toHaveBeenCalled();
    });
  });

  describe('markNotificationsAsDone', () => {
    it('marks notifications as done via the forge adapter', async () => {
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter, 'markThreadAsDone')
        .mockResolvedValue(undefined);
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsDone([mockGitifyNotification]);
      });

      expect(markThreadAsDoneSpy).toHaveBeenCalledTimes(1);
      expect(markThreadAsDoneSpy).toHaveBeenCalledWith(
        mockGitifyNotification.account,
        mockGitifyNotification.id,
      );
      await waitFor(() => expect(result.current.notificationCount).toBe(0));
    });

    it('falls back to mark as read when the forge does not support done', async () => {
      const markAsDoneCapabilitySpy = vi
        .spyOn(githubAdapter.capabilities, 'markAsDone')
        .mockReturnValue(false);
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter, 'markThreadAsDone')
        .mockResolvedValue(undefined);
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsDone([mockGitifyNotification]);
      });

      expect(markAsDoneCapabilitySpy).toHaveBeenCalled();
      expect(markThreadAsDoneSpy).not.toHaveBeenCalled();
      expect(markThreadAsReadSpy).toHaveBeenCalledTimes(1);

      markAsDoneCapabilitySpy.mockRestore();
    });
  });

  describe('unsubscribeNotification', () => {
    it('unsubscribes and marks as read by default', async () => {
      const unsubscribeThreadSpy = vi
        .spyOn(githubAdapter, 'unsubscribeThread')
        .mockResolvedValue(undefined);
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter, 'markThreadAsDone')
        .mockResolvedValue(undefined);
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      expect(unsubscribeThreadSpy).toHaveBeenCalledWith(
        mockGitifyNotification.account,
        mockGitifyNotification.id,
      );
      expect(markThreadAsReadSpy).toHaveBeenCalledTimes(1);
      expect(markThreadAsDoneSpy).not.toHaveBeenCalled();
    });

    it('unsubscribes and marks as done when markAsDoneOnUnsubscribe is enabled', async () => {
      useSettingsStore.setState({ markAsDoneOnUnsubscribe: true });

      const unsubscribeThreadSpy = vi
        .spyOn(githubAdapter, 'unsubscribeThread')
        .mockResolvedValue(undefined);
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter, 'markThreadAsDone')
        .mockResolvedValue(undefined);
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      expect(unsubscribeThreadSpy).toHaveBeenCalledTimes(1);
      expect(markThreadAsDoneSpy).toHaveBeenCalledTimes(1);
      expect(markThreadAsReadSpy).not.toHaveBeenCalled();
    });
  });

  describe('removeAccountNotifications', () => {
    it('removes all notifications for an account from the cache', async () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
      getAllNotificationsMock.mockResolvedValue(mockMultipleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      const enterpriseCount = mockMultipleAccountNotifications[1].notifications.length;

      await act(async () => {
        await result.current.removeAccountNotifications(mockGitHubCloudAccount);
      });

      await waitFor(() => expect(result.current.notificationCount).toBe(enterpriseCount));
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].account).toEqual(mockGitHubEnterpriseServerAccount);
    });
  });
});
