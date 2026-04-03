import type { Menubar } from 'menubar';

import { EVENTS } from '../../shared/events';

import { registerAppHandlers } from './app';

const handleMock = vi.fn();
const onMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    handle: (...args: unknown[]) => handleMock(...args),
    on: (...args: unknown[]) => onMock(...args),
  },
  app: {
    getVersion: vi.fn(() => '1.0.0'),
  },
}));

vi.mock('../config', () => ({
  Paths: {
    notificationSound: 'file:///path/to/notification.mp3',
    twemojiFolder: 'file:///path/to/twemoji',
  },
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

      const registeredHandlers = handleMock.mock.calls.map(
        (call: unknown[]) => call[0],
      );
      const registeredEvents = onMock.mock.calls.map(
        (call: unknown[]) => call[0],
      );

      expect(registeredHandlers).toContain(EVENTS.VERSION);
      expect(registeredHandlers).toContain(EVENTS.NOTIFICATION_SOUND_PATH);
      expect(registeredHandlers).toContain(EVENTS.TWEMOJI_DIRECTORY);
      expect(registeredEvents).toContain(EVENTS.WINDOW_SHOW);
      expect(registeredEvents).toContain(EVENTS.WINDOW_HIDE);
      expect(registeredEvents).toContain(EVENTS.QUIT);
    });
  });
});
