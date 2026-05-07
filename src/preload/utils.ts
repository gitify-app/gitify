import { ipcRenderer } from 'electron';

import type {
  EventArgs,
  EventRequest,
  EventResponse,
  EventType,
} from '../shared/events';

/**
 * Send a fire-and-forget IPC message from the renderer to the main process.
 * Variadic so events without a payload can be called as `sendMainEvent(event)`.
 */
export function sendMainEvent<E extends EventType>(
  event: E,
  ...args: EventArgs<E>
): void {
  ipcRenderer.send(event, ...args);
}

/**
 * Send an IPC message from the renderer to the main process and await a response.
 * The resolved value type is enforced by the event's contract.
 */
export async function invokeMainEvent<E extends EventType>(
  event: E,
  ...args: EventArgs<E>
): Promise<EventResponse<E>> {
  try {
    return await ipcRenderer.invoke(event, ...args);
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: preload environment is strictly sandboxed
    console.error(`[IPC] invoke failed: ${event}`, err);
    throw err;
  }
}

/**
 * Register a listener for an IPC event sent from the main process to the renderer.
 */
export function onRendererEvent<E extends EventType>(
  event: E,
  listener: (event: Electron.IpcRendererEvent, data: EventRequest<E>) => void,
): void {
  ipcRenderer.on(event, listener as Parameters<typeof ipcRenderer.on>[1]);
}
