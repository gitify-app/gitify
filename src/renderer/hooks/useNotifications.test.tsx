import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

import {
  getNotificationFailureKey,
  useAccountsStore,
  useFiltersStore,
  useNotificationActionFailuresStore,
  useSettingsStore,
} from '../stores';

import type { AccountNotifications, Percentage } from '../types';

import { Errors } from '../utils/core/errors';
import * as logger from '../utils/core/logger';
import { getAdapter } from '../utils/forges/registry';
import * as notificationsUtils from '../utils/notifications/notifications';
import {
  clearServerPollIntervals,
  reportServerPollInterval,
} from '../utils/notifications/pollInterval';
import * as audio from '../utils/system/audio';
import * as native from '../utils/system/native';
import { useNotifications } from './useNotifications';

// Exercise the real hook implementation (globally mocked in vitest.setup)
vi.unmock('./useNotifications');

vi.mock('../utils/notifications/notifications', async () => {
  const actual = await vi.importActual<typeof import('../utils/notifications/notifications')>(
    '../utils/notifications/notifications',
  );
  return {
    ...actual,
    getAllNotifications: vi.fn(),
    refreshEnrichmentCache: vi.fn(),
  };
});

const getAllNotificationsMock = vi.mocked(notificationsUtils.getAllNotifications);
const refreshEnrichmentCacheMock = vi.mocked(notificationsUtils.refreshEnrichmentCache);

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
  renderHook(() => useNotifications({ withSideEffects: true }), { wrapper: createWrapper() });

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
    refreshEnrichmentCacheMock.mockReset();
    clearServerPollIntervals();

    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
    useNotificationActionFailuresStore.getState().reset();

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

  describe('status stability during background refetches', () => {
    it('keeps status as error while a retry during an ongoing outage is in flight', async () => {
      let rejectRetry: (() => void) | undefined;
      getAllNotificationsMock
        .mockResolvedValueOnce(mockSingleAccountNotifications)
        .mockRejectedValueOnce(new Error('network error'))
        .mockImplementationOnce(
          () =>
            new Promise((_resolve, reject) => {
              rejectRetry = () => reject(new Error('network error'));
            }),
        );

      const { result } = renderNotificationsHook();

      // Establish a prior successful fetch, then let the next poll fail -
      // mirroring an outage starting after notifications had already loaded.
      await waitFor(() => expect(result.current.status).toBe('success'));

      act(() => {
        result.current.refetchNotifications();
      });
      await waitFor(() => expect(result.current.status).toBe('error'));
      expect(result.current.isFetching).toBe(false);

      // Trigger a retry that stays unsettled.
      act(() => {
        result.current.refetchNotifications();
      });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      expect(result.current.status).toBe('error');

      await act(async () => {
        rejectRetry?.();
      });

      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.status).toBe('error');
    });

    it('keeps status as success while a background refetch of loaded data is in flight', async () => {
      let resolveRefetch: ((data: AccountNotifications[]) => void) | undefined;
      getAllNotificationsMock
        .mockResolvedValueOnce(mockSingleAccountNotifications)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              resolveRefetch = resolve;
            }),
        );

      const { result } = renderNotificationsHook();

      await waitFor(() => expect(result.current.status).toBe('success'));
      expect(result.current.isFetching).toBe(false);

      // Trigger a background refetch that stays unsettled.
      act(() => {
        result.current.refetchNotifications();
      });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      expect(result.current.status).toBe('success');

      await act(async () => {
        resolveRefetch?.(mockSingleAccountNotifications);
      });

      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.status).toBe('success');
    });
  });

  describe('polling', () => {
    it('only polls once per interval, regardless of consumer count', async () => {
      vi.useFakeTimers();
      try {
        getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

        useSettingsStore.setState({
          fetchInterval: 1000,
        });

        // A single shared wrapper so all consumers share one query cache
        const wrapper = createWrapper();

        // Singleton side-effects host (GlobalEffects)
        renderHook(() => useNotifications({ withSideEffects: true }), { wrapper });

        // Plain consumers (notification rows, repo groups, sidebar, etc.)
        // mount staggered over time, like real components rendering across
        // frames. With per-observer polling each schedules its own interval
        // timer on a different offset, so their fetches cannot dedupe.
        for (let i = 0; i < 3; i++) {
          await act(async () => {
            await vi.advanceTimersByTimeAsync(100);
          });
          renderHook(() => useNotifications(), { wrapper });
        }

        await act(async () => {
          await vi.advanceTimersByTimeAsync(3_000);
        });

        // 1 initial fetch + 3 interval polls. Without polling ownership the
        // staggered consumers would each poll on their own timer (~10 extra
        // fetches here, and far more in a full notification list).
        expect(getAllNotificationsMock).toHaveBeenCalledTimes(4);
      } finally {
        vi.useRealTimers();
      }
    });

    it('plain consumers do not poll on their own', async () => {
      vi.useFakeTimers();
      try {
        getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

        useSettingsStore.setState({
          fetchInterval: 1000,
        });

        renderHook(() => useNotifications(), { wrapper: createWrapper() });

        await act(async () => {
          await vi.advanceTimersByTimeAsync(3_500);
        });

        // Initial fetch only; no interval polls without the side-effects host
        expect(getAllNotificationsMock).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('stretches the polling interval to the server-recommended minimum', async () => {
      vi.useFakeTimers();
      try {
        // The forge client reports the `X-Poll-Interval` header while the
        // fetch runs, so each poll refreshes the recommendation.
        getAllNotificationsMock.mockImplementation(async () => {
          reportServerPollInterval(mockGitHubCloudAccount, 5);
          return mockSingleAccountNotifications;
        });

        useSettingsStore.setState({
          fetchInterval: 1000,
        });

        renderHook(() => useNotifications({ withSideEffects: true }), {
          wrapper: createWrapper(),
        });

        // Initial mount fetch reports a 5s server minimum.
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
        expect(getAllNotificationsMock).toHaveBeenCalledTimes(1);

        // The 1s user interval would fire ~3 polls here; the server minimum
        // suppresses them all.
        await act(async () => {
          await vi.advanceTimersByTimeAsync(3_500);
        });
        expect(getAllNotificationsMock).toHaveBeenCalledTimes(1);

        // Just past the 5s server minimum, exactly one poll fires.
        await act(async () => {
          await vi.advanceTimersByTimeAsync(2_000);
        });
        expect(getAllNotificationsMock).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('query cache configuration', () => {
    it('does not refetch on mount while the cached data is still fresh', async () => {
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchInterval: false,
          },
        },
      });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      renderHook(() => useNotifications({ withSideEffects: true }), { wrapper });
      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(1));

      // `refetchOnMount` is stale-gated, so a second host mounting inside the
      // staleTime window shares the cached data rather than refetching.
      renderHook(() => useNotifications({ withSideEffects: true }), { wrapper });

      await act(async () => {
        await Promise.resolve();
      });

      expect(getAllNotificationsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('window focus', () => {
    it('refreshes the enrichment cache when the window regains focus', async () => {
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);
      refreshEnrichmentCacheMock.mockReturnValue(false);

      useSettingsStore.setState({ fetchInterval: 1234 });

      renderNotificationsHook();
      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalled());

      try {
        await act(async () => {
          focusManager.setFocused(false);
        });
        expect(refreshEnrichmentCacheMock).not.toHaveBeenCalled();

        await act(async () => {
          focusManager.setFocused(true);
        });

        // Throttled to the configured fetch interval
        expect(refreshEnrichmentCacheMock).toHaveBeenCalledWith(1234);
      } finally {
        await act(async () => {
          focusManager.setFocused(undefined);
        });
      }
    });

    it('refetches immediately when the cache is cleared on focus, even if the query is fresh', async () => {
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);
      refreshEnrichmentCacheMock.mockReturnValue(true);

      // A never-stale query suppresses the stale-gated `refetchOnWindowFocus`
      // refetch, so any second fetch can only come from the explicit refetch
      // issued when the enrichment cache is cleared.
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            refetchOnWindowFocus: false,
            refetchInterval: false,
            staleTime: Number.POSITIVE_INFINITY,
          },
        },
      });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      renderHook(() => useNotifications({ withSideEffects: true }), { wrapper });
      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(1));

      try {
        await act(async () => {
          focusManager.setFocused(false);
        });
        await act(async () => {
          focusManager.setFocused(true);
        });

        await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(2));
      } finally {
        await act(async () => {
          focusManager.setFocused(undefined);
        });
      }
    });

    it('plain consumers do not refresh the enrichment cache on focus', async () => {
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      renderHook(() => useNotifications(), { wrapper: createWrapper() });
      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalled());

      try {
        await act(async () => {
          focusManager.setFocused(false);
        });
        await act(async () => {
          focusManager.setFocused(true);
        });

        expect(refreshEnrichmentCacheMock).not.toHaveBeenCalled();
      } finally {
        await act(async () => {
          focusManager.setFocused(undefined);
        });
      }
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
        .spyOn(githubAdapter.accountOps, 'markThreadAsRead')
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
      vi.spyOn(githubAdapter.accountOps, 'markThreadAsRead').mockRejectedValue(new Error('boom'));
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsRead([mockGitifyNotification]).catch(() => {});
      });

      expect(rendererLogErrorSpy).toHaveBeenCalled();
    });

    it('rolls back the cache for a failed notification while a failed request does not affect it', async () => {
      vi.spyOn(githubAdapter.accountOps, 'markThreadAsRead').mockRejectedValue(new Error('boom'));
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsRead([mockGitifyNotification]).catch(() => {});
      });

      // The notification remains in the cache since its action failed
      await waitFor(() => expect(result.current.notificationCount).toBe(1));
      const failureKey = getNotificationFailureKey(
        mockGitifyNotification.account,
        mockGitifyNotification.id,
      );
      expect(useNotificationActionFailuresStore.getState().failures[failureKey]).toBeDefined();
    });

    it('tracks succeeded and failed notifications independently within a single bulk call', async () => {
      const [succeedsNotification, failsNotification] = mockGitHubCloudGitifyNotifications;

      getAllNotificationsMock.mockResolvedValue([
        {
          account: succeedsNotification.account,
          notifications: [succeedsNotification, failsNotification],
          error: null,
        },
      ]);

      vi.spyOn(githubAdapter.accountOps, 'markThreadAsRead').mockImplementation(
        async (_account, id) => {
          if (id === failsNotification.id) {
            throw new Error('boom');
          }
        },
      );

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.notificationCount).toBe(2));

      await act(async () => {
        await result.current
          .markNotificationsAsRead([succeedsNotification, failsNotification])
          .catch(() => {});
      });

      // The succeeded notification is removed; the failed one remains and is
      // recorded in the failure map, not the other way around.
      await waitFor(() => expect(result.current.notificationCount).toBe(1));
      expect(
        result.current.notifications[0]?.notifications.some((n) => n.id === failsNotification.id),
      ).toBe(true);
      const failsKey = getNotificationFailureKey(failsNotification.account, failsNotification.id);
      const succeedsKey = getNotificationFailureKey(
        succeedsNotification.account,
        succeedsNotification.id,
      );
      expect(useNotificationActionFailuresStore.getState().failures[failsKey]).toBeDefined();
      expect(useNotificationActionFailuresStore.getState().failures[succeedsKey]).toBeUndefined();
    });
  });

  describe('markNotificationsAsDone', () => {
    it('marks notifications as done via the forge adapter', async () => {
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsDone')
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
        .spyOn(githubAdapter.accountOps.capabilities, 'markAsDone')
        .mockReturnValue(false);
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsDone')
        .mockResolvedValue(undefined);
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsRead')
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

    it('reconciles a failed mark-as-read fallback only once', async () => {
      const markAsDoneCapabilitySpy = vi
        .spyOn(githubAdapter.accountOps.capabilities, 'markAsDone')
        .mockReturnValue(false);
      vi.spyOn(githubAdapter.accountOps, 'markThreadAsRead').mockRejectedValue(new Error('boom'));
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.markNotificationsAsDone([mockGitifyNotification]);
      });

      const failureKey = getNotificationFailureKey(
        mockGitifyNotification.account,
        mockGitifyNotification.id,
      );
      expect(rendererLogErrorSpy).toHaveBeenCalledTimes(1);
      expect(useNotificationActionFailuresStore.getState().failures[failureKey]?.action).toBe(
        'markAsRead',
      );

      markAsDoneCapabilitySpy.mockRestore();
    });
  });

  describe('unsubscribeNotification', () => {
    it('unsubscribes and marks as read by default', async () => {
      const unsubscribeThreadSpy = vi
        .spyOn(githubAdapter.accountOps, 'unsubscribeThread')
        .mockResolvedValue(undefined);
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsDone')
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
        .spyOn(githubAdapter.accountOps, 'unsubscribeThread')
        .mockResolvedValue(undefined);
      const markThreadAsReadSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsRead')
        .mockResolvedValue(undefined);
      const markThreadAsDoneSpy = vi
        .spyOn(githubAdapter.accountOps, 'markThreadAsDone')
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

    it('keeps a failed follow-up action recorded after unsubscribe succeeds', async () => {
      vi.spyOn(githubAdapter.accountOps, 'unsubscribeThread').mockResolvedValue(undefined);
      vi.spyOn(githubAdapter.accountOps, 'markThreadAsRead').mockRejectedValue(new Error('boom'));
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const { result } = renderNotificationsHook();
      await waitFor(() => expect(result.current.hasNotifications).toBe(true));

      await act(async () => {
        await result.current.unsubscribeNotification(mockGitifyNotification);
      });

      const failureKey = getNotificationFailureKey(
        mockGitifyNotification.account,
        mockGitifyNotification.id,
      );
      expect(useNotificationActionFailuresStore.getState().failures[failureKey]).toBeDefined();
      expect(result.current.notificationCount).toBe(1);
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

  describe('system wake', () => {
    it('refetches notifications when the system wakes', async () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      renderNotificationsHook();
      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(1));

      const wakeCallback = vi.mocked(window.gitify.onSystemWake).mock.calls[0][0];
      act(() => {
        wakeCallback();
      });

      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(2));
    });

    it('only the side-effects host registers a wake listener', async () => {
      vi.mocked(window.gitify.onSystemWake).mockClear();
      getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);

      const wrapper = createWrapper();

      // Plain consumers (notification rows, repo groups, sidebar, etc.)
      renderHook(() => useNotifications(), { wrapper });
      renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(1));

      // Each consumer registering its own listener would leak an ipcRenderer
      // listener per mounted row and multiply wake-triggered refetches.
      expect(vi.mocked(window.gitify.onSystemWake)).not.toHaveBeenCalled();

      renderHook(() => useNotifications({ withSideEffects: true }), { wrapper });

      expect(vi.mocked(window.gitify.onSystemWake)).toHaveBeenCalledTimes(1);
    });
  });
});
