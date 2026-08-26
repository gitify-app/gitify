import fs from 'node:fs';
import path from 'node:path';

import { applyOzonePlatform, isX11BackendEnabled, setX11Backend } from './ozone';

const USER_DATA = '/tmp/gitify-test-userdata';
const MARKER = path.join(USER_DATA, 'UseX11Backend');

const appendSwitchMock = vi.fn();

vi.mock('electron', () => ({
  app: {
    getPath: (name: string) => (name === 'userData' ? '/tmp/gitify-test-userdata' : ''),
    commandLine: {
      appendSwitch: (...a: unknown[]) => appendSwitchMock(...a),
    },
  },
}));

const logErrorMock = vi.fn();
vi.mock('../shared/logger', () => ({
  logError: (...a: unknown[]) => logErrorMock(...a),
  logInfo: vi.fn(),
  toError: (e: unknown) => e,
}));

/** Swap `process.platform`, which is read-only on the real process object. */
function setPlatform(platform: NodeJS.Platform): void {
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
}

describe('main/ozone.ts', () => {
  const realPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    // Electron creates userData for a real app; the stubbed path needs it too.
    fs.mkdirSync(USER_DATA, { recursive: true });
    fs.rmSync(MARKER, { force: true });
  });

  afterEach(() => {
    setPlatform(realPlatform);
    fs.rmSync(MARKER, { force: true });
  });

  describe('setX11Backend / isX11BackendEnabled', () => {
    it('reports disabled when no marker exists', () => {
      expect(isX11BackendEnabled()).toBe(false);
    });

    it('round-trips the preference through the marker file', () => {
      setX11Backend(true);
      expect(fs.existsSync(MARKER)).toBe(true);
      expect(isX11BackendEnabled()).toBe(true);

      setX11Backend(false);
      expect(fs.existsSync(MARKER)).toBe(false);
      expect(isX11BackendEnabled()).toBe(false);
    });

    it('is idempotent when disabling with no marker present', () => {
      expect(() => setX11Backend(false)).not.toThrow();
      expect(logErrorMock).not.toHaveBeenCalled();
    });

    it('logs and swallows a failure to write the marker', () => {
      const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw new Error('EACCES');
      });

      expect(() => setX11Backend(true)).not.toThrow();
      expect(logErrorMock).toHaveBeenCalledWith(
        'setX11Backend',
        expect.stringContaining('Unable to persist'),
        expect.anything(),
      );

      writeSpy.mockRestore();
    });

    it('reports disabled when the marker cannot be read', () => {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => {
        throw new Error('EIO');
      });

      // Defaulting to "off" keeps a broken read from silently forcing X11.
      expect(isX11BackendEnabled()).toBe(false);
      expect(logErrorMock).toHaveBeenCalledWith(
        'isX11BackendEnabled',
        expect.stringContaining('Unable to read'),
        expect.anything(),
      );

      existsSpy.mockRestore();
    });
  });

  describe('applyOzonePlatform', () => {
    it('forces x11 on Linux when enabled', () => {
      setPlatform('linux');
      setX11Backend(true);

      applyOzonePlatform();

      expect(appendSwitchMock).toHaveBeenCalledWith('ozone-platform', 'x11');
    });

    it('disables Vulkan alongside x11', () => {
      setPlatform('linux');
      setX11Backend(true);

      applyOzonePlatform();

      // Vulkan on X11 segfaults the GPU process on the NVIDIA proprietary
      // driver, so the popup never paints. Both switches have to travel
      // together or the setting trades a misplaced window for no window.
      expect(appendSwitchMock).toHaveBeenCalledWith('disable-features', 'Vulkan');
    });

    it('leaves the platform alone on Linux when disabled', () => {
      setPlatform('linux');

      applyOzonePlatform();

      // Wayland users keep Vulkan; the switch is only a companion to X11.
      expect(appendSwitchMock).not.toHaveBeenCalled();
    });

    it('never forces x11 off Linux, even with a stale marker', () => {
      // A marker copied between machines, or left by a previous Linux install
      // sharing a synced profile, must not affect macOS or Windows.
      setPlatform('darwin');
      setX11Backend(true);

      applyOzonePlatform();

      expect(appendSwitchMock).not.toHaveBeenCalled();
    });
  });
});
