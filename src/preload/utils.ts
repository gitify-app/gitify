import { ipcRenderer } from 'electron';

import type { EventData, EventType } from '../shared/events';

/**
 * Send renderer event without expecting a response
 * @param event the type of event to send
 * @param data the data to send with the event
 */
export function sendMainEvent(event: EventType, data?: EventData): void {
  ipcRenderer.send(event, data);
}

/**
 * Send renderer event and expect a response
 * @param event the type of event to send
 * @param data the data to send with the event
 * @returns
 */
export function invokeMainEvent(
  event: EventType,
  data?: string,
): Promise<string> {
  return ipcRenderer.invoke(event, data);
}

/**
 * Handle renderer event without expecting a response
 */
export function onRendererEvent(
  event: EventType,
  listener: (event: Electron.IpcRendererEvent, args: string) => void,
) {
  ipcRenderer.on(event, listener);
}
