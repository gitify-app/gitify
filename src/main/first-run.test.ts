import path from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks
const existsSync = vi.fn();
const mkdirSync = vi.fn();
const writeFileSync = vi.fn();
vi.mock('node:fs', () => ({
  __esModule: true,
  default: {
    existsSync: (...a: unknown[]) => existsSync(...a),
    mkdirSync: (...a: unknown[]) => mkdirSync(...a),
    writeFileSync: (...a: unknown[]) => writeFileSync(...a),
  },
  existsSync: (...a: unknown[]) => existsSync(...a),
  mkdirSync: (...a: unknown[]) => mkdirSync(...a),
  writeFileSync: (...a: unknown[]) => writeFileSync(...a),
}));

const moveToApplicationsFolder = vi.fn();
const isInApplicationsFolder = vi.fn(() => false);
const getPath = vi.fn(() => '/User/Data');

const showMessageBox = vi.fn(async () => ({ response: 0 }));

vi.mock('electron', () => ({
  app: {
    getPath: () => getPath(),
    isInApplicationsFolder: () => isInApplicationsFolder(),
    moveToApplicationsFolder: () => moveToApplicationsFolder(),
  },
  dialog: { showMessageBox: () => showMessageBox() },
}));

const logError = vi.fn();
vi.mock('../shared/logger', () => ({
  logError: (...a: unknown[]) => logError(...a),
}));

let mac = true;
vi.mock('../shared/platform', () => ({ isMacOS: () => mac }));

import { APPLICATION } from '../shared/constants';

import { onFirstRunMaybe } from './first-run';

describe('main/first-run', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mac = true;
  });

  function configPath() {
    return path.join('/User/Data', 'FirstRun', APPLICATION.FIRST_RUN_FOLDER);
  }

  it('creates first-run marker when not existing and returns true', async () => {
    existsSync.mockReturnValueOnce(false); // marker absent
    existsSync.mockReturnValueOnce(false); // folder absent
    await onFirstRunMaybe();
    expect(mkdirSync).toHaveBeenCalledWith(path.dirname(configPath()));
    expect(writeFileSync).toHaveBeenCalledWith(configPath(), '');
  });

  it('skips writing when marker exists', async () => {
    existsSync.mockReturnValueOnce(true); // marker present
    await onFirstRunMaybe();
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(mkdirSync).not.toHaveBeenCalled();
  });

  it('handles fs write error gracefully', async () => {
    existsSync.mockReturnValueOnce(false); // marker absent
    existsSync.mockReturnValueOnce(true); // folder exists
    writeFileSync.mockImplementation(() => {
      throw new Error('fail');
    });
    await onFirstRunMaybe();
    expect(logError).toHaveBeenCalledWith(
      'isFirstRun',
      'Unable to write firstRun file',
      expect.any(Error),
    );
  });

  it('prompts and moves app on macOS when user accepts', async () => {
    existsSync.mockReturnValueOnce(false); // marker
    existsSync.mockReturnValueOnce(false); // folder
    showMessageBox.mockResolvedValueOnce({ response: 0 });
    await onFirstRunMaybe();
    expect(moveToApplicationsFolder).toHaveBeenCalled();
  });

  it('does not move when user declines', async () => {
    existsSync.mockReturnValueOnce(false);
    existsSync.mockReturnValueOnce(false);
    showMessageBox.mockResolvedValueOnce({ response: 1 });
    await onFirstRunMaybe();
    expect(moveToApplicationsFolder).not.toHaveBeenCalled();
  });

  it('skips prompt on non-macOS', async () => {
    mac = false;
    existsSync.mockReturnValueOnce(false);
    existsSync.mockReturnValueOnce(false);
    await onFirstRunMaybe();
    expect(showMessageBox).not.toHaveBeenCalled();
  });
});
