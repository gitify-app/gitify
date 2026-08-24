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
  });

  describe('applyOzonePlatform', () => {
    it('forces x11 on Linux when enabled', () => {
      setPlatform('linux');
      setX11Backend(true);

      applyOzonePlatform();

      expect(appendSwitchMock).toHaveBeenCalledWith('ozone-platform', 'x11');
    });

    it('leaves the platform alone on Linux when disabled', () => {
      setPlatform('linux');

      applyOzonePlatform();

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
