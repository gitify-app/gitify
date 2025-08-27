import { ipcMain } from 'electron';
import type { Menubar } from 'menubar';

import type { EventData, EventType } from '../shared/events';

/**
 * Handle main event without expecting a response
 * @param event
 * @param listener
 */
export function onMainEvent(
  event: EventType,
  listener: (event: Electron.IpcMainEvent, args: EventData) => void,
) {
  ipcMain.on(event, listener);
}

/**
 * Handle main event and return a response
 * @param event
 * @param listener
 */
export function handleMainEvent(
  event: EventType,
  listener: (event: Electron.IpcMainInvokeEvent, data: EventData) => void,
) {
  ipcMain.handle(event, listener);
}

/**
 * Send main event to renderer
 * @param mb the menubar instance
 * @param event the type of event to send
 * @param data the data to send with the event
 */
export function sendRendererEvent(
  mb: Menubar,
  event: EventType,
  data?: string,
) {
  mb.window.webContents.send(event, data);
}
