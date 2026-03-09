import { ipcRenderer } from 'electron';

import type { EventData, EventType } from '../shared/events';

/**
 * Send a fire-and-forget IPC message from the renderer to the main process.
 *
 * @param event - The IPC event type to send.
 * @param data - Optional payload to include with the event.
 */
export function sendMainEvent(event: EventType, data?: EventData): void {
  ipcRenderer.send(event, data);
}

/**
 * Send an IPC message from the renderer to the main process and await a response.
 *
 * @param event - The IPC event type to invoke.
 * @param data - Optional string payload to include with the event.
 * @returns A promise that resolves to the string response from the main process.
 */
export function invokeMainEvent(
  event: EventType,
  data?: string,
): Promise<string> {
  return ipcRenderer.invoke(event, data);
}

/**
 * Register a listener for an IPC event sent from the main process to the renderer.
 *
 * @param event - The IPC event type to listen for.
 * @param listener - The callback invoked when the event is received.
 */
export function onRendererEvent(
  event: EventType,
  listener: (event: Electron.IpcRendererEvent, args: string) => void,
) {
  ipcRenderer.on(event, listener);
}
