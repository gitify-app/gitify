import { EventEmitter } from 'node:events';

describe('main/diagnostics.ts', () => {
  let events: EventEmitter;

  beforeEach(() => {
    vi.resetModules();
    events = new EventEmitter();
    vi.spyOn(process, 'on').mockImplementation((event, listener) => {
      events.on(event, listener);
      return process;
    });
  });

  async function loadDiagnostics() {
    const { default: log } = await import('electron-log');
    const { installMainDiagnostics } = await import('./diagnostics');
    return { log, installMainDiagnostics };
  }

  it('installs the uncaught-error handler exactly once without a dialog', async () => {
    const { log, installMainDiagnostics } = await loadDiagnostics();

    installMainDiagnostics();
    installMainDiagnostics();

    expect(log.errorHandler.setOptions).toHaveBeenCalledTimes(1);
    expect(log.errorHandler.setOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        showDialog: false,
        onError: expect.any(Function),
      }),
    );
    expect(log.errorHandler.startCatching).not.toHaveBeenCalled();
    expect(events.listenerCount('uncaughtException')).toBe(1);
    expect(events.listenerCount('unhandledRejection')).toBe(1);
  });

  it('logs a sanitized error without credential values', async () => {
    const { log, installMainDiagnostics } = await loadDiagnostics();
    installMainDiagnostics();

    const error = Object.assign(
      new Error('request failed with Authorization: Bearer supersecret'),
      {
        cause: 'safe context',
        token: 'supersecret',
        headers: { authorization: 'Bearer supersecret' },
        config: { headers: { authorization: 'Bearer supersecret' } },
      },
    );

    events.emit('uncaughtException', error);

    expect(log.error).toHaveBeenCalledWith(
      '[uncaught]',
      expect.objectContaining({
        message: expect.not.stringContaining('supersecret'),
        cause: 'safe context',
      }),
    );
    expect(JSON.stringify(vi.mocked(log.error).mock.calls[0][1])).not.toContain('supersecret');
  });

  it('prevents the real error handler from also logging the original error', async () => {
    const { log, installMainDiagnostics } = await loadDiagnostics();
    const { default: actualLog } =
      await vi.importActual<typeof import('electron-log')>('electron-log');
    const consoleTransport = vi.spyOn(actualLog.transports, 'console').mockImplementation(() => {});
    const fileTransport = vi.spyOn(actualLog.transports, 'file').mockImplementation(() => {});
    installMainDiagnostics();

    const options = vi.mocked(log.errorHandler.setOptions).mock.calls[0][0]!;
    actualLog.errorHandler.handle(new Error('Authorization: Bearer supersecret'), options);

    expect(log.error).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(vi.mocked(log.error).mock.calls)).not.toContain('supersecret');
    expect(consoleTransport).not.toHaveBeenCalled();
    expect(fileTransport).not.toHaveBeenCalled();
  });

  it('projects an object rejection before any request properties are serialized', async () => {
    const { log, installMainDiagnostics } = await loadDiagnostics();
    const { default: actualLog } =
      await vi.importActual<typeof import('electron-log')>('electron-log');
    const consoleTransport = vi.spyOn(actualLog.transports, 'console').mockImplementation(() => {});
    const fileTransport = vi.spyOn(actualLog.transports, 'file').mockImplementation(() => {});
    vi.mocked(log.error).mockImplementationOnce((...args) => actualLog.error(...args));
    installMainDiagnostics();
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

    events.emit('unhandledRejection', reason);

    expect(log.error).toHaveBeenCalledExactlyOnceWith('[uncaught]', {
      name: 'Error',
      message: 'Request failed',
    });
    expect(toJSON).not.toHaveBeenCalled();
    expect(toString).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(log.error).mock.calls)).not.toContain('supersecret');
    expect(consoleTransport).toHaveBeenCalledTimes(1);
    expect(fileTransport).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(consoleTransport.mock.calls)).not.toContain('supersecret');
    expect(JSON.stringify(fileTransport.mock.calls)).not.toContain('supersecret');
  });

  it.each([null, undefined, false, 0, 42n])(
    'safely logs primitive rejection %s',
    async (reason) => {
      const { log, installMainDiagnostics } = await loadDiagnostics();
      installMainDiagnostics();

      events.emit('unhandledRejection', reason);

      expect(log.error).toHaveBeenCalledExactlyOnceWith('[uncaught]', {
        name: 'Error',
        message: String(reason),
      });
    },
  );

  it('handles a circular rejection without serializing its credentials', async () => {
    const { log, installMainDiagnostics } = await loadDiagnostics();
    installMainDiagnostics();
    const reason: { token: string; self?: unknown } = { token: 'supersecret' };
    reason.self = reason;

    events.emit('unhandledRejection', reason);

    expect(log.error).toHaveBeenCalledExactlyOnceWith('[uncaught]', {
      name: 'Error',
      message: 'Non-Error rejection',
    });
  });
});
