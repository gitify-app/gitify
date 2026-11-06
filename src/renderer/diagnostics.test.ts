describe('renderer/diagnostics.ts', () => {
  let events: EventTarget;

  beforeEach(() => {
    vi.resetModules();
    events = new EventTarget();
    vi.spyOn(window, 'addEventListener').mockImplementation((...args) => {
      events.addEventListener(...args);
    });
  });

  async function loadDiagnostics() {
    const { default: log } = await import('electron-log/renderer');
    const { installRendererDiagnostics } = await import('./diagnostics');
    return { log, installRendererDiagnostics };
  }

  it('installs the uncaught-error handler exactly once without a dialog', async () => {
    const { log, installRendererDiagnostics } = await loadDiagnostics();

    installRendererDiagnostics();
    installRendererDiagnostics();

    expect(log.errorHandler.setOptions).toHaveBeenCalledTimes(1);
    expect(log.errorHandler.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        showDialog: false,
        onError: expect.any(Function),
      }),
    );
    expect(log.errorHandler.startCatching).not.toHaveBeenCalled();
    expect(window.addEventListener).toHaveBeenCalledTimes(2);
    const event = new ErrorEvent('error', { error: new Error('test'), cancelable: true });
    events.dispatchEvent(event);
    expect(log.error).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('forwards a sanitized error without credential values', async () => {
    const { log, installRendererDiagnostics } = await loadDiagnostics();
    installRendererDiagnostics();

    const error = Object.assign(new Error('renderer failed with Bearer supersecret'), {
      cause: 'safe context',
      token: 'supersecret',
      headers: { authorization: 'Bearer supersecret' },
    });

    events.dispatchEvent(new ErrorEvent('error', { error }));

    expect(log.error).toHaveBeenCalledWith(
      '[uncaught]',
      expect.objectContaining({
        message: expect.not.stringContaining('supersecret'),
        cause: 'safe context',
      }),
    );
    expect(JSON.stringify(vi.mocked(log.error).mock.calls[0][1])).not.toContain('supersecret');
  });

  it('prevents the real error handler from forwarding or logging the original error', async () => {
    const { log, installRendererDiagnostics } = await loadDiagnostics();
    // Load synchronously: the renderer logger's Proxy fabricates a `then`
    // method, so returning it from an async import treats it as a thenable.
    const actualLog = createRequire(import.meta.url)('electron-log/renderer') as typeof log;
    const consoleTransport = vi.spyOn(actualLog.transports, 'console').mockImplementation(() => {});
    const ipcTransport = vi.spyOn(actualLog.transports, 'ipc').mockImplementation(() => {});
    installRendererDiagnostics();

    const options = vi.mocked(log.errorHandler.setOptions).mock.calls[0][0]!;
    actualLog.errorHandler.handle(new Error('Authorization: Bearer supersecret'), options);

    expect(log.error).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(vi.mocked(log.error).mock.calls)).not.toContain('supersecret');
    expect(consoleTransport).not.toHaveBeenCalled();
    expect(ipcTransport).not.toHaveBeenCalled();
  });

  it('projects an object rejection before it can reach console or IPC', async () => {
    const { log, installRendererDiagnostics } = await loadDiagnostics();
    const actualLog = createRequire(import.meta.url)('electron-log/renderer') as typeof log;
    const consoleTransport = vi.spyOn(actualLog.transports, 'console').mockImplementation(() => {});
    const ipcTransport = vi.spyOn(actualLog.transports, 'ipc').mockImplementation(() => {});
    vi.mocked(log.error).mockImplementationOnce((...args) => actualLog.error(...args));
    installRendererDiagnostics();
    const toJSON = vi.fn(() => 'supersecret');
    const toString = vi.fn(() => 'supersecret');
    const reason = {
      message: 'Request failed',
      token: 'supersecret',
      headers: { authorization: 'Basic supersecret' },
      config: { password: 'supersecret' },
      toJSON,
      toString,
    };
    const event = new Event('unhandledrejection', { cancelable: true });
    Object.defineProperty(event, 'reason', { value: reason });

    events.dispatchEvent(event);

    expect(log.error).toHaveBeenCalledExactlyOnceWith('[uncaught]', {
      name: 'Error',
      message: 'Request failed',
    });
    expect(event.defaultPrevented).toBe(true);
    expect(toJSON).not.toHaveBeenCalled();
    expect(toString).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(log.error).mock.calls)).not.toContain('supersecret');
    expect(consoleTransport).toHaveBeenCalledTimes(1);
    expect(ipcTransport).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(consoleTransport.mock.calls)).not.toContain('supersecret');
    expect(JSON.stringify(ipcTransport.mock.calls)).not.toContain('supersecret');
  });

  it.each([null, undefined, false, 0, 42n])(
    'preserves falsy/primitive rejection %s',
    async (reason) => {
      const { log, installRendererDiagnostics } = await loadDiagnostics();
      installRendererDiagnostics();
      const event = new Event('unhandledrejection', { cancelable: true });
      Object.defineProperty(event, 'reason', { value: reason });

      events.dispatchEvent(event);

      expect(log.error).toHaveBeenCalledExactlyOnceWith('[uncaught]', {
        name: 'Error',
        message: String(reason),
      });
      expect(event.defaultPrevented).toBe(true);
    },
  );

  it('retains the browser message when an error event has no Error object', async () => {
    const { log, installRendererDiagnostics } = await loadDiagnostics();
    installRendererDiagnostics();

    events.dispatchEvent(new ErrorEvent('error', { message: 'Script failed with Bearer secret' }));

    expect(log.error).toHaveBeenCalledExactlyOnceWith('[uncaught]', {
      name: 'Error',
      message: 'Script failed with Bearer [redacted]',
    });
  });
});
import { createRequire } from 'node:module';
