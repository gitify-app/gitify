import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EVENTS } from '../shared/events';

const onMock = vi.fn();
const handleMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
    handle: (...args: unknown[]) => handleMock(...args),
  },
}));

import type { Menubar } from 'menubar';

import { handleMainEvent, onMainEvent, sendRendererEvent } from './events';

type MockMenubar = {
  window: { webContents: { send: ReturnType<typeof vi.fn> } };
};

describe('main/events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('onMainEvent registers ipcMain.on listener', () => {
    const listener = vi.fn();
    onMainEvent(
      EVENTS.WINDOW_SHOW,
      listener as unknown as (e: Electron.IpcMainEvent, d: unknown) => void,
    );
    expect(onMock).toHaveBeenCalledWith(EVENTS.WINDOW_SHOW, listener);
  });

  it('handleMainEvent registers ipcMain.handle listener', () => {
    const listener = vi.fn();
    handleMainEvent(
      EVENTS.VERSION,
      listener as unknown as (
        e: Electron.IpcMainInvokeEvent,
        d: unknown,
      ) => void,
    );
    expect(handleMock).toHaveBeenCalledWith(EVENTS.VERSION, listener);
  });

  it('sendRendererEvent forwards event to webContents with data', () => {
    const send = vi.fn();
    const mb: MockMenubar = { window: { webContents: { send } } };
    sendRendererEvent(mb as unknown as Menubar, EVENTS.UPDATE_TITLE, 'title');
    expect(send).toHaveBeenCalledWith(EVENTS.UPDATE_TITLE, 'title');
  });

  it('sendRendererEvent forwards event without data', () => {
    const send = vi.fn();
    const mb: MockMenubar = { window: { webContents: { send } } };
    sendRendererEvent(mb as unknown as Menubar, EVENTS.RESET_APP);
    expect(send).toHaveBeenCalledWith(EVENTS.RESET_APP, undefined);
  });
});
