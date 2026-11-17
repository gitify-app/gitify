import { act, renderHook } from '@testing-library/react';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';

import useConnectionStore from '../stores/useConnectionStore';

import type { AccountNotifications, ErrorType } from '../types';

import { getErrorDetails } from '../utils/core/errors';
import { useConnectionRecovery, type ConnectionRecoveryInput } from './useConnectionRecovery';

function group(errorType: ErrorType | null = null, account = mockGitHubCloudAccount) {
  return {
    account,
    notifications: [],
    error: errorType ? getErrorDetails(errorType) : null,
  } as AccountNotifications;
}

const baseInput: ConnectionRecoveryInput = {
  isOnline: true,
  isFetching: false,
  isPaused: false,
  isError: false,
  dataUpdatedAt: 0,
  notifications: [group()],
};

describe('renderer/hooks/useConnectionRecovery.ts', () => {
  beforeEach(() => {
    useConnectionStore.setState({
      state: 'online',
      recoveringSince: null,
      baselineDataUpdatedAt: 0,
    });
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('stays online on mount while the device is online', () => {
    renderHook(() => useConnectionRecovery(baseInput));

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('goes offline when connectivity is lost', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });

    expect(useConnectionStore.getState().state).toBe('offline');
  });

  it('starts recovery when connectivity returns', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });

    expect(useConnectionStore.getState()).toMatchObject({
      state: 'recovering',
      baselineDataUpdatedAt: 0,
    });
  });

  it('starts recovery when the system wakes while online', () => {
    renderHook(() => useConnectionRecovery(baseInput));

    const wake = vi.mocked(window.gitify.onSystemWake).mock.calls[0][0];
    act(() => {
      wake();
    });

    expect(useConnectionStore.getState().state).toBe('recovering');
  });

  it('stays offline when the system wakes while offline', () => {
    renderHook(() => useConnectionRecovery(baseInput));

    const wake = vi.mocked(window.gitify.onSystemWake).mock.calls[0][0];
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      wake();
    });

    expect(useConnectionStore.getState().state).toBe('offline');
  });

  it('settles online when a clean fetch lands after recovery begins', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({ ...baseInput, dataUpdatedAt: 1 });

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('settles online on a partial success', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({
      ...baseInput,
      dataUpdatedAt: 1,
      notifications: [group(), group('BAD_CREDENTIALS', mockGitHubEnterpriseServerAccount)],
    });

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('stays recovering on a retryable connection failure', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({
      ...baseInput,
      dataUpdatedAt: 1,
      notifications: [group('NETWORK'), group('UNKNOWN', mockGitHubEnterpriseServerAccount)],
    });

    expect(useConnectionStore.getState().state).toBe('recovering');
  });

  it('settles online on a definitive failure', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({
      ...baseInput,
      dataUpdatedAt: 1,
      notifications: [
        group('BAD_CREDENTIALS'),
        group('MISSING_SCOPES', mockGitHubEnterpriseServerAccount),
      ],
    });

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('does not settle while a fetch is in flight', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({ ...baseInput, isFetching: true, dataUpdatedAt: 1 });

    expect(useConnectionStore.getState().state).toBe('recovering');
  });

  it('settles online on an outright query error', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({ ...baseInput, isError: true });

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('ends recovery when the bounded window expires', () => {
    vi.useFakeTimers();

    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });

    expect(useConnectionStore.getState().state).toBe('recovering');

    act(() => {
      vi.advanceTimersByTime(15_000);
    });

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('does not extend the window on duplicate wake events', () => {
    vi.useFakeTimers();

    renderHook(() => useConnectionRecovery(baseInput));

    const wake = vi.mocked(window.gitify.onSystemWake).mock.calls[0][0];
    act(() => {
      wake();
    });

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      wake();
    });

    act(() => {
      vi.advanceTimersByTime(4_999);
    });

    expect(useConnectionStore.getState().state).toBe('recovering');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(useConnectionStore.getState().state).toBe('online');
  });

  it('goes offline immediately when connectivity is lost during recovery', () => {
    const { rerender } = renderHook(
      (props: ConnectionRecoveryInput) => useConnectionRecovery(props),
      {
        initialProps: baseInput,
      },
    );

    rerender({ ...baseInput, isOnline: false });
    rerender({ ...baseInput, isOnline: true });
    rerender({ ...baseInput, isOnline: false });

    expect(useConnectionStore.getState().state).toBe('offline');
  });

  it('removes the wake listener on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(window.gitify.onSystemWake).mockReturnValueOnce(unsubscribe);

    const { unmount } = renderHook(() => useConnectionRecovery(baseInput));
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
