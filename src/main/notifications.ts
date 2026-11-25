import { Notification } from 'electron';
import type { Menubar } from 'electron-menubar';

import {
  EVENTS,
  type INativeNotificationActionEvent,
  type INativeNotificationClickEvent,
  type INativeNotificationPayload,
  type INativeNotificationRemovePayload,
} from '../shared/events';
import { logError } from '../shared/logger';

import { sendRendererEvent } from './events';

// Windows caps a toast tag at 64 characters.
const MAX_IDENTIFIER_LENGTH = 64;
const MAX_ACTION_LABEL_LENGTH = 64;
const MAX_QUEUED_INTERACTIONS = 20;

type QueuedInteraction =
  | { event: 'action'; payload: INativeNotificationActionEvent }
  | { event: 'click'; payload: INativeNotificationClickEvent };

/**
 * Owns operating-system notifications in the main process.
 *
 * The sandboxed preload cannot construct Electron notifications, so every
 * publish, removal, click, and action is routed through this service.
 */
export class NativeNotificationService {
  private readonly live = new Map<string, Notification>();
  private readonly queue: QueuedInteraction[] = [];
  private readonly watchedWindows = new WeakSet<Electron.BrowserWindow>();
  private rendererReady = false;

  constructor(
    private readonly mb: Menubar,
    private readonly platform: NodeJS.Platform = process.platform,
  ) {}

  show(payload: INativeNotificationPayload): void {
    if (!Notification.isSupported() || !validateNativeNotificationPayload(payload)) {
      return;
    }

    // Receiving a show means the renderer is loaded and its interaction
    // listeners are mounted: the publish effect runs after the listener
    // registration effect. Treat that as readiness so a missed one-shot ready
    // message cannot leave every click and action queued forever.
    this.markRendererReady();

    this.closeOne(payload.id);

    const subtitle = this.platform === 'darwin' ? payload.subtitle : undefined;
    const body =
      this.platform !== 'darwin' && payload.subtitle
        ? `${payload.subtitle}\n${payload.body}`
        : payload.body;

    const notification = new Notification({
      id: payload.id,
      title: payload.title,
      subtitle,
      body,
      silent: true,
      actions: payload.actionLabel ? [{ type: 'button', text: payload.actionLabel }] : [],
    });

    notification.on('click', () => {
      this.deliver('click', { id: payload.id });
    });

    // A notification publishes at most one action. Accept the details object
    // and the deprecated positional index so an action is never swallowed.
    notification.on('action', (details, actionIndex) => {
      if (payload.actionLabel && readActionIndex(details, actionIndex) === 0) {
        this.deliver('action', { id: payload.id });
      }
    });

    notification.on('failed', (_event, error) => {
      logError('native-notifications', 'Failed to show a native notification', new Error(error), [
        payload.id,
      ]);
    });

    this.live.set(payload.id, notification);
    notification.show();
  }

  remove(payload: INativeNotificationRemovePayload): void {
    for (const id of payload.ids) {
      this.closeOne(id);
    }
  }

  removeAll(): void {
    for (const notification of this.live.values()) {
      notification.close();
    }

    this.live.clear();
    this.queue.length = 0;

    if (this.platform === 'darwin' && typeof Notification.removeAll === 'function') {
      Notification.removeAll();
    }
  }

  markRendererReady(): void {
    this.rendererReady = true;
    this.canSendToRenderer();
    this.flushQueue();
  }

  /** Dismiss published notifications so none survive without an owner. */
  destroy(): void {
    this.removeAll();
  }

  private closeOne(id: string): void {
    const notification = this.live.get(id);

    if (notification) {
      notification.close();
      this.live.delete(id);
    }

    if (this.platform === 'darwin' && typeof Notification.remove === 'function') {
      Notification.remove(id);
    }
  }

  private deliver(
    event: QueuedInteraction['event'],
    payload: INativeNotificationActionEvent | INativeNotificationClickEvent,
  ): void {
    if (this.canSendToRenderer()) {
      this.send(event, payload);
      return;
    }

    this.queue.push({ event, payload } as QueuedInteraction);

    if (this.queue.length > MAX_QUEUED_INTERACTIONS) {
      this.queue.shift();
    }
  }

  private canSendToRenderer(): boolean {
    const window = this.mb.window;

    if (window) {
      this.watchRendererReloads(window);
    }

    if (!this.rendererReady || !window) {
      return false;
    }

    return typeof window.isDestroyed !== 'function' || !window.isDestroyed();
  }

  private send(
    event: QueuedInteraction['event'],
    payload: INativeNotificationActionEvent | INativeNotificationClickEvent,
  ): void {
    sendRendererEvent(
      this.mb,
      event === 'action' ? EVENTS.NATIVE_NOTIFICATION_ACTION : EVENTS.NATIVE_NOTIFICATION_CLICK,
      payload,
    );
  }

  /** A reloading renderer drops its listeners, so queue until it reports ready. */
  private watchRendererReloads(window: Electron.BrowserWindow): void {
    if (this.watchedWindows.has(window)) {
      return;
    }

    this.watchedWindows.add(window);
    window.webContents?.on('did-start-loading', () => {
      this.rendererReady = false;
    });
  }

  private flushQueue(): void {
    while (this.queue.length > 0 && this.canSendToRenderer()) {
      const interaction = this.queue.shift()!;
      this.send(interaction.event, interaction.payload);
    }
  }
}

/** Validate every field that crosses the renderer/main boundary. */
export function validateNativeNotificationPayload(payload: INativeNotificationPayload): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  if (!isValidIdentifier(payload.id)) {
    return false;
  }

  if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
    return false;
  }

  if (typeof payload.body !== 'string') {
    return false;
  }

  if (payload.subtitle !== undefined && typeof payload.subtitle !== 'string') {
    return false;
  }

  return (
    payload.actionLabel === undefined ||
    (typeof payload.actionLabel === 'string' &&
      payload.actionLabel.trim().length > 0 &&
      payload.actionLabel.length <= MAX_ACTION_LABEL_LENGTH)
  );
}

function isValidIdentifier(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_IDENTIFIER_LENGTH &&
    !Array.from(value).some((character) => {
      const code = character.codePointAt(0) ?? 0;
      return code < 32 || code === 127;
    })
  );
}

/** Read the activated action index from the event details or legacy argument. */
function readActionIndex(details: unknown, legacyActionIndex: unknown): number | undefined {
  const fromDetails =
    details && typeof details === 'object' && 'actionIndex' in details
      ? (details as { actionIndex?: unknown }).actionIndex
      : undefined;
  const value = fromDetails ?? (typeof details === 'number' ? details : legacyActionIndex);

  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
  }

  return undefined;
}
