import type { Menubar } from 'electron-menubar';

import type MenuBuilder from '../menu';
import {
  __resetWindowLifecycleForTests,
  configureWindowEvents,
  applyKeepWindowOnBlur,
} from './window';

const appOnMock = vi.fn();
const appQuitMock = vi.fn();

vi.mock('electron', () => ({
  app: {
    on: (...args: unknown[]) => appOnMock(...args),
    quit: (...args: unknown[]) => appQuitMock(...args),
  },
}));

vi.mock('../config', () => ({
  WindowConfig: {
    width: 500,
    height: 400,
  },
}));

const ORIGINAL_PLATFORM = process.platform;

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, 'platform', {
    value: platform,
    configurable: true,
  });
};

const findAppHandler = (eventName: string): (() => void) | undefined => {
  const call = appOnMock.mock.calls.find(([name]) => name === eventName);
  return call?.[1] as (() => void) | undefined;
};

const findWindowHandler = (
  menubar: Menubar,
  eventName: string,
): ((event: { preventDefault: () => void }) => void) | undefined => {
  const onMock = menubar.window?.on as ReturnType<typeof vi.fn>;
  const call = onMock.mock.calls.find(([name]) => name === eventName);
  return call?.[1] as ((event: { preventDefault: () => void }) => void) | undefined;
};

const findWebContentsHandler = (menubar: Menubar, eventName: string): (() => void) | undefined => {
  const onMock = menubar.window?.webContents.on as ReturnType<typeof vi.fn>;
  const call = onMock.mock.calls.find(([name]) => name === eventName);
  return call?.[1] as (() => void) | undefined;
};

describe('main/lifecycle/window.ts', () => {
  let menubar: Menubar;
  let menuBuilder: MenuBuilder;

  beforeEach(() => {
    appOnMock.mockClear();
    appQuitMock.mockClear();
    __resetWindowLifecycleForTests();
    setPlatform('linux');

    menubar = {
      hideWindow: vi.fn(),
      recenterOnTray: vi.fn(),
      tray: {
        getBounds: vi.fn().mockReturnValue({ x: 100, y: 100, width: 22, height: 22 }),
      },
      window: {
        setSize: vi.fn(),
        center: vi.fn(),
        setAlwaysOnTop: vi.fn(),
        hide: vi.fn(),
        isDestroyed: vi.fn().mockReturnValue(false),
        on: vi.fn(),
        webContents: {
          on: vi.fn(),
        },
      },
    } as unknown as Menubar;
    menuBuilder = {
      setWindowVisibility: vi.fn(),
    } as unknown as MenuBuilder;
  });

  afterEach(() => {
    setPlatform(ORIGINAL_PLATFORM);
  });

  it('configureWindowEvents returns early if no window', () => {
    const mbNoWindow = { ...menubar, window: null };

    expect(() =>
      configureWindowEvents(mbNoWindow as unknown as Menubar, menuBuilder),
    ).not.toThrow();
  });

  it('configureWindowEvents registers webContents devtools listeners', () => {
    configureWindowEvents(menubar, menuBuilder);

    expect(menubar.window?.webContents.on).toHaveBeenCalledWith(
      'devtools-opened',
      expect.any(Function),
    );
    expect(menubar.window?.webContents.on).toHaveBeenCalledWith(
      'devtools-closed',
      expect.any(Function),
    );
  });

  it('does not register a close, before-input-event, or its own escape handler (library owns those)', () => {
    configureWindowEvents(menubar, menuBuilder);

    expect(menubar.window?.on).not.toHaveBeenCalledWith('close', expect.any(Function));
    expect(menubar.window?.webContents.on).not.toHaveBeenCalledWith(
      'before-input-event',
      expect.any(Function),
    );
  });

  it('configureWindowEvents registers before-quit and window-all-closed app listeners', () => {
    configureWindowEvents(menubar, menuBuilder);

    expect(appOnMock).toHaveBeenCalledWith('before-quit', expect.any(Function));
    expect(appOnMock).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
  });

  describe('window visibility forwarding', () => {
    it('forwards window show events to menu builder', () => {
      configureWindowEvents(menubar, menuBuilder);

      const showHandler = findWindowHandler(menubar, 'show');
      showHandler?.({ preventDefault: vi.fn() });

      expect(menuBuilder.setWindowVisibility).toHaveBeenCalledWith(true);
    });

    it('forwards window hide events to menu builder', () => {
      configureWindowEvents(menubar, menuBuilder);

      const hideHandler = findWindowHandler(menubar, 'hide');
      hideHandler?.({ preventDefault: vi.fn() });

      expect(menuBuilder.setWindowVisibility).toHaveBeenCalledWith(false);
    });
  });

  describe('applyKeepWindowOnBlur', () => {
    it('forwards the value to the underlying window', () => {
      applyKeepWindowOnBlur(menubar, true);

      expect(menubar.window?.setAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('skips the call when the window is destroyed', () => {
      // oxlint-disable-next-line no-unsafe-optional-chaining -- window is guaranteed defined in this test
      (menubar.window?.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(true);

      applyKeepWindowOnBlur(menubar, true);

      expect(menubar.window?.setAlwaysOnTop).not.toHaveBeenCalled();
    });

    it('is restored after DevTools closes', () => {
      configureWindowEvents(menubar, menuBuilder);
      applyKeepWindowOnBlur(menubar, true);
      // oxlint-disable-next-line no-unsafe-optional-chaining -- window is guaranteed defined in this test
      (menubar.window?.setAlwaysOnTop as ReturnType<typeof vi.fn>).mockClear();

      findWebContentsHandler(menubar, 'devtools-closed')?.();

      expect(menubar.window?.setAlwaysOnTop).toHaveBeenCalledWith(true);
    });

    it('is cleared after DevTools closes when the user did not opt in', () => {
      configureWindowEvents(menubar, menuBuilder);

      findWebContentsHandler(menubar, 'devtools-closed')?.();

      expect(menubar.window?.setAlwaysOnTop).toHaveBeenCalledWith(false);
    });
  });

  describe('devtools-closed handler', () => {
    it('delegates re-centering to mb.recenterOnTray()', () => {
      configureWindowEvents(menubar, menuBuilder);

      findWebContentsHandler(menubar, 'devtools-closed')?.();

      expect(menubar.recenterOnTray).toHaveBeenCalled();
    });
  });

  describe('window-all-closed handler', () => {
    it('keeps the app alive when not quitting', () => {
      configureWindowEvents(menubar, menuBuilder);

      findAppHandler('window-all-closed')?.();

      expect(appQuitMock).not.toHaveBeenCalled();
    });

    it('quits on linux when the user is quitting', () => {
      configureWindowEvents(menubar, menuBuilder);

      findAppHandler('before-quit')?.();
      findAppHandler('window-all-closed')?.();

      expect(appQuitMock).toHaveBeenCalled();
    });

    it('does not quit on macOS', () => {
      setPlatform('darwin');
      configureWindowEvents(menubar, menuBuilder);

      findAppHandler('before-quit')?.();
      findAppHandler('window-all-closed')?.();

      expect(appQuitMock).not.toHaveBeenCalled();
    });
  });
});
