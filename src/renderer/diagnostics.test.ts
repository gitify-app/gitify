describe('renderer/diagnostics.ts', () => {
  beforeEach(() => {
    vi.resetModules();
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

    expect(log.errorHandler.startCatching).toHaveBeenCalledTimes(1);
    expect(log.errorHandler.startCatching).toHaveBeenCalledWith(
      expect.objectContaining({
        showDialog: false,
        onError: expect.any(Function),
      }),
    );
  });

  it('forwards a sanitized error without credential values', async () => {
    const { log, installRendererDiagnostics } = await loadDiagnostics();
    installRendererDiagnostics();

    const options = vi.mocked(log.errorHandler.startCatching).mock.calls[0][0]!;
    const error = Object.assign(new Error('renderer failed with Bearer supersecret'), {
      cause: 'safe context',
      token: 'supersecret',
      headers: { authorization: 'Bearer supersecret' },
    });

    options.onError?.({
      error,
      errorName: 'Unhandled',
      processType: 'renderer',
    });

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

    const options = vi.mocked(log.errorHandler.startCatching).mock.calls[0][0]!;
    actualLog.errorHandler.handle(new Error('Authorization: Bearer supersecret'), options);

    expect(log.error).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(vi.mocked(log.error).mock.calls)).not.toContain('supersecret');
    expect(consoleTransport).not.toHaveBeenCalled();
    expect(ipcTransport).not.toHaveBeenCalled();
  });
});
import { createRequire } from 'node:module';
