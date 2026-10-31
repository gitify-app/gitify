import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

const mocks = vi.hoisted(() => ({
  service: {
    show: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn(),
    markRendererReady: vi.fn(),
    destroy: vi.fn(),
  },
  onMainEvent: vi.fn(),
  appOnce: vi.fn(),
}));

vi.mock('../notifications', () => ({
  NativeNotificationService: vi.fn(function () {
    return mocks.service;
  }),
}));

vi.mock('../events', () => ({
  onMainEvent: (...args: unknown[]) => mocks.onMainEvent(...args),
}));

vi.mock('electron', () => ({
  app: {
    once: (...args: unknown[]) => mocks.appOnce(...args),
  },
}));

import {
  __resetNativeNotificationServiceForTests,
  registerNativeNotificationHandlers,
} from './native-notifications';

describe('main/handlers/native-notifications.ts', () => {
  const mb = {} as Menubar;

  beforeEach(() => {
    __resetNativeNotificationServiceForTests();
    mocks.onMainEvent.mockClear();
    mocks.appOnce.mockClear();
    mocks.service.destroy.mockClear();
  });

  it('registers the notification commands and interaction listener', () => {
    registerNativeNotificationHandlers(mb);

    expect(mocks.onMainEvent).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_SHOW,
      expect.any(Function),
    );
    expect(mocks.onMainEvent).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_REMOVE,
      expect.any(Function),
    );
    expect(mocks.onMainEvent).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_REMOVE_ALL,
      expect.any(Function),
    );
    expect(mocks.onMainEvent).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_READY,
      expect.any(Function),
    );
    expect(mocks.appOnce).toHaveBeenCalledWith('will-quit', expect.any(Function));
  });

  it('forwards commands to the service', () => {
    registerNativeNotificationHandlers(mb);

    const handlers = Object.fromEntries(
      mocks.onMainEvent.mock.calls.map(([event, handler]) => [event, handler]),
    ) as Record<string, (_event: unknown, payload: unknown) => void>;

    const payload = { id: 'n1a2b3c4d5e6', title: 'Title', body: 'Body' };
    handlers[EVENTS.NATIVE_NOTIFICATION_SHOW]({}, payload);
    handlers[EVENTS.NATIVE_NOTIFICATION_REMOVE]({}, { ids: [payload.id] });
    handlers[EVENTS.NATIVE_NOTIFICATION_REMOVE_ALL]({}, undefined);
    handlers[EVENTS.NATIVE_NOTIFICATION_READY]({}, undefined);

    expect(mocks.service.show).toHaveBeenCalledWith(payload);
    expect(mocks.service.remove).toHaveBeenCalledWith({ ids: [payload.id] });
    expect(mocks.service.removeAll).toHaveBeenCalledTimes(1);
    expect(mocks.service.markRendererReady).toHaveBeenCalledTimes(1);
  });

  it('is idempotent', () => {
    const first = registerNativeNotificationHandlers(mb);
    const second = registerNativeNotificationHandlers(mb);

    expect(first).toBe(second);
    expect(mocks.onMainEvent).toHaveBeenCalledTimes(4);
  });

  it('destroys the service on will-quit', () => {
    registerNativeNotificationHandlers(mb);
    const willQuit = mocks.appOnce.mock.calls[0][1] as () => void;

    willQuit();

    expect(mocks.service.destroy).toHaveBeenCalledTimes(1);
  });
});
