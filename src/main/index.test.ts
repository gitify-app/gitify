import './index';

const { calls, menubarOptions, menubarMock, attachLifecycleMock, lifecycleMock } = vi.hoisted(
  () => {
    const calls: string[] = [];
    const menubarOptions: unknown[] = [];
    const attachLifecycleMock = vi.fn(() => {
      calls.push('attachLifecycle');
    });
    const lifecycleMock = vi.fn<() => typeof attachLifecycleMock | undefined>(() => {
      calls.push('lifecycle');
      return attachLifecycleMock;
    });
    const menubarMock = vi.fn((options: unknown) => {
      calls.push('menubar');
      menubarOptions.push(options);
      return { window: {}, once: vi.fn() };
    });
    return { calls, menubarOptions, menubarMock, attachLifecycleMock, lifecycleMock };
  },
);

vi.mock('electron', () => ({
  app: {
    isPackaged: true,
    whenReady: vi.fn(() => {
      calls.push('whenReady');
      return Promise.resolve();
    }),
    on: vi.fn(),
  },
}));

vi.mock('electron-log', () => ({
  default: {
    initialize: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    transports: { file: {} },
  },
}));

vi.mock('electron-menubar', () => ({ menubar: menubarMock }));

vi.mock('./config', () => ({
  Paths: { indexHtml: 'index.html' },
  WindowConfig: { width: 500, height: 400 },
}));

vi.mock('./handlers', () => ({
  registerAppHandlers: vi.fn(),
  registerLanguageHandlers: vi.fn(() => calls.push('languageHandlers')),
  registerGitHubCliHandlers: vi.fn(),
  registerNativeNotificationHandlers: vi.fn(),
  registerStorageHandlers: vi.fn(),
  registerSystemHandlers: vi.fn(),
  registerTrayHandlers: vi.fn(),
  registerUpdaterHandlers: vi.fn(),
}));

vi.mock('./language', () => ({ initializeMainLanguage: vi.fn(() => calls.push('language')) }));

vi.mock('./icons', () => ({
  getIdleTrayIcon: vi.fn(() => 'icon.png'),
}));

vi.mock('./lifecycle', () => ({
  configureUserDataPath: vi.fn(() => calls.push('userData')),
  configureWindowEvents: vi.fn(),
  handleProtocolURL: vi.fn(),
  initializeAppLifecycle: lifecycleMock,
  onFirstRunMaybe: vi.fn(),
}));

vi.mock('./menu', () => ({
  default: class {
    buildMenu() {
      return {};
    }
  },
}));

vi.mock('./ozone', () => ({
  applyOzonePlatform: vi.fn(() => calls.push('ozone')),
}));

vi.mock('./updater', () => ({
  default: class {},
}));

describe('main/index.ts', () => {
  it('configures electron-menubar with the app window settings', () => {
    expect(menubarOptions).toEqual([
      {
        icon: 'icon.png',
        index: 'index.html',
        browserWindow: { width: 500, height: 400 },
        preloadWindow: true,
        showDockIcon: false,
        hideOnClose: true,
        escapeToHide: true,
      },
    ]);
  });

  it('captures relaunches before ready and initializes language before native UI', () => {
    expect(calls).toEqual([
      'userData',
      'ozone',
      'lifecycle',
      'whenReady',
      'languageHandlers',
      'language',
      'menubar',
      'attachLifecycle',
    ]);
  });

  it('skips initialization and native UI when another instance holds the lock', async () => {
    vi.resetModules();
    lifecycleMock.mockReturnValueOnce(undefined);
    calls.length = 0;

    await import('./index');

    expect(calls).toEqual(['userData', 'ozone']);
    expect(menubarMock).not.toHaveBeenCalled();
    expect(attachLifecycleMock).not.toHaveBeenCalled();
    const { registerLanguageHandlers, registerNativeNotificationHandlers } =
      await import('./handlers');
    const { onFirstRunMaybe } = await import('./lifecycle');
    expect(registerLanguageHandlers).not.toHaveBeenCalled();
    expect(registerNativeNotificationHandlers).not.toHaveBeenCalled();
    expect(onFirstRunMaybe).not.toHaveBeenCalled();
  });

  it('logs an error when Electron fails to become ready', async () => {
    vi.resetModules();
    vi.doMock('electron', () => ({
      app: {
        isPackaged: true,
        whenReady: vi.fn(() => Promise.reject(new Error('ready-failed'))),
        on: vi.fn(),
      },
    }));
    vi.doMock('../shared/logger', () => ({
      logError: vi.fn(),
      toError: (err: unknown) => (err instanceof Error ? err : new Error(String(err))),
    }));

    const { logError } = await import('../shared/logger');

    await import('./index');

    await vi.waitFor(() =>
      expect(logError).toHaveBeenCalledWith(
        'main',
        'Failed to initialize application',
        expect.any(Error),
      ),
    );
  });
});
