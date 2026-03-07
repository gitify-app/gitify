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
    notificationSound: 'file:///path/to/notification.wav',
    twemojiFolder: 'file:///path/to/twemoji',
  },
}));

describe('main/handlers/app.ts', () => {
  let menubar: Menubar;

  beforeEach(() => {
    vi.clearAllMocks();

    menubar = {
      showWindow: vi.fn(),
      hideWindow: vi.fn(),
      app: { quit: vi.fn() },
    } as unknown as Menubar;
  });

  it('registers handlers without throwing', () => {
    expect(() => registerAppHandlers(menubar)).not.toThrow();
  });

  it('registers VERSION, NOTIFICATION_SOUND_PATH, TWEMOJI_DIRECTORY, WINDOW_SHOW, WINDOW_HIDE, and QUIT handlers', () => {
    registerAppHandlers(menubar);

    const registeredHandlers = handleMock.mock.calls.map(
      (call: [string]) => call[0],
    );
    const registeredEvents = onMock.mock.calls.map((call: [string]) => call[0]);

    expect(registeredHandlers).toContain(EVENTS.VERSION);
    expect(registeredHandlers).toContain(EVENTS.NOTIFICATION_SOUND_PATH);
    expect(registeredHandlers).toContain(EVENTS.TWEMOJI_DIRECTORY);
    expect(registeredEvents).toContain(EVENTS.WINDOW_SHOW);
    expect(registeredEvents).toContain(EVENTS.WINDOW_HIDE);
    expect(registeredEvents).toContain(EVENTS.QUIT);
  });
});
