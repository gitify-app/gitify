import { act, renderHook } from '@testing-library/react';

import { onlineManager } from '@tanstack/react-query';

import { useOnlineStatus } from './useOnlineStatus';

// Exercise the real hook implementation (globally mocked in vitest.setup)
vi.unmock('./useOnlineStatus');

describe('renderer/hooks/useOnlineStatus.ts', () => {
  afterEach(() => {
    act(() => {
      onlineManager.setOnline(true);
    });
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('reflects the online manager status', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    act(() => {
      onlineManager.setOnline(false);
    });

    expect(result.current).toBe(false);

    act(() => {
      onlineManager.setOnline(true);
    });

    expect(result.current).toBe(true);
  });

  it('re-probes online state when the system wakes', () => {
    act(() => {
      onlineManager.setOnline(false);
    });

    renderHook(() => useOnlineStatus());

    // Simulate a wake event by invoking the callback registered with onSystemWake
    const wakeCallback = vi.mocked(window.gitify.onSystemWake).mock.calls[0][0];

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      wakeCallback();
    });

    expect(onlineManager.isOnline()).toBe(true);
  });

  describe('startup bootstrap', () => {
    it('corrects onlineManager to offline when the device starts offline', () => {
      // onlineManager defaults to online: true regardless of the device's
      // actual state; the hook should force-correct it on mount rather than
      // waiting for a native browser online/offline event.
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      onlineManager.setOnline(true);

      const { result } = renderHook(() => useOnlineStatus());

      expect(onlineManager.isOnline()).toBe(false);
      expect(result.current).toBe(false);
    });

    it('confirms onlineManager as online when the device starts online', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      onlineManager.setOnline(true);

      const { result } = renderHook(() => useOnlineStatus());

      expect(onlineManager.isOnline()).toBe(true);
      expect(result.current).toBe(true);
    });
  });
});
