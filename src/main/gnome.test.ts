import fs from 'node:fs';

import { enableExtension, getExtensionState, installExtension } from './gnome';

const UUID = 'tray-position@gitify.app';

const execFileMock = vi.hoisted(() => vi.fn());

vi.mock('node:child_process', () => ({
  execFile: execFileMock,
}));

vi.mock('node:util', () => ({
  promisify: () => execFileMock,
}));

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
    getAppPath: () => '/app',
    getPath: () => '/home/user',
  },
}));

const logErrorMock = vi.fn();
vi.mock('../shared/logger', () => ({
  logError: (...args: unknown[]) => logErrorMock(...args),
  toError: (err: unknown) => err,
}));

function mockExtensionsCli(replies: Record<string, string>): void {
  execFileMock.mockImplementation((_cmd: string, args: string[]) => {
    const key = args.join(' ');

    return key in replies
      ? Promise.resolve({ stdout: replies[key], stderr: '' })
      : Promise.reject(new Error(`unexpected call: ${key}`));
  });
}

describe('main/gnome.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  });

  describe('getExtensionState', () => {
    it('reports not-installed when the extension directory is missing', async () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      await expect(getExtensionState()).resolves.toBe('not-installed');
      expect(execFileMock).not.toHaveBeenCalled();
    });

    it('reports pending-session-restart when the shell does not know the extension', async () => {
      mockExtensionsCli({});

      await expect(getExtensionState()).resolves.toBe('pending-session-restart');
    });

    it('reports active when the extension is listed as active', async () => {
      mockExtensionsCli({
        [`info ${UUID}`]: '',
        'list --user --active --quiet': `other@example.com\n${UUID}\n`,
      });

      await expect(getExtensionState()).resolves.toBe('active');
    });

    it('reports inactive when the shell knows the extension but it is not active', async () => {
      mockExtensionsCli({
        [`info ${UUID}`]: '',
        'list --user --active --quiet': 'other@example.com\n',
      });

      await expect(getExtensionState()).resolves.toBe('inactive');
    });
  });

  describe('installExtension', () => {
    it('copies the bundled extension into the user extension directory', async () => {
      const cp = vi.spyOn(fs.promises, 'cp').mockResolvedValue(undefined);
      mockExtensionsCli({});

      await expect(installExtension()).resolves.toBe('pending-session-restart');
      expect(cp).toHaveBeenCalledWith(
        `/app/gnome-extension/${UUID}`,
        `/home/user/.local/share/gnome-shell/extensions/${UUID}`,
        { recursive: true },
      );
    });

    it('reports an error when the copy fails', async () => {
      vi.spyOn(fs.promises, 'cp').mockRejectedValue(new Error('read-only'));

      await expect(installExtension()).resolves.toBe('error');
      expect(logErrorMock).toHaveBeenCalled();
    });
  });

  describe('enableExtension', () => {
    it('enables the extension and returns the resulting state', async () => {
      mockExtensionsCli({
        [`enable ${UUID}`]: '',
        [`info ${UUID}`]: '',
        'list --user --active --quiet': `${UUID}\n`,
      });

      await expect(enableExtension()).resolves.toBe('active');
    });

    it('reports the unchanged state when enabling fails', async () => {
      mockExtensionsCli({});

      await expect(enableExtension()).resolves.toBe('pending-session-restart');
      expect(logErrorMock).toHaveBeenCalled();
    });
  });
});
