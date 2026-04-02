import { ipcMain } from 'electron';
import type { Menubar } from 'menubar';

import type { EventData, EventType } from '../shared/events';

/**
 * Register a fire-and-forget IPC listener on the main process (ipcMain.on).
 * Use this when the renderer sends a one-way message and no return value is needed.
 *
 * @param event - The IPC channel/event name to listen on.
 * @param listener - Callback invoked when the event is received.
 */
export function onMainEvent<T = EventData>(
  event: EventType,
  listener: (event: Electron.IpcMainEvent, args: T) => void,
) {
  ipcMain.on(event, listener as Parameters<typeof ipcMain.on>[1]);
}

/**
 * Register a request/response IPC handler on the main process (ipcMain.handle).
 * Use this when the renderer invokes a channel and expects a value back.
 *
 * @param event - The IPC channel/event name to handle.
 * @param listener - Callback whose return value is sent back to the renderer.
 */
export function handleMainEvent<T = EventData>(
  event: EventType,
  listener: (
    event: Electron.IpcMainInvokeEvent,
    data: T,
  ) => unknown | Promise<unknown>,
) {
  ipcMain.handle(event, listener as Parameters<typeof ipcMain.handle>[1]);
}

/**
 * Push an event from the main process to the renderer via webContents.
 *
 * @param mb - The menubar instance whose window receives the event.
 * @param event - The IPC channel/event name to emit.
 * @param data - Optional payload sent with the event.
 */
export function sendRendererEvent(
  mb: Menubar,
  event: EventType,
  data?: string,
) {
  mb.window?.webContents.send(event, data);
}
