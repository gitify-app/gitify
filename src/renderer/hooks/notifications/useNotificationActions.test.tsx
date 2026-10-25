import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';
import {
  mockGitifyNotification,
  mockSingleAccountNotifications,
} from '../../__mocks__/notifications-mocks';

import { useAccountsStore } from '../../stores';

import { getAdapter } from '../../utils/forges/registry';
import * as notificationsUtils from '../../utils/notifications/notifications';
import { useNotifications } from '../useNotifications';
import { useNotificationActions } from './useNotificationActions';

// Exercise the real hooks (globally mocked in vitest.setup)
vi.unmock('./useNotificationActions');
vi.unmock('../useNotifications');

vi.mock('../../utils/notifications/notifications', async () => {
  const actual = await vi.importActual<typeof import('../../utils/notifications/notifications')>(
    '../../utils/notifications/notifications',
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

  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe('renderer/hooks/notifications/useNotificationActions.ts', () => {
  const githubAdapter = getAdapter('github');

  beforeEach(() => {
    getAllNotificationsMock.mockReset();
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
  });

  it('exposes the notification actions without fetching or creating a query', () => {
    const { queryClient, wrapper } = createWrapper();

    const { result } = renderHook(() => useNotificationActions(), { wrapper });

    expect(result.current.markNotificationsAsRead).toBeTypeOf('function');
    expect(result.current.markNotificationsAsDone).toBeTypeOf('function');
    expect(result.current.unsubscribeNotification).toBeTypeOf('function');
    expect(result.current.removeAccountNotifications).toBeTypeOf('function');
    expect(result.current.refetchNotifications).toBeTypeOf('function');

    expect(getAllNotificationsMock).not.toHaveBeenCalled();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
  });

  it('does not add a notifications query observer', async () => {
    getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);
    const { queryClient, wrapper } = createWrapper();

    renderHook(() => useNotificationActions(), { wrapper });
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);

    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(1));

    // Only the reader subscribed; the action-only consumer added no observer.
    const queries = queryClient.getQueryCache().getAll();
    const observers = queries.flatMap((query) => query.observers);

    expect(queries).toHaveLength(1);
    expect(observers).toHaveLength(1);
  });

  it('refetchNotifications refetches the shared notifications query', async () => {
    getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);
    const { wrapper } = createWrapper();

    renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(getAllNotificationsMock).toHaveBeenCalledTimes(1));

    const actions = renderHook(() => useNotificationActions(), { wrapper });
    await act(async () => {
      await actions.result.current.refetchNotifications();
    });

    expect(getAllNotificationsMock).toHaveBeenCalledTimes(2);
  });

  it('removeAccountNotifications prunes the account from the shared cache', async () => {
    getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);
    const { wrapper } = createWrapper();

    const reader = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(reader.result.current.hasNotifications).toBe(true));

    const actions = renderHook(() => useNotificationActions(), { wrapper });
    act(() => {
      actions.result.current.removeAccountNotifications(mockGitHubCloudAccount);
    });

    await waitFor(() => expect(reader.result.current.notificationCount).toBe(0));
  });

  it('markNotificationsAsRead reaches the shared cache so a reader reflects it', async () => {
    vi.spyOn(githubAdapter.accountOps, 'markThreadAsRead').mockResolvedValue(undefined);
    getAllNotificationsMock.mockResolvedValue(mockSingleAccountNotifications);
    const { wrapper } = createWrapper();

    const reader = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(reader.result.current.hasNotifications).toBe(true));

    const actions = renderHook(() => useNotificationActions(), { wrapper });
    await act(async () => {
      await actions.result.current.markNotificationsAsRead([mockGitifyNotification]);
    });

    await waitFor(() => expect(reader.result.current.notificationCount).toBe(0));
  });
});
