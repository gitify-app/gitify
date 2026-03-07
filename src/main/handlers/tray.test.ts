import type { Menubar } from 'menubar';

import { EVENTS } from '../../shared/events';

import { TrayIcons } from '../icons';
import { registerTrayHandlers } from './tray';

const onMock = vi.fn();

vi.mock('electron', () => ({
  ipcMain: {
    on: (...args: unknown[]) => onMock(...args),
  },
  net: {
    isOnline: vi.fn().mockReturnValue(true),
  },
}));

describe('main/handlers/tray.ts', () => {
  let menubar: Menubar;

  beforeEach(() => {
    vi.clearAllMocks();

    menubar = {
      tray: {
        isDestroyed: vi.fn().mockReturnValue(false),
        setImage: vi.fn(),
        setTitle: vi.fn(),
      },
    } as unknown as Menubar;
  });

  it('registers handlers without throwing', () => {
    expect(() => registerTrayHandlers(menubar)).not.toThrow();
  });

  it('registers expected IPC event handlers', () => {
    registerTrayHandlers(menubar);

    const registeredEvents = onMock.mock.calls.map((call: [string]) => call[0]);

    expect(registeredEvents).toContain(EVENTS.USE_ALTERNATE_IDLE_ICON);
    expect(registeredEvents).toContain(EVENTS.USE_UNREAD_ACTIVE_ICON);
    expect(registeredEvents).toContain(EVENTS.UPDATE_ICON_COLOR);
    expect(registeredEvents).toContain(EVENTS.UPDATE_ICON_TITLE);
  });

  it('skips tray updates when tray is destroyed', () => {
    (menubar.tray.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(
      true,
    );
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: [string]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, 5);

    expect(menubar.tray.setImage).not.toHaveBeenCalled();
  });

  it('sets idle icon when notifications count is 0', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: [string]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, 0);

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.idle);
  });

  it('sets active icon when notifications count is positive', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: [string]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, 3);

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.active);
  });

  it('sets error icon when notifications count is negative', () => {
    registerTrayHandlers(menubar);

    const updateColorHandler = onMock.mock.calls.find(
      (call: [string]) => call[0] === EVENTS.UPDATE_ICON_COLOR,
    )?.[1];
    updateColorHandler?.({}, -1);

    expect(menubar.tray.setImage).toHaveBeenCalledWith(TrayIcons.error);
  });

  it('updates tray title', () => {
    registerTrayHandlers(menubar);

    const updateTitleHandler = onMock.mock.calls.find(
      (call: [string]) => call[0] === EVENTS.UPDATE_ICON_TITLE,
    )?.[1];
    updateTitleHandler?.({}, '5');

    expect(menubar.tray.setTitle).toHaveBeenCalledWith('5');
  });
});
