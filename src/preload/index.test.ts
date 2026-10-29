import { EVENTS } from '../shared/events';

import { api } from './index';

// Mocks shared modules used inside preload
const {
  sendMainEventMock,
  invokeMainEventMock,
  onRendererEventMock,
  logErrorMock,
  exposeInMainWorldMock,
  getZoomLevelMock,
  setZoomLevelMock,
} = vi.hoisted(() => ({
  sendMainEventMock: vi.fn(),
  invokeMainEventMock: vi.fn(),
  onRendererEventMock: vi.fn(),
  logErrorMock: vi.fn(),
  exposeInMainWorldMock: vi.fn(),
  getZoomLevelMock: vi.fn(() => 1),
  setZoomLevelMock: vi.fn((_level: number) => undefined),
}));

vi.mock('./utils', () => ({
  sendMainEvent: (...args: unknown[]) => sendMainEventMock(...args),
  invokeMainEvent: (...args: unknown[]) => invokeMainEventMock(...args),
  invokeMainEventWithData: (...args: unknown[]) => invokeMainEventMock(...args),
  onRendererEvent: (...args: unknown[]) => onRendererEventMock(...args),
}));

vi.mock('../shared/logger', () => ({
  logError: (...args: unknown[]) => logErrorMock(...args),
}));

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: (key: string, value: unknown) => exposeInMainWorldMock(key, value),
  } satisfies Pick<Electron.ContextBridge, 'exposeInMainWorld'>,
  webFrame: {
    getZoomLevel: () => getZoomLevelMock(),
    setZoomLevel: (level: number) => setZoomLevelMock(level),
  } satisfies Pick<Electron.WebFrame, 'getZoomLevel' | 'setZoomLevel'>,
}));

interface TestApi {
  tray: { updateColor: (n?: number, isOnline?: boolean) => void };
  openExternalLink: (u: string, f: boolean) => void;
  setShowUpdateNotifications: (value: boolean) => void;
  setUseX11Backend: (value: boolean) => void;
  app: { version: () => Promise<string>; show?: () => void; hide?: () => void };
  nativeNotifications: {
    show: (payload: unknown) => Promise<unknown>;
    remove: (payload: unknown) => void;
    removeAll: () => void;
    notifyReady: () => void;
    isSupported: () => Promise<boolean>;
    onAction: (callback: (payload: unknown) => void) => () => void;
    onClick: (callback: (payload: unknown) => void) => () => void;
  };
}

describe('preload/index', () => {
  beforeEach(() => {
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

    expect(sendMainEventMock).toHaveBeenNthCalledWith(1, EVENTS.UPDATE_ICON_COLOR, {
      isOnline: true,
      notificationsCount: -1,
    });
  });

  it('setUseX11Backend sends the preference to main', async () => {
    const api = getExposedApi();

    api.setUseX11Backend(true);

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.UPDATE_USE_X11_BACKEND, true);
  });

  it('openExternalLink sends event with payload', async () => {
    const api = getExposedApi();

    api.openExternalLink('https://example.com', true);

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.OPEN_EXTERNAL, {
      url: 'https://example.com',
      activate: true,
    });
  });

  it('setShowUpdateNotifications sends the preference to main', () => {
    const api = getExposedApi();

    api.setShowUpdateNotifications(false);

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.UPDATE_SHOW_UPDATE_NOTIFICATIONS, false);
  });

  it('app.version returns dev in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const api = getExposedApi();

    await expect(api.app.version()).resolves.toBe('dev');
  });

  it('app.version prefixes production version', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    invokeMainEventMock.mockResolvedValueOnce('1.2.3');
    const api = getExposedApi();

    await expect(api.app.version()).resolves.toBe('v1.2.3');
  });

  it('nativeNotifications.show invokes the main process with the payload', async () => {
    const api = getExposedApi();
    const payload = {
      id: 'account:notification',
      title: 'Title',
      body: 'Body',
      actions: ['open'],
    };

    invokeMainEventMock.mockResolvedValueOnce({ supported: true });

    await expect(api.nativeNotifications.show(payload)).resolves.toEqual({ supported: true });
    expect(invokeMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_SHOW, payload);
  });

  it('nativeNotifications.remove sends the removal payload', () => {
    const api = getExposedApi();

    api.nativeNotifications.remove({ ids: ['one', 'two'] });

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_REMOVE, {
      ids: ['one', 'two'],
    });
  });

  it('nativeNotifications.removeAll sends the clear event', () => {
    const api = getExposedApi();

    api.nativeNotifications.removeAll();

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_REMOVE_ALL);
  });

  it('nativeNotifications.notifyReady sends the ready event', () => {
    const api = getExposedApi();

    api.nativeNotifications.notifyReady();

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_READY);
  });

  it('nativeNotifications.isSupported invokes the support query', async () => {
    const api = getExposedApi();

    invokeMainEventMock.mockResolvedValueOnce(false);

    await expect(api.nativeNotifications.isSupported()).resolves.toBe(false);
    expect(invokeMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_SUPPORTED);
  });

  it('nativeNotifications.onAction forwards actions and returns the unsubscribe function', () => {
    const api = getExposedApi();
    const unsubscribe = vi.fn();
    const callback = vi.fn();
    onRendererEventMock.mockReturnValueOnce(unsubscribe);

    const cleanup = api.nativeNotifications.onAction(callback);
    const listener = onRendererEventMock.mock.calls[0][1] as (
      event: unknown,
      payload: unknown,
    ) => void;
    const payload = { id: 'account:notification', action: 'read' };

    listener({}, payload);

    expect(onRendererEventMock).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_ACTION,
      expect.any(Function),
    );
    expect(callback).toHaveBeenCalledWith(payload);
    expect(cleanup).toBe(unsubscribe);
  });

  it('nativeNotifications.onClick forwards clicks and returns the unsubscribe function', () => {
    const api = getExposedApi();
    const unsubscribe = vi.fn();
    const callback = vi.fn();
    onRendererEventMock.mockReturnValueOnce(unsubscribe);

    const cleanup = api.nativeNotifications.onClick(callback);
    const listener = onRendererEventMock.mock.calls[0][1] as (
      event: unknown,
      payload: unknown,
    ) => void;
    const payload = { id: 'account:notification' };

    listener({}, payload);

    expect(onRendererEventMock).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_CLICK,
      expect.any(Function),
    );
    expect(callback).toHaveBeenCalledWith(payload);
    expect(cleanup).toBe(unsubscribe);
  });
});
