import path from 'node:path';

import type { Menubar } from 'menubar';

const writeFile = vi.fn((_p: string, _d: unknown, cb: () => void) => cb());
vi.mock('node:fs', () => ({
  default: {
    writeFile: (p: string, d: unknown, cb: () => void) => writeFile(p, d, cb),
  },
  writeFile: (p: string, d: unknown, cb: () => void) => writeFile(p, d, cb),
}));

const homedir = vi.fn(() => '/home/test');
vi.mock('node:os', () => ({
  default: { homedir: () => homedir() },
  homedir: () => homedir(),
}));

vi.mock('electron', () => ({
  app: {
    isPackaged: true,
  },
  shell: { openPath: vi.fn(() => Promise.resolve('')) },
  dialog: { showMessageBoxSync: vi.fn(() => 0) },
}));

const fileGetFileMock = vi.fn(() => ({ path: '/var/log/app/app.log' }));
vi.mock('electron-log', () => ({
  default: {
    transports: {
      file: { getFile: () => fileGetFileMock() },
    },
  },
  transports: {
    file: { getFile: () => fileGetFileMock() },
  },
}));

const logInfoMock = vi.fn();
const logErrorMock = vi.fn();
vi.mock('../shared/logger', () => ({
  logInfo: (...a: unknown[]) => logInfoMock(...a),
  logError: (...a: unknown[]) => logErrorMock(...a),
}));

import { shell } from 'electron';

import { isDevMode, openLogsDirectory, takeScreenshot } from './utils';

function createMb() {
  return {
    window: {
      capturePage: () =>
        Promise.resolve({ toPNG: () => Buffer.from('image-bytes') }),
    },
  };
}

describe('main/utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fileGetFileMock.mockReturnValue({ path: '/var/log/app/app.log' });
  });

  describe('isDevMode', () => {
    it('returns false when app is packaged', () => {
      expect(isDevMode()).toBe(false);
    });
  });

  describe('takeScreenshot', () => {
    it('writes file and logs info', async () => {
      const mb = createMb();
      await takeScreenshot(mb as unknown as Menubar);
      expect(writeFile).toHaveBeenCalled();
      const writtenPath = (writeFile.mock.calls[0] as unknown[])[0] as string;
      expect(writtenPath.startsWith(path.join('/home/test'))).toBe(true);
      expect(logInfoMock).toHaveBeenCalledWith(
        'takeScreenshot',
        expect.stringContaining('Screenshot saved'),
      );
    });
  });

  describe('openLogsDirectory', () => {
    it('opens directory when log file is present', () => {
      openLogsDirectory();
      expect(shell.openPath).toHaveBeenCalledWith('/var/log/app');
    });

    it('logs error when log path is unavailable', () => {
      fileGetFileMock.mockReturnValueOnce(null);
      openLogsDirectory();
      expect(logErrorMock).toHaveBeenCalledWith(
        'openLogsDirectory',
        'Could not find log directory!',
        expect.any(Error),
      );
    });
  });
});
