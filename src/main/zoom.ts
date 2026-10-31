import type { Menubar } from 'electron-menubar';

import { type ZoomAction, EVENTS } from '../shared/events';
import { isMacOS } from '../shared/platform';

import { sendRendererEvent } from './events';

const ZOOM_IN_KEYS = new Set(['+', '=']);
const ZOOM_OUT_KEYS = new Set(['-']);
const ZOOM_RESET_KEYS = new Set(['0']);

/**
 * Resolve an Electron keyboard input to a zoom action.
 *
 * Electron's default application menu handles these accelerators itself,
 * stepping by 0.5 zoom levels and ignoring Gitify's percentage bounds. We
 * intercept the same shortcuts so the renderer can apply the configured step
 * and clamp to its minimum / maximum.
 *
 * @param input - Keyboard input from `webContents`'s `before-input-event`.
 * @returns The zoom action, or `undefined` when the input is not a zoom shortcut.
 */
export function getZoomAction(input: Electron.Input): ZoomAction | undefined {
  if (input.type !== 'keyDown') {
    return undefined;
  }

  const primaryModifier = isMacOS() ? input.meta : input.control;
  if (!primaryModifier || input.alt) {
    return undefined;
  }

  const key = input.key;
  const code = input.code;

  if (ZOOM_IN_KEYS.has(key) || code === 'Equal' || code === 'NumpadAdd') {
    return 'in';
  }

  if (!input.shift && (ZOOM_OUT_KEYS.has(key) || code === 'Minus' || code === 'NumpadSubtract')) {
    return 'out';
  }

  if (!input.shift && (ZOOM_RESET_KEYS.has(key) || code === 'Digit0' || code === 'Numpad0')) {
    return 'reset';
  }

  return undefined;
}

/**
 * Intercept the native zoom shortcuts and forward them to the renderer, which
 * owns the zoom step and bounds.
 *
 * @param mb - The menubar instance whose window should be observed.
 */
export function configureZoomShortcuts(mb: Menubar): void {
  mb.window?.webContents.on('before-input-event', (event, input) => {
    const action = getZoomAction(input);

    if (!action) {
      return;
    }

    event.preventDefault();
    sendRendererEvent(mb, EVENTS.ZOOM, action);
  });
}
