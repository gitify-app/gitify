import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { detectUpdateManager } from './update-manager';

const owners = new Map<string, string>();
vi.mock('node:child_process', () => ({
  execFile: vi.fn(
    (
      command: string,
      args: string[],
      _options: object,
      callback: (error: Error | null, stdout: string) => void,
    ) => {
      const owner = owners.get(`${command}:${args.at(-1)}`);
      callback(owner ? null : Object.assign(new Error('Not owned'), { code: 1 }), owner ?? '');
    },
  ),
}));

vi.mock('../shared/logger', () => ({ logError: vi.fn(), toError: (error: unknown) => error }));

describe('installation update manager', () => {
  let directory: string;
  beforeEach(async () => {
    owners.clear();
    directory = await mkdtemp(path.join(os.tmpdir(), 'gitify-install-'));
    await mkdir(path.join(directory, 'resources'));
    await writeFile(path.join(directory, 'Gitify.exe'), '');
  });
  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  const installation = (platform: NodeJS.Platform = 'linux', env: NodeJS.ProcessEnv = {}) => ({
    platform,
    env,
    appPath: path.join(directory, 'resources', 'app.asar'),
    executablePath: path.join(directory, 'Gitify.exe'),
    resourcesPath: path.join(directory, 'resources'),
  });

  it.each(['pacman', 'dpkg-query', 'rpm'])(
    'detects ownership of Gitify itself with %s',
    async (command) => {
      const installed = installation();
      owners.set(`${command}:${installed.appPath}`, 'gitify-bin');
      expect(await detectUpdateManager(installed)).toBe(
        command === 'dpkg-query' ? 'dpkg' : command === 'rpm' ? 'RPM' : 'pacman',
      );
      expect(execFile).toHaveBeenCalledWith(
        command,
        expect.arrayContaining([installed.appPath]),
        expect.objectContaining({ timeout: 1500 }),
        expect.any(Function),
      );
    },
  );

  it('does not mistake a system Electron package for ownership of Gitify', async () => {
    const installed = installation();
    owners.set(`pacman:${installed.executablePath}`, 'electron');
    expect(await detectUpdateManager(installed)).toBeNull();
  });

  it('queries package.json for an unpacked application', async () => {
    const installed = { ...installation(), appPath: path.join(directory, 'gitify') };
    owners.set(`pacman:${path.join(installed.appPath, 'package.json')}`, 'gitify');
    expect(await detectUpdateManager(installed)).toBe('pacman');
  });

  it.each(['scoop-', ''])(
    'detects Scoop using %smetadata beside the running executable',
    async (prefix) => {
      await writeFile(
        path.join(directory, `${prefix}install.json`),
        JSON.stringify({ architecture: '64bit', bucket: 'extras' }),
      );
      await writeFile(
        path.join(directory, `${prefix}manifest.json`),
        JSON.stringify({ version: '7.8.0' }),
      );
      expect(await detectUpdateManager(installation('win32'))).toBe('Scoop');
    },
  );

  it('ignores malformed or unrelated Scoop metadata', async () => {
    await writeFile(path.join(directory, 'install.json'), '{}');
    await writeFile(path.join(directory, 'manifest.json'), 'not json');
    expect(await detectUpdateManager(installation('win32'))).toBeNull();
  });

  it.each([
    [{ FLATPAK_ID: 'io.gitify.Gitify' }, 'Flatpak'],
    [{ SNAP: '/snap/gitify/current', SNAP_NAME: 'gitify' }, 'Snap'],
    [{ GITIFY_DISABLE_AUTO_UPDATE: '1' }, 'your package manager'],
  ])('detects a managed runtime from %j', async (env, manager) => {
    expect(await detectUpdateManager(installation('linux', env))).toBe(manager);
    expect(execFile).not.toHaveBeenCalled();
  });

  it('honors a packager marker on any platform', async () => {
    await writeFile(path.join(directory, 'resources', 'disable-auto-updates'), '');
    expect(await detectUpdateManager(installation('darwin'))).toBe('your package manager');
  });

  it.each(['darwin', 'win32', 'linux'] satisfies NodeJS.Platform[])(
    'keeps the default for an unmanaged %s installation',
    async (platform) => {
      expect(await detectUpdateManager(installation(platform))).toBeNull();
    },
  );
});
