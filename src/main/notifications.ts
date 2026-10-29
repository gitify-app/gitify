import { Notification } from 'electron';
import type { Menubar } from 'electron-menubar';

import {
  EVENTS,
  type INativeNotificationAction,
  type INativeNotificationActionEvent,
  type INativeNotificationClickEvent,
  type INativeNotificationPayload,
  type INativeNotificationRemovePayload,
  type INativeNotificationShowResult,
  type NativeNotificationActionId,
} from '../shared/events';
import { logError, toError } from '../shared/logger';

import { sendRendererEvent } from './events';

const ALLOWED_ACTIONS: ReadonlySet<NativeNotificationActionId> = new Set([
  'show',
  'read',
  'done',
  'unsubscribe',
]);

// Windows caps a toast's tag and group at 64 characters.
const MAX_IDENTIFIER_LENGTH = 64;
const MAX_ACTION_LABEL_LENGTH = 64;
const MAX_QUEUED_INTERACTIONS = 20;

type QueuedInteraction =
  | { event: 'action'; payload: INativeNotificationActionEvent }
  | { event: 'click'; payload: INativeNotificationClickEvent };

interface LiveNotification {
  notification: Notification;
  groupId?: string;
  actions: NativeNotificationActionId[];
}

/**
 * Owns operating-system notifications in the main process.
 *
 * The sandboxed preload cannot reach Electron's `Notification` class, so every
 * publish, removal, click, and action is routed through this service.
 */
export class NativeNotificationService {
  private readonly live = new Map<string, LiveNotification>();
  private readonly queue: QueuedInteraction[] = [];
  private history: Notification[] = [];
  private rendererReady = false;
  private readonly watchedWindows = new WeakSet<Electron.BrowserWindow>();
  private started = false;

  constructor(
    private readonly mb: Menubar,
    private readonly platform: NodeJS.Platform = process.platform,
  ) {}

  /** Install platform-specific interaction handling. Idempotent. */
  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.restoreDeliveredHistory();
    this.registerWindowsActivation();
  }

  isSupported(): boolean {
    return Notification.isSupported();
  }

  show(payload: INativeNotificationPayload): INativeNotificationShowResult {
    if (!this.isSupported()) {
      return { supported: false };
    }

    if (!validateNativeNotificationPayload(payload)) {
      return { supported: true };
    }

    this.closeOne(payload.id);

    const subtitle = this.platform === 'darwin' ? payload.subtitle : undefined;
    const body =
      this.platform !== 'darwin' && payload.subtitle
        ? `${payload.subtitle}\n${payload.body}`
        : payload.body;

    const actionIds = payload.actions.map((action) => action.id);
    const notification = new Notification({
      id: payload.id,
      groupId: payload.groupId,
      groupTitle: payload.groupTitle,
      title: payload.title,
      subtitle,
      body,
      silent: true,
      timeoutType: payload.keepVisible ? 'never' : 'default',
      actions: payload.actions.map((action) => ({
        type: 'button',
        text: action.label,
      })),
    });

    // On Windows, `Notification.handleActivation` already receives every click
    // and action, in addition to these instance events, so listening to both
    // would deliver each interaction twice.
    if (this.platform !== 'win32') {
      notification.on('click', () => {
        this.deliver('click', { id: payload.id });
      });

      notification.on('action', (details) => {
        const action = actionIds[details.actionIndex];

        if (action) {
          this.deliver('action', { id: payload.id, action });
        }
      });
    }

    notification.on('failed', (_event, error) => {
      logError('native-notifications', 'Failed to show a native notification', new Error(error), [
        payload.id,
      ]);
    });

    this.live.set(payload.id, {
      notification,
      groupId: payload.groupId,
      actions: actionIds,
    });
    notification.show();

    return { supported: true };
  }

  remove(payload: INativeNotificationRemovePayload): void {
    for (const id of payload.ids ?? []) {
      this.closeOne(id);
    }

    if (payload.groupId) {
      this.closeGroup(payload.groupId);
    }
  }

  removeAll(): void {
    for (const entry of this.live.values()) {
      entry.notification.close();
    }
    this.live.clear();
    this.queue.length = 0;

    if (this.platform === 'darwin' && typeof Notification.removeAll === 'function') {
      Notification.removeAll();
    }
  }

  markRendererReady(): void {
    this.rendererReady = true;
    this.flushQueue();
  }

  /**
   * Release the service's references without dismissing anything, so delivered
   * notifications stay in Notification Center / Action Center across a quit or
   * an update restart.
   */
  destroy(): void {
    this.live.clear();
    this.queue.length = 0;
    this.history.length = 0;
  }

  private closeOne(id: string): void {
    const entry = this.live.get(id);

    if (entry) {
      entry.notification.close();
      this.live.delete(id);
    }

    if (this.platform === 'darwin' && typeof Notification.remove === 'function') {
      Notification.remove(id);
    }
  }

  private closeGroup(groupId: string): void {
    for (const [id, entry] of this.live.entries()) {
      if (entry.groupId === groupId) {
        entry.notification.close();
        this.live.delete(id);
      }
    }

    if (this.platform === 'darwin' && typeof Notification.removeGroup === 'function') {
      Notification.removeGroup(groupId);
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
    if (event === 'action') {
      sendRendererEvent(
        this.mb,
        EVENTS.NATIVE_NOTIFICATION_ACTION,
        payload as INativeNotificationActionEvent,
      );
    } else {
      sendRendererEvent(
        this.mb,
        EVENTS.NATIVE_NOTIFICATION_CLICK,
        payload as INativeNotificationClickEvent,
      );
    }
  }

  /**
   * A reloading renderer drops its listeners, so queue interactions again until
   * it reports ready.
   */
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

  private restoreDeliveredHistory(): void {
    if (this.platform !== 'darwin' || typeof Notification.getHistory !== 'function') {
      return;
    }

    void Notification.getHistory()
      .then((history) => {
        // Keep the references alive so interactions on restored notifications
        // continue to fire.
        this.history = history;

        for (const notification of history) {
          notification.on('click', () => {
            this.deliver('click', { id: notification.id });
          });

          // A delivered notification's actions are not restored, so an action
          // cannot be mapped back to its ID; open the notification instead.
          notification.on('action', () => {
            this.deliver('click', { id: notification.id });
          });
        }
      })
      .catch((error) => {
        logError(
          'native-notifications',
          'Failed to restore delivered notifications',
          toError(error),
        );
      });
  }

  private registerWindowsActivation(): void {
    if (this.platform !== 'win32' || typeof Notification.handleActivation !== 'function') {
      return;
    }

    Notification.handleActivation((details) => {
      const id = parseActivationId(details.arguments);
      const entry = id ? this.live.get(id) : undefined;

      if (details.type === 'action' && entry && typeof details.actionIndex === 'number') {
        const action = entry.actions[details.actionIndex];

        if (action) {
          this.deliver('action', { id, action });
          return;
        }
      }

      // A cold start has no live entry. Treat the activation as a click so the
      // renderer can resolve the identity after its first fetch, or fall back
      // to a generic app activation.
      this.deliver('click', { id });
    });
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

  if (payload.groupId !== undefined && !isValidIdentifier(payload.groupId)) {
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

  if (payload.groupTitle !== undefined && typeof payload.groupTitle !== 'string') {
    return false;
  }

  if (!Array.isArray(payload.actions)) {
    return false;
  }

  return payload.actions.every(isValidAction);
}

function isValidAction(action: INativeNotificationAction): boolean {
  return (
    !!action &&
    typeof action === 'object' &&
    ALLOWED_ACTIONS.has(action.id) &&
    typeof action.label === 'string' &&
    action.label.trim().length > 0 &&
    action.label.length <= MAX_ACTION_LABEL_LENGTH
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

function parseActivationId(argumentsValue: string): string {
  const value = argumentsValue?.trim();

  if (!value) {
    return '';
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed === 'string') {
      return parsed;
    }

    if (parsed && typeof parsed === 'object' && 'id' in parsed) {
      const id = (parsed as { id?: unknown }).id;
      return typeof id === 'string' ? id : '';
    }
  } catch {
    // Windows may pass the identity as a raw string rather than JSON.
  }

  return isValidIdentifier(value) ? value : '';
}
