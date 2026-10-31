import { app } from 'electron';
import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

import { onMainEvent } from '../events';
import { NativeNotificationService } from '../notifications';

let service: NativeNotificationService | null = null;

/**
 * Register the operating-system notification service and its typed IPC
 * handlers. Idempotent: a second call reuses the existing service rather than
 * registering duplicate handlers.
 */
export function registerNativeNotificationHandlers(mb: Menubar): NativeNotificationService {
  if (service) {
    return service;
  }

  const instance = new NativeNotificationService(mb);
  service = instance;

  onMainEvent(EVENTS.NATIVE_NOTIFICATION_SHOW, (_, payload) => instance.show(payload));
  onMainEvent(EVENTS.NATIVE_NOTIFICATION_REMOVE, (_, payload) => instance.remove(payload));
  onMainEvent(EVENTS.NATIVE_NOTIFICATION_REMOVE_ALL, () => instance.removeAll());
  onMainEvent(EVENTS.NATIVE_NOTIFICATION_READY, () => instance.markRendererReady());

  app.once('will-quit', () => {
    instance.destroy();
    service = null;
  });

  return instance;
}

/** @internal Reset the module-level service between tests. */
export function __resetNativeNotificationServiceForTests(): void {
  service?.destroy();
  service = null;
}
