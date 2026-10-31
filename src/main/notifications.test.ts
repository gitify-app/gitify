import type { Menubar } from 'electron-menubar';

import { EVENTS, type INativeNotificationPayload } from '../shared/events';

const sendRendererEventMock = vi.fn();

vi.mock('./events', () => ({
  sendRendererEvent: (...args: unknown[]) => sendRendererEventMock(...args),
}));

vi.mock('../shared/logger', () => ({
  logError: vi.fn(),
}));

vi.mock('electron', () => {
  class MockNotification {
    static instances: MockNotification[] = [];
    static isSupported = vi.fn(() => true);
    static remove = vi.fn();
    static removeAll = vi.fn();

    id: string;
    options: unknown;
    show = vi.fn();
    close = vi.fn();
    private listeners = new Map<string, (...args: unknown[]) => void>();

    constructor(options: { id: string }) {
      this.id = options.id;
      this.options = options;
      MockNotification.instances.push(this);
    }

    on(event: string, listener: (...args: unknown[]) => void) {
      this.listeners.set(event, listener);
      return this;
    }

    emit(event: string, ...args: unknown[]) {
      this.listeners.get(event)?.(...args);
    }
  }

  return { Notification: MockNotification };
});

import { Notification } from 'electron';

import { NativeNotificationService, validateNativeNotificationPayload } from './notifications';

interface NotificationMock {
  id: string;
  options: Record<string, unknown>;
  show: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  emit: (event: string, ...args: unknown[]) => void;
}

const NotificationMock = Notification as unknown as {
  instances: NotificationMock[];
  isSupported: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  removeAll: ReturnType<typeof vi.fn>;
};

function makeMenubar() {
  const send = vi.fn();
  const webContentsListeners = new Map<string, () => void>();
  const mb = {
    window: {
      webContents: {
        send,
        on: (event: string, listener: () => void) => webContentsListeners.set(event, listener),
      },
      isDestroyed: () => false,
    },
  } as unknown as Menubar;

  return { mb, emitWebContents: (event: string) => webContentsListeners.get(event)?.() };
}

const basePayload: INativeNotificationPayload = {
  id: 'n1a2b3c4d5e6',
  title: 'owner/repo',
  subtitle: 'Updated · @octocat',
  body: 'A title',
  actionLabel: 'Mark as read',
};

describe('main/notifications.ts', () => {
  beforeEach(() => {
    NotificationMock.instances = [];
    NotificationMock.isSupported.mockReturnValue(true);
    NotificationMock.remove.mockClear();
    NotificationMock.removeAll.mockClear();
    sendRendererEventMock.mockClear();
  });

  it('does not construct a notification when the platform does not support them', () => {
    NotificationMock.isSupported.mockReturnValue(false);
    const { mb } = makeMenubar();

    new NativeNotificationService(mb, 'darwin').show(basePayload);

    expect(NotificationMock.instances).toHaveLength(0);
  });

  it('constructs a macOS notification with a subtitle and one action', () => {
    const { mb } = makeMenubar();

    new NativeNotificationService(mb, 'darwin').show(basePayload);

    expect(NotificationMock.instances[0].options).toMatchObject({
      id: basePayload.id,
      title: basePayload.title,
      subtitle: basePayload.subtitle,
      body: basePayload.body,
      silent: true,
      actions: [{ type: 'button', text: 'Mark as read' }],
    });
  });

  it('folds the subtitle into the body on Windows and Linux', () => {
    const { mb } = makeMenubar();

    new NativeNotificationService(mb, 'linux').show(basePayload);

    expect(NotificationMock.instances[0].options).toMatchObject({
      subtitle: undefined,
      body: `${basePayload.subtitle}\n${basePayload.body}`,
    });
  });

  it('publishes a notification without actions when no label is provided', () => {
    const { mb } = makeMenubar();

    new NativeNotificationService(mb, 'darwin').show({ ...basePayload, actionLabel: undefined });

    expect(NotificationMock.instances[0].options).toMatchObject({ actions: [] });
  });

  it('delivers clicks and the Mark as read action after the renderer is ready', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');
    service.show(basePayload);
    service.markRendererReady();

    const instance = NotificationMock.instances[0];
    instance.emit('click');
    instance.emit('action', { actionIndex: 0 });

    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: basePayload.id,
    });
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_ACTION, {
      id: basePayload.id,
    });
  });

  it('ignores unknown action indexes', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');
    service.show(basePayload);
    service.markRendererReady();

    NotificationMock.instances[0].emit('action', { actionIndex: 1 });

    expect(sendRendererEventMock).not.toHaveBeenCalled();
  });

  it('queues interactions until the renderer is ready', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');
    service.show(basePayload);

    NotificationMock.instances[0].emit('click');
    expect(sendRendererEventMock).not.toHaveBeenCalled();

    service.markRendererReady();
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: basePayload.id,
    });
  });

  it('queues interactions again while the renderer reloads', () => {
    const { mb, emitWebContents } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');
    service.show(basePayload);
    service.markRendererReady();

    emitWebContents('did-start-loading');
    NotificationMock.instances[0].emit('click');
    expect(sendRendererEventMock).not.toHaveBeenCalled();

    service.markRendererReady();
    expect(sendRendererEventMock).toHaveBeenCalledTimes(1);
  });

  it('replaces an existing notification with the same identity', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');

    service.show(basePayload);
    service.show({ ...basePayload, body: 'Updated body' });

    expect(NotificationMock.instances[0].close).toHaveBeenCalledTimes(1);
    expect(NotificationMock.instances).toHaveLength(2);
  });

  it('removes notifications by identity', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');
    service.show(basePayload);

    service.remove({ ids: [basePayload.id] });

    expect(NotificationMock.instances[0].close).toHaveBeenCalledTimes(1);
    expect(NotificationMock.remove).toHaveBeenCalledWith(basePayload.id);
  });

  it('removes every published notification', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');
    service.show(basePayload);
    service.show({ ...basePayload, id: 'n2b3c4d5e6f7' });

    service.removeAll();

    expect(
      NotificationMock.instances.every((instance) => instance.close.mock.calls.length === 1),
    ).toBe(true);
    expect(NotificationMock.removeAll).toHaveBeenCalled();
  });

  it('validates identifiers and action labels', () => {
    expect(validateNativeNotificationPayload(basePayload)).toBe(true);
    expect(validateNativeNotificationPayload({ ...basePayload, id: '' })).toBe(false);
    expect(validateNativeNotificationPayload({ ...basePayload, id: 'n'.repeat(65) })).toBe(false);
    expect(validateNativeNotificationPayload({ ...basePayload, title: ' ' })).toBe(false);
    expect(validateNativeNotificationPayload({ ...basePayload, actionLabel: ' ' })).toBe(false);
    expect(validateNativeNotificationPayload({ ...basePayload, actionLabel: 'x'.repeat(65) })).toBe(
      false,
    );
    expect(
      validateNativeNotificationPayload({ ...basePayload, actionLabel: 1 as unknown as string }),
    ).toBe(false);
  });
});
