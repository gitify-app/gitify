import { EventEmitter } from 'node:events';

import { app } from 'electron';
import log from 'electron-log';

import { installMainDiagnostics } from './diagnostics';

vi.mock('electron', () => ({ app: { exit: vi.fn() } }));

describe('main/diagnostics.ts', () => {
  let events: EventEmitter;

  beforeEach(() => {
    events = new EventEmitter();
    vi.spyOn(process, 'on').mockImplementation((event, listener) => {
      events.on(event, listener);
      return process;
    });
  });

  it('logs only fixed metadata for a fatal exception, then exits nonzero', () => {
    installMainDiagnostics();

    events.emit('uncaughtException', new Error('private exception text'));

    expect(log.error).toHaveBeenCalledExactlyOnceWith('[diagnostics]', {
      process: 'main',
      event: 'uncaught-exception',
    });
    expect(app.exit).toHaveBeenCalledExactlyOnceWith(1);
    expect(log.error).toHaveBeenCalledBefore(vi.mocked(app.exit));
  });

  it('still exits if logging the exception fails', () => {
    installMainDiagnostics();
    vi.mocked(log.error).mockImplementationOnce(() => {
      throw new Error('log write failed');
    });

    expect(() => events.emit('uncaughtException', new Error('fatal'))).not.toThrow();
    expect(app.exit).toHaveBeenCalledExactlyOnceWith(1);
  });

  it('ignores the rejection reason and keeps the app running', () => {
    installMainDiagnostics();
    const readProperty = vi.fn();
    const reason = new Proxy({ token: 'test-token' }, { get: readProperty });

    events.emit('unhandledRejection', reason);

    expect(readProperty).not.toHaveBeenCalled();
    expect(log.error).toHaveBeenCalledExactlyOnceWith('[diagnostics]', {
      process: 'main',
      event: 'unhandled-rejection',
    });
    expect(app.exit).not.toHaveBeenCalled();
  });

  it('bypasses normalization for a real electron-log forwarded error', async () => {
    const { default: actualLog } =
      await vi.importActual<typeof import('electron-log')>('electron-log');
    const originalHandle = actualLog.errorHandler.handle;
    const mockHandler = log.errorHandler;
    const toJSON = vi.fn(() => 'private error payload');
    log.errorHandler = actualLog.errorHandler;

    try {
      installMainDiagnostics();
      const message = {
        cmd: 'errorHandler',
        error: { message: '', toJSON },
        level: 'error' as const,
        date: new Date(),
        data: [],
      };
      actualLog.processMessage(message);

      expect(toJSON).not.toHaveBeenCalled();
      expect(log.error).toHaveBeenCalledExactlyOnceWith('[diagnostics]', {
        process: 'renderer',
        event: 'logger-error-forwarded',
      });
    } finally {
      actualLog.errorHandler.handle = originalHandle;
      log.errorHandler = mockHandler;
    }
  });
});
