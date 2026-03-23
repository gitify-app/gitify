import type { Menubar } from 'menubar';

import { configureWindowEvents } from './window';

vi.mock('../config', () => ({
  WindowConfig: {
    width: 500,
    height: 400,
  },
}));

describe('main/lifecycle/window.ts', () => {
  let menubar: Menubar;

  beforeEach(() => {
    menubar = {
      hideWindow: vi.fn(),
      tray: {
        getBounds: vi
          .fn()
          .mockReturnValue({ x: 100, y: 100, width: 22, height: 22 }),
      },
      window: {
        setSize: vi.fn(),
        center: vi.fn(),
        setAlwaysOnTop: vi.fn(),
        webContents: {
          on: vi.fn(),
        },
      },
      positioner: {
        move: vi.fn(),
      },
    } as unknown as Menubar;
  });

  it('configureWindowEvents returns early if no window', () => {
    const mbNoWindow = { ...menubar, window: null };

    expect(() => configureWindowEvents(mbNoWindow as Menubar)).not.toThrow();
  });

  it('configureWindowEvents registers webContents event listeners', () => {
    configureWindowEvents(menubar);

    expect(menubar.window.webContents.on).toHaveBeenCalledWith(
      'before-input-event',
      expect.any(Function),
    );
    expect(menubar.window.webContents.on).toHaveBeenCalledWith(
      'devtools-opened',
      expect.any(Function),
    );
    expect(menubar.window.webContents.on).toHaveBeenCalledWith(
      'devtools-closed',
      expect.any(Function),
    );
  });
});
