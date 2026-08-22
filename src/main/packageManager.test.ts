import { isMacOS } from '../shared/platform';

const APP_BUNDLE_PATH = '/Applications/Gitify.app';
const APP_EXE_PATH = `${APP_BUNDLE_PATH}/Contents/MacOS/Gitify`;

/** Fake file system: directory listings and the paths that symlinks resolve to */
const fileSystem: {
  directories: Record<string, string[]>;
  resolvedPaths: Record<string, string>;
} = {
  directories: {},
  resolvedPaths: {},
};

const readdirSync = (directoryPath: string) => {
  const entries = fileSystem.directories[directoryPath];

  if (!entries) {
    throw new Error(`ENOENT: no such directory, scandir '${directoryPath}'`);
  }

  return entries;
};

const realpathSync = (targetPath: string) => {
  const resolvedPath = fileSystem.resolvedPaths[targetPath];

  if (!resolvedPath) {
    throw new Error(`ENOENT: no such file or directory, lstat '${targetPath}'`);
  }

  return resolvedPath;
};

vi.mock('node:fs', () => ({
  default: {
    readdirSync: (directoryPath: string) => readdirSync(directoryPath),
    realpathSync: (targetPath: string) => realpathSync(targetPath),
  },
}));

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => APP_EXE_PATH),
  } satisfies Pick<Electron.App, 'getPath'>,
}));

vi.mock('../shared/platform', () => ({
  isMacOS: vi.fn(),
}));

import { detectPackageManager } from './packageManager';

describe('main/packageManager.ts', () => {
  /** Install the cask metadata that a `brew install --cask gitify` leaves behind */
  const givenHomebrewCaskInstall = (prefix: string, bundlePath = APP_BUNDLE_PATH) => {
    fileSystem.directories[`${prefix}/Caskroom/gitify`] = ['.metadata', '7.4.0'];
    fileSystem.resolvedPaths[`${prefix}/Caskroom/gitify/7.4.0/Gitify.app`] = bundlePath;
  };

  beforeEach(() => {
    fileSystem.directories = {};
    fileSystem.resolvedPaths = { [APP_BUNDLE_PATH]: APP_BUNDLE_PATH };

    vi.stubEnv('HOMEBREW_PREFIX', '');
    vi.mocked(isMacOS).mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('detectPackageManager', () => {
    it('returns null for a manual install', () => {
      expect(detectPackageManager()).toBeNull();
    });

    it.each(['/opt/homebrew', '/usr/local'])(
      'detects a Homebrew cask install under %s',
      (prefix) => {
        givenHomebrewCaskInstall(prefix);

        expect(detectPackageManager()).toBe('Homebrew');
      },
    );

    it('detects a Homebrew cask install under a custom prefix', () => {
      vi.stubEnv('HOMEBREW_PREFIX', '/custom/homebrew');
      givenHomebrewCaskInstall('/custom/homebrew');

      expect(detectPackageManager()).toBe('Homebrew');
    });

    it('returns null when the cask owns a different copy of the app', () => {
      givenHomebrewCaskInstall('/opt/homebrew', '/Users/test/Applications/Gitify.app');

      expect(detectPackageManager()).toBeNull();
    });

    it('returns null when the cask is no longer installed', () => {
      fileSystem.directories['/opt/homebrew/Caskroom/gitify'] = ['.metadata', '7.4.0'];

      expect(detectPackageManager()).toBeNull();
    });

    it('returns null when the app bundle cannot be resolved', () => {
      fileSystem.resolvedPaths = {};
      givenHomebrewCaskInstall('/opt/homebrew');

      expect(detectPackageManager()).toBeNull();
    });

    it('skips Homebrew detection when not running on macOS', () => {
      vi.mocked(isMacOS).mockReturnValue(false);
      givenHomebrewCaskInstall('/opt/homebrew');

      expect(detectPackageManager()).toBeNull();
    });
  });
});
