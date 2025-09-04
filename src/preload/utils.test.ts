import { EVENTS } from '../shared/events';

import { invokeMainEvent, onRendererEvent, sendMainEvent } from './utils';

jest.mock('electron', () => {
  type Listener = (event: unknown, ...args: unknown[]) => void;
  const listeners: Record<string, Listener[]> = {};
  return {
    ipcRenderer: {
      send: jest.fn(),
      invoke: jest.fn().mockResolvedValue('response'),
      on: jest.fn((channel: string, listener: Listener) => {
        if (!listeners[channel]) {
          listeners[channel] = [];
        }
        listeners[channel].push(listener);
      }),
      __emit: (channel: string, ...args: unknown[]) => {
        const list = listeners[channel] || [];
        for (const l of list) {
          l({}, ...args);
        }
      },
      __listeners: listeners,
    },
  };
});

import { ipcRenderer } from 'electron';

describe('preload/utils', () => {
  afterEach(() => {
    (ipcRenderer.send as jest.Mock).mockClear();
    (ipcRenderer.invoke as jest.Mock).mockClear();
    (ipcRenderer.on as jest.Mock).mockClear();
  });

  it('sendMainEvent forwards to ipcRenderer.send', () => {
    sendMainEvent(EVENTS.WINDOW_SHOW);
    expect(ipcRenderer.send).toHaveBeenCalledWith(
      EVENTS.WINDOW_SHOW,
      undefined,
    );
  });

  it('invokeMainEvent forwards and resolves', async () => {
    const result = await invokeMainEvent(EVENTS.VERSION, 'data');
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(EVENTS.VERSION, 'data');
    expect(result).toBe('response');
  });

  it('onRendererEvent registers listener and receives emitted data', () => {
    const handler = jest.fn();
    onRendererEvent(
      EVENTS.UPDATE_TITLE,
      handler as unknown as (
        e: Electron.IpcRendererEvent,
        args: string,
      ) => void,
    );
    (
      ipcRenderer as unknown as {
        __emit: (channel: string, ...a: unknown[]) => void;
      }
    ).__emit(EVENTS.UPDATE_TITLE, 'payload');
    expect(ipcRenderer.on).toHaveBeenCalledWith(EVENTS.UPDATE_TITLE, handler);
    expect(handler).toHaveBeenCalledWith({}, 'payload');
  });
});
