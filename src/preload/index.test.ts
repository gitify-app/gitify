import { EVENTS } from '../shared/events';

// Mocks shared modules used inside preload
const sendMainEventMock = vi.fn();
const invokeMainEventMock = vi.fn();
const onRendererEventMock = vi.fn();
const logErrorMock = vi.fn();

vi.mock('./utils', () => ({
  sendMainEvent: (...args: unknown[]) => sendMainEventMock(...args),
  invokeMainEvent: (...args: unknown[]) => invokeMainEventMock(...args),
  onRendererEvent: (...args: unknown[]) => onRendererEventMock(...args),
}));

vi.mock('../shared/logger', () => ({
  logError: (...args: unknown[]) => logErrorMock(...args),
}));

// We'll reconfigure the electron mock per context isolation scenario.
const exposeInMainWorldMock = vi.fn();
const getZoomLevelMock = vi.fn(() => 1);
const setZoomLevelMock = vi.fn((_level: number) => undefined);

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: (key: string, value: unknown) =>
      exposeInMainWorldMock(key, value),
  },
  webFrame: {
    getZoomLevel: () => getZoomLevelMock(),
    setZoomLevel: (level: number) => setZoomLevelMock(level),
  },
}));

// Simple Notification stub
class MockNotification {
  static instances: MockNotification[] = [];
  public onclick: (() => void) | null = null;
  constructor(
    public title: string,
    public options: { body: string; silent: boolean },
  ) {
    MockNotification.instances.push(this);
  }
  triggerClick() {
    this.onclick?.();
  }
}

// Attach to global before importing preload
(global as unknown as { Notification: unknown }).Notification =
  MockNotification;

interface TestApi {
  tray: { updateColor: (n?: number) => void };
  openExternalLink: (u: string, f: boolean) => void;
  app: { version: () => Promise<string>; show?: () => void; hide?: () => void };
  onSystemThemeUpdate: (cb: (t: string) => void) => void;
  raiseNativeNotification: (t: string, b: string, u?: string) => unknown;
}

describe('preload/index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // default to non-isolated environment for most tests
    (process as unknown as { contextIsolated?: boolean }).contextIsolated =
      false;
  });

  const importPreload = async () => {
    // Ensure a fresh module instance each time
    vi.resetModules();
    return await import('./index');
  };

  it('exposes api on window when context isolation disabled', async () => {
    await importPreload();

    const w = window as unknown as { gitify: Record<string, unknown> };

    expect(w.gitify).toBeDefined();
    expect(exposeInMainWorldMock).not.toHaveBeenCalled();
  });

  it('exposes api via contextBridge when context isolation enabled', async () => {
    (process as unknown as { contextIsolated?: boolean }).contextIsolated =
      true;
    await importPreload();

    expect(exposeInMainWorldMock).toHaveBeenCalledTimes(1);

    const [key, api] = exposeInMainWorldMock.mock.calls[0];
    expect(key).toBe('gitify');
    expect(api).toHaveProperty('openExternalLink');
  });

  it('tray.updateColor sends correct events', async () => {
    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify; // casting only in test boundary
    api.tray.updateColor(-1);

    expect(sendMainEventMock).toHaveBeenNthCalledWith(
      1,
      EVENTS.UPDATE_ICON_COLOR,
      -1,
    );
  });

  it('openExternalLink sends event with payload', async () => {
    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify;
    api.openExternalLink('https://example.com', true);

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.OPEN_EXTERNAL, {
      url: 'https://example.com',
      activate: true,
    });
  });

  it('app.version returns dev in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify;

    await expect(api.app.version()).resolves.toBe('dev');
    process.env.NODE_ENV = originalEnv;
  });

  it('app.version prefixes production version', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    invokeMainEventMock.mockResolvedValueOnce('1.2.3');

    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify;

    await expect(api.app.version()).resolves.toBe('v1.2.3');
    process.env.NODE_ENV = originalEnv;
  });

  it('onSystemThemeUpdate registers listener', async () => {
    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify;
    const callbackMock = vi.fn();
    api.onSystemThemeUpdate(callbackMock);

    expect(onRendererEventMock).toHaveBeenCalledWith(
      EVENTS.UPDATE_THEME,
      expect.any(Function),
    );

    // Simulate event
    const listener = onRendererEventMock.mock.calls[0][1];
    listener({}, 'dark');

    expect(callbackMock).toHaveBeenCalledWith('dark');
  });

  it('raiseNativeNotification without url calls app.show', async () => {
    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify;
    api.app.show = vi.fn();

    const notification = api.raiseNativeNotification(
      'Title',
      'Body',
    ) as MockNotification;

    notification.triggerClick();

    expect(api.app.show).toHaveBeenCalled();
  });

  it('raiseNativeNotification with url hides app then opens link', async () => {
    await importPreload();

    const api = (window as unknown as { gitify: TestApi }).gitify;
    api.app.hide = vi.fn();
    api.openExternalLink = vi.fn();

    const notification = api.raiseNativeNotification(
      'Title',
      'Body',
      'https://x',
    ) as MockNotification;

    notification.triggerClick();

    expect(api.app.hide).toHaveBeenCalled();
    expect(api.openExternalLink).toHaveBeenCalledWith('https://x', true);
  });
});
