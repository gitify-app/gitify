import { EVENTS } from '../shared/events';

const onMock = jest.fn();
const handleMock = jest.fn();

jest.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
    handle: (...args: unknown[]) => handleMock(...args),
  },
}));

import type { Menubar } from 'menubar';

import { handleMainEvent, onMainEvent, sendRendererEvent } from './events';

type MockMenubar = { window: { webContents: { send: jest.Mock } } };

describe('main/events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('onMainEvent registers ipcMain.on listener', () => {
    const listenerMock = jest.fn();
    onMainEvent(
      EVENTS.WINDOW_SHOW,
      listenerMock as unknown as (e: Electron.IpcMainEvent, d: unknown) => void,
    );
    expect(onMock).toHaveBeenCalledWith(EVENTS.WINDOW_SHOW, listenerMock);
  });

  it('handleMainEvent registers ipcMain.handle listener', () => {
    const listenerMock = jest.fn();
    handleMainEvent(
      EVENTS.VERSION,
      listenerMock as unknown as (
        e: Electron.IpcMainInvokeEvent,
        d: unknown,
      ) => void,
    );
    expect(handleMock).toHaveBeenCalledWith(EVENTS.VERSION, listenerMock);
  });

  it('sendRendererEvent forwards event to webContents with data', () => {
    const sendMock = jest.fn();
    const mb: MockMenubar = { window: { webContents: { send: sendMock } } };
    sendRendererEvent(
      mb as unknown as Menubar,
      EVENTS.UPDATE_ICON_TITLE,
      'title',
    );
    expect(sendMock).toHaveBeenCalledWith(EVENTS.UPDATE_ICON_TITLE, 'title');
  });

  it('sendRendererEvent forwards event without data', () => {
    const sendMock = jest.fn();
    const mb: MockMenubar = { window: { webContents: { send: sendMock } } };
    sendRendererEvent(mb as unknown as Menubar, EVENTS.RESET_APP);
    expect(sendMock).toHaveBeenCalledWith(EVENTS.RESET_APP, undefined);
  });
});
