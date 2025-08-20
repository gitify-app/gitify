import { act, renderHook } from '@testing-library/react';

import { useInactivityTimer } from './useInactivityTimer';

// Mock timers for testing
jest.useFakeTimers();

describe('hooks/useInactivityTimer.ts', () => {
  afterEach(() => {
    jest.clearAllTimers();
    // Clear any event listeners
    document.removeEventListener = jest.fn();
    document.addEventListener = jest.fn();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should call callback after inactivity period', () => {
    const mockCallback = jest.fn();
    const delay = 60000; // 60 seconds

    renderHook(() => useInactivityTimer(mockCallback, delay));

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(delay);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback before inactivity period', () => {
    const mockCallback = jest.fn();
    const delay = 60000; // 60 seconds

    renderHook(() => useInactivityTimer(mockCallback, delay));

    // Fast-forward time but not enough
    act(() => {
      jest.advanceTimersByTime(delay - 1000);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should reset timer on user activity', () => {
    const mockCallback = jest.fn();
    const delay = 60000; // 60 seconds

    // Mock document event handling
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() =>
      useInactivityTimer(mockCallback, delay),
    );

    // Verify event listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
      { passive: true },
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
      { passive: true },
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keypress',
      expect.any(Function),
      { passive: true },
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true },
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
      { passive: true },
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { passive: true },
    );

    // Simulate time passing
    act(() => {
      jest.advanceTimersByTime(30000); // 30 seconds
    });

    expect(mockCallback).not.toHaveBeenCalled();

    // Simulate user activity (get the reset function from the event listener)
    const resetTimerFn = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'click',
    )?.[1] as () => void;

    act(() => {
      resetTimerFn(); // Simulate click
    });

    // Continue time, but timer should be reset
    act(() => {
      jest.advanceTimersByTime(30000); // Another 30 seconds (total 60)
    });

    // Callback should not have been called yet because timer was reset
    expect(mockCallback).not.toHaveBeenCalled();

    // Now advance the full delay from the reset
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Cleanup
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousedown',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keypress',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
    );
  });

  it('should not set timer when delay is null', () => {
    const mockCallback = jest.fn();

    // Intentional: passing null to validate hook ignores timer
    // biome-ignore lint/suspicious/noExplicitAny: test intentionally passes invalid value
    renderHook(() => useInactivityTimer(mockCallback, null as any));

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('should update callback when it changes', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();
    const delay = 60000;

    const { rerender } = renderHook(
      ({ callback }) => useInactivityTimer(callback, delay),
      { initialProps: { callback: mockCallback1 } },
    );

    // Change the callback
    rerender({ callback: mockCallback2 });

    act(() => {
      jest.advanceTimersByTime(delay);
    });

    expect(mockCallback1).not.toHaveBeenCalled();
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });

  it('should fire repeatedly after each inactivity interval', () => {
    const mockCallback = jest.fn();
    const delay = 1000;

    renderHook(() => useInactivityTimer(mockCallback, delay));

    act(() => {
      jest.advanceTimersByTime(delay); // 1st
      jest.advanceTimersByTime(delay); // 2nd
      jest.advanceTimersByTime(delay); // 3rd
    });

    expect(mockCallback).toHaveBeenCalledTimes(3);
  });

  it('returned reset function should manually restart timer', () => {
    const mockCallback = jest.fn();
    const delay = 1000;

    const { result } = renderHook(() =>
      useInactivityTimer(mockCallback, delay),
    );

    act(() => {
      jest.advanceTimersByTime(delay); // first fire
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current(); // manual reset
      jest.advanceTimersByTime(500); // half way
    });
    expect(mockCallback).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(500); // complete second interval
    });
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it('should clear timers on unmount and not fire afterward', () => {
    const mockCallback = jest.fn();
    const delay = 1000;

    const { unmount } = renderHook(() =>
      useInactivityTimer(mockCallback, delay),
    );

    act(() => {
      jest.advanceTimersByTime(500); // not yet fired
    });
    expect(mockCallback).not.toHaveBeenCalled();

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000); // would have fired twice if mounted
    });
    expect(mockCallback).not.toHaveBeenCalled();
  });
});
