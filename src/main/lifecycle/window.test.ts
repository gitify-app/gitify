import type { Menubar } from 'menubar';

import type MenuBuilder from '../menu';
import { __resetWindowLifecycleForTests, configureWindowEvents } from './window';

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

const flushDeferred = () => new Promise((resolve) => setImmediate(resolve));

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
      positioner: {
        move: vi.fn(),
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

  it('configureWindowEvents registers webContents event listeners', () => {
    configureWindowEvents(menubar, menuBuilder);

    expect(menubar.window?.webContents.on).toHaveBeenCalledWith(
      'before-input-event',
      expect.any(Function),
    );
    expect(menubar.window?.webContents.on).toHaveBeenCalledWith(
      'devtools-opened',
      expect.any(Function),
    );
    expect(menubar.window?.webContents.on).toHaveBeenCalledWith(
      'devtools-closed',
      expect.any(Function),
    );
  });

  it('configureWindowEvents registers window close, before-quit and window-all-closed listeners', () => {
    configureWindowEvents(menubar, menuBuilder);

    expect(menubar.window?.on).toHaveBeenCalledWith('close', expect.any(Function));
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

  describe('window close handler', () => {
    it('hides the window and restores menubar reference on a WM close', async () => {
      configureWindowEvents(menubar, menuBuilder);

      const closeHandler = findWindowHandler(menubar, 'close');
      const event = { preventDefault: vi.fn() };
      closeHandler?.(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(menubar.window?.hide).not.toHaveBeenCalled();

      // Simulate menubar's windowClear nulling its reference.
      const captured = menubar.window;
      (menubar as unknown as { window: undefined }).window = undefined;

      await flushDeferred();

      expect(captured?.hide).toHaveBeenCalled();
      expect((menubar as unknown as { _browserWindow: unknown })._browserWindow).toBe(captured);
    });

    it('skips the deferred hide when the captured window is destroyed', async () => {
      configureWindowEvents(menubar, menuBuilder);

      const captured = menubar.window;
      const closeHandler = findWindowHandler(menubar, 'close');
      closeHandler?.({ preventDefault: vi.fn() });

      // oxlint-disable-next-line no-unsafe-optional-chaining -- captured is guaranteed defined in this test
      (captured?.isDestroyed as ReturnType<typeof vi.fn>).mockReturnValue(true);

      await flushDeferred();

      expect(captured?.hide).not.toHaveBeenCalled();
    });

    it('lets the window close during quit', async () => {
      configureWindowEvents(menubar, menuBuilder);

      findAppHandler('before-quit')?.();

      const closeHandler = findWindowHandler(menubar, 'close');
      const event = { preventDefault: vi.fn() };
      closeHandler?.(event);

      await flushDeferred();

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(menubar.window?.hide).not.toHaveBeenCalled();
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
