import { EVENTS } from '../shared/events';

import { invokeMainEvent, onRendererEvent, sendMainEvent } from './utils';

vi.mock('electron', () => {
  type Listener = Parameters<Electron.IpcRenderer['on']>[1];
  const listeners: Record<string, Listener[]> = {};
  const ipcRendererStub = {
    send: vi.fn(),
    invoke: vi.fn().mockResolvedValue('response'),
    on: vi.fn(function (this: Electron.IpcRenderer, channel: string, listener: Listener) {
      if (!listeners[channel]) {
        listeners[channel] = [];
      }
      listeners[channel].push(listener);
      return this;
    }),
    removeListener: vi.fn(function (
      this: Electron.IpcRenderer,
      channel: string,
      listener: Listener,
    ) {
      listeners[channel] = (listeners[channel] || []).filter((l) => l !== listener);
      return this;
    }),
  } satisfies Pick<Electron.IpcRenderer, 'send' | 'invoke' | 'on' | 'removeListener'>;
  return {
    ipcRenderer: {
      ...ipcRendererStub,
      __emit: (channel: string, ...args: unknown[]) => {
        const list = listeners[channel] || [];
        for (const l of list) {
          l({} as Electron.IpcRendererEvent, ...args);
        }
      },
      __listeners: listeners,
    },
  };
});

import { ipcRenderer } from 'electron';

describe('preload/utils', () => {
  it('sendMainEvent forwards to ipcRenderer.send', () => {
    sendMainEvent(EVENTS.WINDOW_SHOW);

    expect(ipcRenderer.send).toHaveBeenCalledWith(EVENTS.WINDOW_SHOW);
  });

  it('invokeMainEvent forwards a no-payload event and resolves', async () => {
    const result = await invokeMainEvent(EVENTS.VERSION);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(EVENTS.VERSION);
    expect(result).toBe('response');
  });

  it('invokeMainEvent forwards a structured payload and resolves', async () => {
    const payload = { enabled: true, keyboardShortcut: 'CommandOrControl+G' };

    const result = await invokeMainEvent(EVENTS.UPDATE_KEYBOARD_SHORTCUT, payload);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(EVENTS.UPDATE_KEYBOARD_SHORTCUT, payload);
    expect(result).toBe('response');
  });

  it('onRendererEvent registers listener and receives emitted data', () => {
    const handlerMock = vi.fn();
    onRendererEvent(EVENTS.UPDATE_ICON_TITLE, handlerMock);
    (
      ipcRenderer as unknown as {
        __emit: (channel: string, ...a: unknown[]) => void;
      }
    ).__emit(EVENTS.UPDATE_ICON_TITLE, 'payload');

    expect(ipcRenderer.on).toHaveBeenCalledWith(EVENTS.UPDATE_ICON_TITLE, handlerMock);
    expect(handlerMock).toHaveBeenCalledWith({}, 'payload');
  });

  it('onRendererEvent returns an unsubscribe function that removes the listener', () => {
    const handlerMock = vi.fn();
    const unsubscribe = onRendererEvent(EVENTS.UPDATE_ICON_TITLE, handlerMock);

    unsubscribe();
    (
      ipcRenderer as unknown as {
        __emit: (channel: string, ...a: unknown[]) => void;
      }
    ).__emit(EVENTS.UPDATE_ICON_TITLE, 'payload');

    expect(ipcRenderer.removeListener).toHaveBeenCalledWith(EVENTS.UPDATE_ICON_TITLE, handlerMock);
    expect(handlerMock).not.toHaveBeenCalled();
  });
});
