import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

const mocks = vi.hoisted(() => ({
  service: {
    start: vi.fn(),
    show: vi.fn(),
    isSupported: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn(),
    markRendererReady: vi.fn(),
    destroy: vi.fn(),
  },
  handleMainEvent: vi.fn(),
  onMainEvent: vi.fn(),
  appOnce: vi.fn(),
}));

vi.mock('../notifications', () => ({
  NativeNotificationService: vi.fn(function () {
    return mocks.service;
  }),
}));

vi.mock('../events', () => ({
  handleMainEvent: (...args: unknown[]) => mocks.handleMainEvent(...args),
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
    mocks.handleMainEvent.mockClear();
    mocks.onMainEvent.mockClear();
    mocks.appOnce.mockClear();
    mocks.service.start.mockClear();
    mocks.service.destroy.mockClear();
  });

  it('registers the show and support handlers plus the interaction listeners', () => {
    registerNativeNotificationHandlers(mb);

    expect(mocks.service.start).toHaveBeenCalledTimes(1);
    expect(mocks.handleMainEvent).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_SHOW,
      expect.any(Function),
    );
    expect(mocks.handleMainEvent).toHaveBeenCalledWith(
      EVENTS.NATIVE_NOTIFICATION_SUPPORTED,
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

  it('is idempotent', () => {
    const first = registerNativeNotificationHandlers(mb);
    const second = registerNativeNotificationHandlers(mb);

    expect(first).toBe(second);
    expect(mocks.service.start).toHaveBeenCalledTimes(1);
    expect(mocks.handleMainEvent).toHaveBeenCalledTimes(2);
    expect(mocks.onMainEvent).toHaveBeenCalledTimes(3);
  });

  it('destroys the service on will-quit', () => {
    registerNativeNotificationHandlers(mb);
    const willQuit = mocks.appOnce.mock.calls[0][1] as () => void;

    willQuit();

    expect(mocks.service.destroy).toHaveBeenCalledTimes(1);
  });
});
