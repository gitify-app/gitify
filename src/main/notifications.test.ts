import type { Menubar } from 'electron-menubar';

import { EVENTS, type INativeNotificationPayload } from '../shared/events';

const sendRendererEventMock = vi.fn();

vi.mock('./events', () => ({
  sendRendererEvent: (...args: unknown[]) => sendRendererEventMock(...args),
}));

vi.mock('../shared/logger', () => ({
  logError: vi.fn(),
  toError: (error: unknown) => (error instanceof Error ? error : new Error(String(error))),
}));

vi.mock('electron', () => {
  class MockNotification {
    static instances: MockNotification[] = [];
    static isSupported = vi.fn(() => true);
    static remove = vi.fn();
    static removeAll = vi.fn();
    static removeGroup = vi.fn();
    static getHistory = vi.fn(async () => []);
    static handleActivation = vi.fn();

    id: string;
    groupId?: string;
    options: unknown;
    show = vi.fn();
    close = vi.fn();
    private listeners = new Map<string, (...args: unknown[]) => void>();

    constructor(options: { id: string; groupId?: string }) {
      this.id = options.id;
      this.groupId = options.groupId;
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
  groupId?: string;
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
  removeGroup: ReturnType<typeof vi.fn>;
  getHistory: ReturnType<typeof vi.fn>;
  handleActivation: ReturnType<typeof vi.fn>;
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

  return { mb, send, emitWebContents: (event: string) => webContentsListeners.get(event)?.() };
}

const basePayload: INativeNotificationPayload = {
  id: 'n1a2b3c4d5e6',
  groupId: 'g1a2b3c4d5e6',
  groupTitle: 'owner/repo',
  title: 'owner/repo',
  subtitle: 'Updated · @octocat',
  body: 'A title',
  actions: [
    { id: 'show', label: 'Afficher' },
    { id: 'read', label: 'Marquer comme lu' },
    { id: 'unsubscribe', label: 'Se désabonner' },
  ],
  keepVisible: false,
};

describe('main/notifications.ts', () => {
  beforeEach(() => {
    NotificationMock.instances = [];
    NotificationMock.isSupported.mockReturnValue(true);
    NotificationMock.remove.mockClear();
    NotificationMock.removeAll.mockClear();
    NotificationMock.removeGroup.mockClear();
    NotificationMock.getHistory.mockResolvedValue([]);
    NotificationMock.handleActivation.mockClear();
    sendRendererEventMock.mockClear();
  });

  it('returns unsupported without constructing a notification', () => {
    NotificationMock.isSupported.mockReturnValue(false);
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');

    expect(service.show(basePayload)).toEqual({ supported: false });
    expect(NotificationMock.instances).toHaveLength(0);
  });

  it('constructs and shows a notification with the requested options', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');

    expect(service.show(basePayload)).toEqual({ supported: true });
    const instance = NotificationMock.instances[0];

    expect(instance.options).toMatchObject({
      id: basePayload.id,
      groupId: basePayload.groupId,
      title: basePayload.title,
      body: `${basePayload.subtitle}\n${basePayload.body}`,
      silent: true,
      timeoutType: 'default',
      // Labels come from the renderer so they follow the interface language.
      actions: [
        { type: 'button', text: 'Afficher' },
        { type: 'button', text: 'Marquer comme lu' },
        { type: 'button', text: 'Se désabonner' },
      ],
    });
    expect(instance.show).toHaveBeenCalledTimes(1);
  });

  it('uses subtitle on macOS and keep-visible timeout when requested', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');

    service.show({ ...basePayload, keepVisible: true });
    const instance = NotificationMock.instances[0];

    expect(instance.options.subtitle).toBe(basePayload.subtitle);
    expect(instance.options.body).toBe(basePayload.body);
    expect(instance.options.timeoutType).toBe('never');
  });

  it('replaces an existing notification with the same identity', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');

    service.show(basePayload);
    const first = NotificationMock.instances[0];
    service.show(basePayload);

    expect(first.close).toHaveBeenCalledTimes(1);
    expect(NotificationMock.instances).toHaveLength(2);
  });

  it('rejects malformed payloads without constructing a notification', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');

    expect(service.show({ ...basePayload, id: '' })).toEqual({ supported: true });
    expect(
      service.show({
        ...basePayload,
        actions: [
          { id: 'unknown', label: 'x' },
        ] as unknown as INativeNotificationPayload['actions'],
      }),
    ).toEqual({ supported: true });
    expect(NotificationMock.instances).toHaveLength(0);
  });

  it('validates identifiers and actions', () => {
    expect(validateNativeNotificationPayload(basePayload)).toBe(true);
    expect(validateNativeNotificationPayload({ ...basePayload, groupId: '' })).toBe(false);
    expect(
      validateNativeNotificationPayload({
        ...basePayload,
        actions: [
          { id: 'show', label: 'Show' },
          { id: 'bad', label: 'Bad' },
        ] as unknown as INativeNotificationPayload['actions'],
      }),
    ).toBe(false);
    expect(
      validateNativeNotificationPayload({
        ...basePayload,
        actions: ['show'] as unknown as INativeNotificationPayload['actions'],
      }),
    ).toBe(false);
    expect(
      validateNativeNotificationPayload({ ...basePayload, actions: [{ id: 'read', label: ' ' }] }),
    ).toBe(false);
    expect(
      validateNativeNotificationPayload({
        ...basePayload,
        actions: [{ id: 'read', label: 'x'.repeat(65) }],
      }),
    ).toBe(false);
  });

  it('rejects identities longer than the Windows toast limit', () => {
    expect(validateNativeNotificationPayload({ ...basePayload, id: 'n'.repeat(64) })).toBe(true);
    expect(validateNativeNotificationPayload({ ...basePayload, id: 'n'.repeat(65) })).toBe(false);
    expect(validateNativeNotificationPayload({ ...basePayload, groupId: 'g'.repeat(65) })).toBe(
      false,
    );
  });

  it('delivers click and action events after the renderer is ready', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');
    service.show(basePayload);
    service.markRendererReady();

    const instance = NotificationMock.instances[0];
    instance.emit('click');
    instance.emit('action', { actionIndex: 1 });

    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: basePayload.id,
    });
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_ACTION, {
      id: basePayload.id,
      action: 'read',
    });
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

    NotificationMock.instances[0].emit('click');
    expect(sendRendererEventMock).toHaveBeenCalledTimes(1);

    emitWebContents('did-start-loading');
    NotificationMock.instances[0].emit('click');
    expect(sendRendererEventMock).toHaveBeenCalledTimes(1);

    service.markRendererReady();
    expect(sendRendererEventMock).toHaveBeenCalledTimes(2);
  });

  it('keeps delivered notifications when the service is destroyed', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');
    service.show(basePayload);

    service.destroy();

    expect(NotificationMock.instances[0].close).not.toHaveBeenCalled();
    expect(NotificationMock.removeAll).not.toHaveBeenCalled();
  });

  it('removes by identity, group, and all', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');
    service.show(basePayload);
    service.show({ ...basePayload, id: 'second' });

    service.remove({ ids: [basePayload.id] });
    expect(NotificationMock.instances[0].close).toHaveBeenCalledTimes(1);
    expect(NotificationMock.remove).toHaveBeenCalledWith(basePayload.id);

    service.remove({ groupId: basePayload.groupId });
    expect(NotificationMock.instances[1].close).toHaveBeenCalledTimes(1);
    expect(NotificationMock.removeGroup).toHaveBeenCalledWith(basePayload.groupId);

    service.removeAll();
    expect(NotificationMock.removeAll).toHaveBeenCalledTimes(1);
  });

  it('treats unknown identities as a no-op', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'linux');

    expect(() => service.remove({ ids: ['missing'] })).not.toThrow();
  });

  it('restores delivered macOS notifications', async () => {
    const history = [
      {
        id: 'history-id',
        on: vi.fn(),
        close: vi.fn(),
      },
    ];
    NotificationMock.getHistory.mockResolvedValue(history);
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'darwin');
    service.start();
    service.markRendererReady();

    await Promise.resolve();

    const handler = (event: string) =>
      history[0].on.mock.calls.find(([name]) => name === event)?.[1] as () => void;

    handler('click')();
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: 'history-id',
    });

    // Restored notifications lose their actions, so an action opens the notification.
    sendRendererEventMock.mockClear();
    handler('action')();
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: 'history-id',
    });
  });

  it('handles Windows activation through the registered callback', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'win32');
    service.start();
    service.markRendererReady();
    service.show(basePayload);

    const activation = NotificationMock.handleActivation.mock.calls[0][0] as (details: {
      type: string;
      arguments: string;
      actionIndex?: number;
    }) => void;

    activation({ type: 'action', arguments: basePayload.id, actionIndex: 1 });
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_ACTION, {
      id: basePayload.id,
      action: 'read',
    });

    activation({ type: 'click', arguments: '' });
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: '',
    });
  });

  it('delivers each Windows interaction once, through activation only', () => {
    const { mb } = makeMenubar();
    const service = new NativeNotificationService(mb, 'win32');
    service.start();
    service.markRendererReady();
    service.show(basePayload);

    // handleActivation also fires for live notifications, so instance events
    // must not be delivered as well.
    NotificationMock.instances[0].emit('click');
    NotificationMock.instances[0].emit('action', { actionIndex: 1 });
    expect(sendRendererEventMock).not.toHaveBeenCalled();

    const activation = NotificationMock.handleActivation.mock.calls[0][0] as (details: {
      type: string;
      arguments: string;
    }) => void;
    activation({ type: 'click', arguments: basePayload.id });

    expect(sendRendererEventMock).toHaveBeenCalledTimes(1);
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.NATIVE_NOTIFICATION_CLICK, {
      id: basePayload.id,
    });
  });
});
