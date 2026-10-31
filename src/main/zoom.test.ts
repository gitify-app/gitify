import type { Menubar } from 'electron-menubar';

import { EVENTS } from '../shared/events';

import { configureZoomShortcuts, getZoomAction } from './zoom';

const { sendRendererEventMock } = vi.hoisted(() => ({
  sendRendererEventMock: vi.fn(),
}));

vi.mock('./events', () => ({
  sendRendererEvent: (...args: unknown[]) => sendRendererEventMock(...args),
}));

const ORIGINAL_PLATFORM = process.platform;

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, 'platform', {
    value: platform,
    configurable: true,
  });
};

const createInput = (overrides: Partial<Electron.Input> = {}): Electron.Input =>
  ({
    type: 'keyDown',
    key: '',
    code: '',
    isAutoRepeat: false,
    isComposing: false,
    shift: false,
    control: false,
    alt: false,
    meta: false,
    location: 0,
    modifiers: [],
    ...overrides,
  }) as Electron.Input;

describe('main/zoom.ts', () => {
  beforeEach(() => {
    sendRendererEventMock.mockClear();
    setPlatform('darwin');
  });

  afterEach(() => {
    setPlatform(ORIGINAL_PLATFORM);
  });

  describe('getZoomAction', () => {
    it('maps macOS command shortcuts', () => {
      expect(getZoomAction(createInput({ key: '+', meta: true }))).toBe('in');
      expect(getZoomAction(createInput({ key: '=', meta: true }))).toBe('in');
      expect(getZoomAction(createInput({ key: '-', meta: true }))).toBe('out');
      expect(getZoomAction(createInput({ key: '0', meta: true }))).toBe('reset');
    });

    it('maps Ctrl shortcuts on Windows and Linux', () => {
      setPlatform('linux');

      expect(getZoomAction(createInput({ key: '=', control: true }))).toBe('in');
      expect(getZoomAction(createInput({ key: '-', control: true }))).toBe('out');
      expect(getZoomAction(createInput({ key: '0', control: true }))).toBe('reset');
    });

    it('maps numpad and code-based keys', () => {
      expect(getZoomAction(createInput({ code: 'Equal', meta: true }))).toBe('in');
      expect(getZoomAction(createInput({ code: 'NumpadAdd', meta: true }))).toBe('in');
      expect(getZoomAction(createInput({ code: 'Minus', meta: true }))).toBe('out');
      expect(getZoomAction(createInput({ code: 'NumpadSubtract', meta: true }))).toBe('out');
      expect(getZoomAction(createInput({ code: 'Digit0', meta: true }))).toBe('reset');
      expect(getZoomAction(createInput({ code: 'Numpad0', meta: true }))).toBe('reset');
    });

    it('ignores inputs without the platform primary modifier', () => {
      expect(getZoomAction(createInput({ key: '+', control: true }))).toBeUndefined();
      expect(getZoomAction(createInput({ key: '+', meta: false }))).toBeUndefined();

      setPlatform('linux');
      expect(getZoomAction(createInput({ key: '+', meta: true }))).toBeUndefined();
    });

    it('ignores key up, alt-modified, and shifted out/reset inputs', () => {
      expect(getZoomAction(createInput({ key: '+', meta: true, type: 'keyUp' }))).toBeUndefined();
      expect(getZoomAction(createInput({ key: '+', meta: true, alt: true }))).toBeUndefined();
      expect(getZoomAction(createInput({ key: '-', meta: true, shift: true }))).toBeUndefined();
      expect(getZoomAction(createInput({ key: '0', meta: true, shift: true }))).toBeUndefined();
    });
  });

  it('intercepts zoom shortcuts and forwards them to the renderer', () => {
    const webContentsOnMock = vi.fn();
    const mb = {
      window: {
        webContents: { on: webContentsOnMock },
      },
    } as unknown as Menubar;

    configureZoomShortcuts(mb);

    expect(webContentsOnMock).toHaveBeenCalledWith('before-input-event', expect.any(Function));

    const handler = webContentsOnMock.mock.calls[0][1] as (
      event: { preventDefault: () => void },
      input: Electron.Input,
    ) => void;
    const event = { preventDefault: vi.fn() };

    handler(event, createInput({ key: '+', meta: true }));

    expect(event.preventDefault).toHaveBeenCalled();
    expect(sendRendererEventMock).toHaveBeenCalledWith(mb, EVENTS.ZOOM, 'in');
  });

  it('leaves non-zoom shortcuts untouched', () => {
    const webContentsOnMock = vi.fn();
    const mb = {
      window: {
        webContents: { on: webContentsOnMock },
      },
    } as unknown as Menubar;

    configureZoomShortcuts(mb);

    const handler = webContentsOnMock.mock.calls[0][1] as (
      event: { preventDefault: () => void },
      input: Electron.Input,
    ) => void;
    const event = { preventDefault: vi.fn() };

    handler(event, createInput({ key: 'r', meta: true }));

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(sendRendererEventMock).not.toHaveBeenCalled();
  });
});
