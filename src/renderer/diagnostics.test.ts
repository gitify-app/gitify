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
});
