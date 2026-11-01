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
    show: (payload: { id: string; title: string; body: string; actionLabel?: string }) => void;
    remove: (payload: { ids: string[] }) => void;
    removeAll: () => void;
    notifyReady: () => void;
    onAction: (callback: (payload: { id: string }) => void) => () => void;
    onClick: (callback: (payload: { id: string }) => void) => () => void;
  };
  onZoom: (callback: (action: 'in' | 'out' | 'reset') => void) => () => void;
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

  it('onZoom forwards the requested zoom action', () => {
    const api = getExposedApi();
    const callback = vi.fn();

    api.onZoom(callback);

    expect(onRendererEventMock).toHaveBeenCalledWith(EVENTS.ZOOM, expect.any(Function));

    const listener = onRendererEventMock.mock.calls.at(-1)?.[1] as (
      event: unknown,
      action: 'in' | 'out' | 'reset',
    ) => void;

    listener({}, 'out');

    expect(callback).toHaveBeenCalledWith('out');
  });

  it('nativeNotifications.show sends a structured payload', () => {
    const api = getExposedApi();
    const payload = { id: 'n1', title: 'owner/repo', body: 'Title', actionLabel: 'Mark as read' };

    api.nativeNotifications.show(payload);

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_SHOW, payload);
  });

  it('nativeNotifications.remove sends identities', () => {
    const api = getExposedApi();

    api.nativeNotifications.remove({ ids: ['n1'] });

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_REMOVE, {
      ids: ['n1'],
    });
  });

  it('nativeNotifications removeAll and notifyReady send commands', () => {
    const api = getExposedApi();

    api.nativeNotifications.removeAll();
    api.nativeNotifications.notifyReady();

    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_REMOVE_ALL);
    expect(sendMainEventMock).toHaveBeenCalledWith(EVENTS.NATIVE_NOTIFICATION_READY);
  });

  it('nativeNotifications.onAction forwards actions and cleans up', () => {
    const api = getExposedApi();
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    onRendererEventMock.mockReturnValueOnce(unsubscribe);

    const result = api.nativeNotifications.onAction(callback);
    const listener = onRendererEventMock.mock.calls.at(-1)?.[1] as (
      event: unknown,
      payload: { id: string },
    ) => void;
    listener({}, { id: 'n1' });

    expect(onRendererEventMock).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_ACTION,
      expect.any(Function),
    );
    expect(callback).toHaveBeenCalledWith({ id: 'n1' });

    result();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it('nativeNotifications.onClick forwards clicks and cleans up', () => {
    const api = getExposedApi();
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    onRendererEventMock.mockReturnValueOnce(unsubscribe);

    const result = api.nativeNotifications.onClick(callback);
    const listener = onRendererEventMock.mock.calls.at(-1)?.[1] as (
      event: unknown,
      payload: { id: string },
    ) => void;
    listener({}, { id: 'summary' });

    expect(onRendererEventMock).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_CLICK,
      expect.any(Function),
    );
    expect(callback).toHaveBeenCalledWith({ id: 'summary' });

    result();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
