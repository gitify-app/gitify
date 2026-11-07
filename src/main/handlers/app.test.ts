import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../../shared/events';

import { getLanguageState, setNativeLanguage } from '../language';
import { registerAppHandlers, registerLanguageHandlers } from './app';

const handleMock = vi.fn();
const onMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    handle: (...args: unknown[]) => handleMock(...args),
    on: (...args: unknown[]) => onMock(...args),
  } satisfies Pick<Electron.IpcMain, 'handle' | 'on'>,
  app: {
    getVersion: vi.fn(() => '1.0.0'),
  } satisfies Pick<Electron.App, 'getVersion'>,
}));

vi.mock('../config', () => ({
  Paths: {
    notificationSound: 'file:///path/to/notification.mp3',
    twemojiFolder: 'file:///path/to/twemoji',
  },
}));

vi.mock('../language', () => ({
  getLanguageState: vi.fn(),
  setNativeLanguage: vi.fn(),
}));

describe('main/handlers/app.ts', () => {
  let menubar: Menubar;

  beforeEach(() => {
    menubar = {
      showWindow: vi.fn(),
      hideWindow: vi.fn(),
      app: { quit: vi.fn() },
    } as unknown as Menubar;
  });

  describe('registerAppHandlers', () => {
    it('registers handlers without throwing', () => {
      expect(() => registerAppHandlers(menubar)).not.toThrow();
    });

    it('registers expected app IPC event handlers', () => {
      registerAppHandlers(menubar);

      const registeredHandlers = handleMock.mock.calls.map((call: unknown[]) => call[0]);
      const registeredEvents = onMock.mock.calls.map((call: unknown[]) => call[0]);

      expect(registeredHandlers).toContain(EVENTS.VERSION);
      expect(registeredHandlers).toContain(EVENTS.NOTIFICATION_SOUND_PATH);
      expect(registeredHandlers).toContain(EVENTS.TWEMOJI_DIRECTORY);
      expect(registeredEvents).toContain(EVENTS.WINDOW_SHOW);
      expect(registeredEvents).toContain(EVENTS.WINDOW_HIDE);
      expect(registeredEvents).toContain(EVENTS.QUIT);
    });
  });

  it.each(['en'] as const)(
    'registers get/set immediately but waits for initialization before returning %s',
    async (language) => {
      const state = { language, preference: language };
      vi.mocked(getLanguageState).mockReturnValue(state);
      vi.mocked(setNativeLanguage).mockReturnValue(state);
      let ready!: () => void;
      registerLanguageHandlers(
        new Promise<void>((resolve) => {
          ready = resolve;
        }),
      );
      const handlers = new Map(handleMock.mock.calls.map(([event, handler]) => [event, handler]));
      const get = handlers.get(EVENTS.LANGUAGE_GET)!;
      const set = handlers.get(EVENTS.LANGUAGE_SET)!;
      const pendingGet = get({} as Electron.IpcMainInvokeEvent);
      const pendingSet = set({} as Electron.IpcMainInvokeEvent, language);
      expect(getLanguageState).not.toHaveBeenCalled();
      expect(setNativeLanguage).not.toHaveBeenCalled();
      ready();
      await expect(pendingGet).resolves.toEqual(state);
      await expect(pendingSet).resolves.toEqual(state);
      expect(setNativeLanguage).toHaveBeenCalledWith(language);
    },
  );
});
