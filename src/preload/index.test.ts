import { EVENTS } from '../shared/events';

import { api } from './index';

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
    MockNotification.instances = [];
    exposeInMainWorldMock('gitify', api);
  });

  const getExposedApi = (): TestApi => {
    // API is always exposed via contextBridge
    const [, api] = exposeInMainWorldMock.mock.calls[0];
    return api as TestApi;
  };

  it('exposes api via contextBridge', async () => {
    expect(exposeInMainWorldMock).toHaveBeenCalledTimes(1);
    const [key, api] = exposeInMainWorldMock.mock.calls[0];
    expect(key).toBe('gitify');
    expect(api).toHaveProperty('openExternalLink');
    expect(api).toHaveProperty('app');
    expect(api).toHaveProperty('tray');
  });

  it('tray.updateColor sends correct events', async () => {
    const api = getExposedApi();

    api.tray.updateColor(-1);

    expect(sendMainEventMock).toHaveBeenNthCalledWith(
      1,
      EVENTS.UPDATE_ICON_COLOR,
      -1,
    );
  });

  it('openExternalLink sends event with payload', async () => {
    const api = getExposedApi();

    api.openExternalLink('https://example.com', true);

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.OPEN_EXTERNAL, {
      url: 'https://example.com',
      activate: true,
    });
  });

  it('app.version returns dev in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const api = getExposedApi();

    await expect(api.app.version()).resolves.toBe('dev');

    process.env.NODE_ENV = originalEnv;
  });

  it('app.version prefixes production version', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    invokeMainEventMock.mockResolvedValueOnce('1.2.3');
    const api = getExposedApi();

    await expect(api.app.version()).resolves.toBe('v1.2.3');
    process.env.NODE_ENV = originalEnv;
  });

  it('onSystemThemeUpdate registers listener', async () => {
    const api = getExposedApi();
    const callback = vi.fn();
    api.onSystemThemeUpdate(callback);

    expect(onRendererEventMock).toHaveBeenCalledWith(
      EVENTS.UPDATE_THEME,
      expect.any(Function),
    );

    // Simulate event
    const listener = onRendererEventMock.mock.calls[0][1];

    listener({}, 'dark');

    expect(callback).toHaveBeenCalledWith('dark');
  });

  it('raiseNativeNotification without url calls app.show', async () => {
    const api = getExposedApi();

    const notification = api.raiseNativeNotification(
      'Title',
      'Body',
    ) as MockNotification;

    notification.triggerClick();

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.WINDOW_SHOW);
  });

  it('raiseNativeNotification with url hides app then opens link', async () => {
    const api = getExposedApi();

    const notification = api.raiseNativeNotification(
      'Title',
      'Body',
      'https://x',
    ) as MockNotification;

    notification.triggerClick();

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.WINDOW_HIDE);
    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.OPEN_EXTERNAL, {
      url: 'https://x',
      activate: true,
    });
  });
});
