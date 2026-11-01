import { act, renderHook } from '@testing-library/react';

import usePowerStateStore from '../stores/usePowerStateStore';

import { usePowerState } from './usePowerState';

describe('renderer/hooks/usePowerState.ts', () => {
  beforeEach(() => {
    usePowerStateStore.setState({ isActive: true });
  });

  it('pauses on sleep or lock and resumes on wake or unlock', () => {
    renderHook(() => usePowerState());

    const sleep = vi.mocked(window.gitify.onSystemSleep).mock.calls[0][0];
    const wake = vi.mocked(window.gitify.onSystemWake).mock.calls[0][0];

    act(() => {
      sleep();
    });
    expect(usePowerStateStore.getState().isActive).toBe(false);

    act(() => {
      wake();
    });
    expect(usePowerStateStore.getState().isActive).toBe(true);
  });

  it('removes both listeners on unmount', () => {
    const unsubscribeSleep = vi.fn();
    const unsubscribeWake = vi.fn();
    vi.mocked(window.gitify.onSystemSleep).mockReturnValueOnce(unsubscribeSleep);
    vi.mocked(window.gitify.onSystemWake).mockReturnValueOnce(unsubscribeWake);

    const { unmount } = renderHook(() => usePowerState());
    unmount();

    expect(unsubscribeSleep).toHaveBeenCalledTimes(1);
    expect(unsubscribeWake).toHaveBeenCalledTimes(1);
  });
});
