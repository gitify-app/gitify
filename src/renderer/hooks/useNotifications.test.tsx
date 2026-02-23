import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { DeepPartial } from '../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';
import {
  mockGitifyNotification,
  mockMultipleAccountNotifications,
  mockSingleAccountNotifications,
} from '../__mocks__/notifications-mocks';

import { useAccountsStore, useSettingsStore } from '../stores';

import type { AccountNotifications } from '../types';
import type { ListNotificationsForAuthenticatedUserResponse } from '../utils/api/types';

import * as apiClient from '../utils/api/client';
import { notificationsKeys } from '../utils/api/queryKeys';
import * as logger from '../utils/logger';
import * as native from '../utils/notifications/native';
import * as sound from '../utils/notifications/sound';
import { useNotifications } from './useNotifications';

const createWrapper = (initialData?: AccountNotifications[]) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
      },
    },
  });

  // Seed the notifications query for all combinations of fetchRead/participating
  // to avoid timing/order issues in tests. Tests can still overwrite as needed.
  if (initialData) {
    const accountsLength = useAccountsStore.getState().accounts.length;
    [false, true].forEach((fetchRead) => {
      [false, true].forEach((participating) => {
        queryClient.setQueryData(
          notificationsKeys.list(accountsLength, fetchRead, participating),
          initialData,
        );
      });
    });
  }

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('renderer/hooks/useNotifications.ts', () => {
  const rendererLogErrorSpy = vi
    .spyOn(logger, 'rendererLogError')
    .mockImplementation(vi.fn());

  const raiseSoundNotificationSpy = vi
    .spyOn(sound, 'raiseSoundNotification')
    .mockImplementation(vi.fn());

  const raiseNativeNotificationSpy = vi
    .spyOn(native, 'raiseNativeNotification')
    .mockImplementation(vi.fn());

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock notification state between tests since it's mutated
    // FIXME - isolate test data between tests
    mockGitifyNotification.unread = true;
  });

  describe('fetchNotifications', () => {
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

    const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
      [
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

    it('should fetch non-detailed notifications with success', async () => {
      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockMultipleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].account.hostname).toBe(
        'github.com',
      );
      expect(result.current.notifications[0].notifications.length).toBe(6);
    });

    it('should fetch detailed notifications with success', async () => {
      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      vi.spyOn(apiClient, 'fetchNotificationDetailsForList').mockResolvedValue(
        new Map(),
      );

      useSettingsStore.setState({
        detailedNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.notifications[0].account.hostname).toBe(
        'github.com',
      );
      expect(result.current.notifications[0].notifications.length).toBe(6);
    });

    it('should play sound when new notifications arrive and playSound is enabled', async () => {
      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        playSound: true,
        showNotifications: false,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1);
      expect(raiseNativeNotificationSpy).not.toHaveBeenCalled();
    });

    it('should show native notification when new notifications arrive and showNotifications is enabled', async () => {
      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        playSound: false,
        showNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).not.toHaveBeenCalled();
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should play sound and show notification when both are enabled', async () => {
      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        playSound: true,
        showNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(raiseSoundNotificationSpy).toHaveBeenCalledTimes(1);
      expect(raiseNativeNotificationSpy).toHaveBeenCalledTimes(1);
    });

    it('should not play sound or show notification when no new notifications', async () => {
      // Return empty notifications - no new notifications to trigger sound/native
      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        [] satisfies Partial<ListNotificationsForAuthenticatedUserResponse>,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        playSound: true,
        showNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
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

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await act(async () => {
        await result.current.markNotificationsAsRead([mockGitifyNotification]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
    });

    it('should mark notifications as read with failure', async () => {
      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockRejectedValue(
        new Error('Bad request'),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await act(async () => {
        await result.current.markNotificationsAsRead([mockGitifyNotification]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should only mark specific notifications as read while keeping others unread', async () => {
      const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '1',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'First notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
          {
            id: '2',
            unread: true,
            updated_at: '2024-01-02T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Second notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        fetchReadNotifications: true,
      });

      // Ensure accounts store contains both accounts so the hook fetches for both
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
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
      await act(async () => {
        await result.current.markNotificationsAsRead([
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
      const mockCloudNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '1',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Cloud notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      const mockEnterpriseNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: '2',
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Enterprise notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'enterprise-test',
              full_name: 'myorg/enterprise-test',
              html_url: 'https://github.gitify.io/myorg/enterprise-test',
              owner: {
                login: 'myorg',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      vi.spyOn(apiClient, 'listNotificationsForAuthenticatedUser')
        .mockResolvedValueOnce(
          mockCloudNotifications as ListNotificationsForAuthenticatedUserResponse,
        )
        .mockResolvedValueOnce(
          mockEnterpriseNotifications as ListNotificationsForAuthenticatedUserResponse,
        );

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        fetchReadNotifications: true,
      });

      // Ensure accounts store contains both accounts so the hook fetches for both
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockMultipleAccountNotifications),
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
      await act(async () => {
        await result.current.markNotificationsAsRead(
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
      const mockNotifications: DeepPartial<ListNotificationsForAuthenticatedUserResponse> =
        [
          {
            id: mockGitifyNotification.id,
            unread: true,
            updated_at: '2024-01-01T00:00:00Z',
            reason: 'subscribed',
            subject: {
              title: 'Test notification',
              type: 'Issue',
              url: null,
              latest_comment_url: null,
            },
            repository: {
              name: 'notifications-test',
              full_name: 'gitify-app/notifications-test',
              html_url: 'https://github.com/gitify-app/notifications-test',
              owner: {
                login: 'gitify-app',
                avatar_url: 'https://avatar.url',
                type: 'Organization',
              },
            },
          },
        ];

      vi.spyOn(
        apiClient,
        'listNotificationsForAuthenticatedUser',
      ).mockResolvedValue(
        mockNotifications as ListNotificationsForAuthenticatedUserResponse,
      );

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      useSettingsStore.setState({
        detailedNotifications: false,
        fetchReadNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
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

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      await act(async () => {
        await result.current.markNotificationsAsDone([mockGitifyNotification]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
    });

    it('should not mark as done when account does not support the feature', async () => {
      // GitHub Enterprise Server without version doesn't support mark as done
      const mockEnterpriseNotification = {
        ...mockGitifyNotification,
        account: mockGitHubEnterpriseServerAccount, // No version set
      };

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // The API should NOT be called when account doesn't support the feature
      act(() => {
        result.current.markNotificationsAsDone([mockEnterpriseNotification]);
      });

      // Status should remain 'success' (not change to 'loading' since we return early)
      expect(result.current.status).toBe('success');
      // No API calls should have been made - nock will fail if unexpected calls are made
    });

    it('should mark notifications as done with failure', async () => {
      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockRejectedValue(
        new Error('Bad request'),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      await act(async () => {
        await result.current.markNotificationsAsDone([mockGitifyNotification]);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribeNotification', () => {
    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = false', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined);

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
    });

    it('should unsubscribe from a notification with success - markAsDoneOnUnsubscribe = true', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined);

      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockResolvedValue(
        undefined,
      );

      useSettingsStore.setState({
        markAsDoneOnUnsubscribe: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
    });

    it('should unsubscribe from a notification with failure', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockRejectedValue(new Error('Bad request'));

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockRejectedValue(
        new Error('Bad request'),
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });
      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should mark as done when markAsDoneOnUnsubscribe is true even with fetchReadNotifications enabled', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined);

      vi.spyOn(apiClient, 'markNotificationThreadAsDone').mockResolvedValue(
        undefined,
      );

      useSettingsStore.setState({
        markAsDoneOnUnsubscribe: true,
        fetchReadNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
    });

    it('should mark as read when markAsDoneOnUnsubscribe is false and fetchReadNotifications is enabled', async () => {
      vi.spyOn(
        apiClient,
        'ignoreNotificationThreadSubscription',
      ).mockResolvedValue(undefined);

      vi.spyOn(apiClient, 'markNotificationThreadAsRead').mockResolvedValue(
        undefined,
      );

      useSettingsStore.setState({
        markAsDoneOnUnsubscribe: false,
        fetchReadNotifications: true,
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(mockSingleAccountNotifications),
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      const totalNotifications = result.current.notifications.reduce(
        (acc, group) => acc + group.notifications.length,
        0,
      );
      expect(totalNotifications).toBe(0);
    });
  });
});
