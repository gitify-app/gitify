import log from 'electron-log/renderer';

const { appEvaluated } = vi.hoisted(() => ({ appEvaluated: vi.fn() }));

vi.mock('./App', () => {
  appEvaluated();
  return { App: () => null };
});

vi.mock('react-dom/client', () => ({
  createRoot: () => {
    throw new Error('private startup error text');
  },
}));

describe('renderer/bootstrap.ts', () => {
  it('installs diagnostics before loading the app and logs only fixed metadata', async () => {
    const events = new EventTarget();
    const addListener = vi.spyOn(window, 'addEventListener').mockImplementation((...args) => {
      events.addEventListener(...args);
    });

    await import('./bootstrap');
    await vi.dynamicImportSettled();

    expect(addListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(addListener).toHaveBeenCalledBefore(appEvaluated);
    expect(log.error).toHaveBeenCalledExactlyOnceWith('[diagnostics]', {
      process: 'renderer',
      event: 'startup-failed',
      phase: 'load-renderer',
    });

    const error = new ErrorEvent('error', { message: 'private text', cancelable: true });
    const rejection = new Event('unhandledrejection', { cancelable: true });
    const readReason = vi.fn(() => 'private rejection reason');
    Object.defineProperty(rejection, 'reason', { get: readReason });

    expect(events.dispatchEvent(error)).toBe(false);
    expect(events.dispatchEvent(rejection)).toBe(false);
    expect(readReason).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledTimes(3);
    expect(log.error).toHaveBeenNthCalledWith(2, '[diagnostics]', {
      process: 'renderer',
      event: 'uncaught-error',
    });
    expect(log.error).toHaveBeenNthCalledWith(3, '[diagnostics]', {
      process: 'renderer',
      event: 'unhandled-rejection',
    });
  });
});
