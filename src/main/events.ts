import { ipcMain } from 'electron';

import type { Menubar } from '@gitify/menubar';

import type { EventArgs, EventRequest, EventResponse, EventType } from '../shared/events';

/**
 * Register a fire-and-forget IPC listener on the main process (ipcMain.on).
 * Use this when the renderer sends a one-way message and no return value is needed.
 */
export function onMainEvent<E extends EventType>(
  event: E,
  listener: (event: Electron.IpcMainEvent, data: EventRequest<E>) => void,
): void {
  ipcMain.on(event, listener as Parameters<typeof ipcMain.on>[1]);
}

/**
 * Register a request/response IPC handler on the main process (ipcMain.handle).
 * The listener's return type is enforced by the event's contract.
 */
export function handleMainEvent<E extends EventType>(
  event: E,
  listener: (
    event: Electron.IpcMainInvokeEvent,
    data: EventRequest<E>,
  ) => EventResponse<E> | Promise<EventResponse<E>>,
): void {
  ipcMain.handle(event, listener as Parameters<typeof ipcMain.handle>[1]);
}

/**
 * Push an event from the main process to the renderer via webContents.
 * Variadic so events without a payload can be called as `sendRendererEvent(mb, event)`.
 */
export function sendRendererEvent<E extends EventType>(
  mb: Menubar,
  event: E,
  ...args: EventArgs<E>
): void {
  if (!mb.window) {
    return;
  }

  mb.window.webContents.send(event, ...args);
}
