import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EVENTS } from '../shared/events';

// Mocks shared modules used inside preload
const sendMainEvent = vi.fn();
const invokeMainEvent = vi.fn();
const onRendererEvent = vi.fn();
const logError = vi.fn();

vi.mock('./utils', () => ({
  sendMainEvent: (...args: unknown[]) => sendMainEvent(...args),
  invokeMainEvent: (...args: unknown[]) => invokeMainEvent(...args),
  onRendererEvent: (...args: unknown[]) => onRendererEvent(...args),
}));

vi.mock('../shared/logger', () => ({
  logError: (...args: unknown[]) => logError(...args),
}));

// We'll reconfigure the electron mock per context isolation scenario.
const exposeInMainWorld = vi.fn();
const getZoomLevel = vi.fn(() => 1);
const setZoomLevel = vi.fn((_level: number) => undefined);

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: (key: string, value: unknown) =>
      exposeInMainWorld(key, value),
  },
  webFrame: {
    getZoomLevel: () => getZoomLevel(),
    setZoomLevel: (level: number) => setZoomLevel(level),
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
  tray: { updateIcon: (n?: number) => void };
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
    expect(exposeInMainWorld).not.toHaveBeenCalled();
  });

  it('exposes api via contextBridge when context isolation enabled', async () => {
    (process as unknown as { contextIsolated?: boolean }).contextIsolated =
      true;
    await importPreload();
    expect(exposeInMainWorld).toHaveBeenCalledTimes(1);
    const [key, api] = exposeInMainWorld.mock.calls[0];
    expect(key).toBe('gitify');
    expect(api).toHaveProperty('openExternalLink');
  });

  it('tray.updateIcon sends correct events', async () => {
    await importPreload();
    const api = (window as unknown as { gitify: TestApi }).gitify; // casting only in test boundary
    api.tray.updateIcon(-1);
    api.tray.updateIcon(5);
    api.tray.updateIcon(0);
    expect(sendMainEvent).toHaveBeenNthCalledWith(1, EVENTS.ICON_ERROR);
    expect(sendMainEvent).toHaveBeenNthCalledWith(2, EVENTS.ICON_ACTIVE);
    expect(sendMainEvent).toHaveBeenNthCalledWith(3, EVENTS.ICON_IDLE);
  });

  it('openExternalLink sends event with payload', async () => {
    await importPreload();
    const api = (window as unknown as { gitify: TestApi }).gitify;
    api.openExternalLink('https://example.com', true);
    expect(sendMainEvent).toHaveBeenCalledWith(EVENTS.OPEN_EXTERNAL, {
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
    invokeMainEvent.mockResolvedValueOnce('1.2.3');
    await importPreload();
    const api = (window as unknown as { gitify: TestApi }).gitify;
    await expect(api.app.version()).resolves.toBe('v1.2.3');
    process.env.NODE_ENV = originalEnv;
  });

  it('onSystemThemeUpdate registers listener', async () => {
    await importPreload();
    const api = (window as unknown as { gitify: TestApi }).gitify;
    const callback = vi.fn();
    api.onSystemThemeUpdate(callback);
    expect(onRendererEvent).toHaveBeenCalledWith(
      EVENTS.UPDATE_THEME,
      expect.any(Function),
    );
    // Simulate event
    const listener = onRendererEvent.mock.calls[0][1];
    listener({}, 'dark');
    expect(callback).toHaveBeenCalledWith('dark');
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
