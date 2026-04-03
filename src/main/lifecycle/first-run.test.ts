import path from 'node:path';

const existsSyncMock = vi.fn();
const mkdirSyncMock = vi.fn();
const writeFileSyncMock = vi.fn();

vi.mock('node:fs', () => ({
  __esModule: true,
  default: {
    existsSync: (...a: unknown[]) => existsSyncMock(...a),
    mkdirSync: (...a: unknown[]) => mkdirSyncMock(...a),
    writeFileSync: (...a: unknown[]) => writeFileSyncMock(...a),
  },
  existsSync: (...a: unknown[]) => existsSyncMock(...a),
  mkdirSync: (...a: unknown[]) => mkdirSyncMock(...a),
  writeFileSync: (...a: unknown[]) => writeFileSyncMock(...a),
}));

const moveToApplicationsFolderMock = vi.fn();
const isInApplicationsFolderMock = vi.fn(() => false);
const getPathMock = vi.fn(() => '/User/Data');

const showMessageBoxMock = vi.fn(async () => ({ response: 0 }));

vi.mock('electron', () => ({
  app: {
    getPath: () => getPathMock(),
    isInApplicationsFolder: () => isInApplicationsFolderMock(),
    moveToApplicationsFolder: () => moveToApplicationsFolderMock(),
  },
  dialog: { showMessageBox: () => showMessageBoxMock() },
}));

// Ensure the module under test thinks we're not in dev mode
vi.mock('../utils', () => ({ isDevMode: () => false }));

const logErrorMock = vi.fn();
vi.mock('../../shared/logger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../shared/logger')>();
  return {
    ...actual,
    logError: (...a: unknown[]) => logErrorMock(...a),
  };
});

let mac = true;
vi.mock('../../shared/platform', () => ({ isMacOS: () => mac }));

import { APPLICATION } from '../../shared/constants';

import { onFirstRunMaybe } from './first-run';

function configPath() {
  return path.join('/User/Data', 'FirstRun', APPLICATION.FIRST_RUN_FOLDER);
}

describe('main/lifecycle/first-run', () => {
  beforeEach(() => {
    mac = true;
  });

  it('creates first-run marker when not existing and returns true', async () => {
    existsSyncMock.mockReturnValueOnce(false); // marker absent
    existsSyncMock.mockReturnValueOnce(false); // folder absent

    await onFirstRunMaybe();

    expect(mkdirSyncMock).toHaveBeenCalledWith(path.dirname(configPath()));
    expect(writeFileSyncMock).toHaveBeenCalledWith(configPath(), '');
  });

  it('skips writing when marker exists', async () => {
    existsSyncMock.mockReturnValueOnce(true); // marker present

    await onFirstRunMaybe();

    expect(writeFileSyncMock).not.toHaveBeenCalled();
    expect(mkdirSyncMock).not.toHaveBeenCalled();
  });

  it('handles fs write error gracefully', async () => {
    existsSyncMock.mockReturnValueOnce(false); // marker absent
    existsSyncMock.mockReturnValueOnce(true); // folder exists
    writeFileSyncMock.mockImplementation(() => {
      throw new Error('fail');
    });

    await onFirstRunMaybe();

    expect(logErrorMock).toHaveBeenCalledWith(
      'checkAndMarkFirstRun',
      'Unable to write firstRun file',
      expect.any(Error),
    );
  });

  it('prompts and moves app on macOS when user accepts', async () => {
    existsSyncMock.mockReturnValueOnce(false); // marker
    existsSyncMock.mockReturnValueOnce(false); // folder
    showMessageBoxMock.mockResolvedValueOnce({ response: 0 });

    await onFirstRunMaybe();

    expect(moveToApplicationsFolderMock).toHaveBeenCalled();
  });

  it('does not move when user declines', async () => {
    existsSyncMock.mockReturnValueOnce(false);
    existsSyncMock.mockReturnValueOnce(false);
    showMessageBoxMock.mockResolvedValueOnce({ response: 1 });

    await onFirstRunMaybe();

    expect(moveToApplicationsFolderMock).not.toHaveBeenCalled();
  });

  it('does not prompt on non-macOS', async () => {
    mac = false;
    existsSyncMock.mockReturnValueOnce(false);
    existsSyncMock.mockReturnValueOnce(false);

    await onFirstRunMaybe();

    expect(showMessageBoxMock).not.toHaveBeenCalled();
  });
});
