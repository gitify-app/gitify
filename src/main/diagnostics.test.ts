describe('main/diagnostics.ts', () => {
  beforeEach(() => {
    vi.resetModules();
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

    expect(log.errorHandler.startCatching).toHaveBeenCalledTimes(1);
    expect(log.errorHandler.startCatching).toHaveBeenCalledWith(
      expect.objectContaining({
        showDialog: false,
        onError: expect.any(Function),
      }),
    );
  });

  it('logs a sanitized error without credential values', async () => {
    const { log, installMainDiagnostics } = await loadDiagnostics();
    installMainDiagnostics();

    const options = vi.mocked(log.errorHandler.startCatching).mock.calls[0][0]!;
    const error = Object.assign(
      new Error('request failed with Authorization: Bearer supersecret'),
      {
        cause: 'safe context',
        token: 'supersecret',
        headers: { authorization: 'Bearer supersecret' },
        config: { headers: { authorization: 'Bearer supersecret' } },
      },
    );

    options.onError?.({
      error,
      errorName: 'Unhandled',
      processType: 'browser',
      createIssue: vi.fn(),
      versions: { app: '1.0.0', electron: '0.0.0', os: 'test' },
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
});
