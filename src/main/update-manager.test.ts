import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { detectUpdateManager } from './update-manager';

vi.mock('../shared/logger', () => ({ logError: vi.fn(), toError: (error: unknown) => error }));

describe('installation update manager', () => {
  let directory: string;
  beforeEach(async () => {
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
    executablePath: path.join(directory, 'Gitify.exe'),
    resourcesPath: path.join(directory, 'resources'),
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
    [
      { FLATPAK_ID: 'io.gitify.Gitify', SNAP: '/snap/gitify/current', SNAP_NAME: 'gitify' },
      'Flatpak',
    ],
    [{ GITIFY_DISABLE_AUTO_UPDATE: '1' }, 'packager'],
  ])('detects a managed runtime from %j', async (env, manager) => {
    expect(await detectUpdateManager(installation('linux', env))).toBe(manager);
  });

  it('honors a packager marker on any platform', async () => {
    await writeFile(path.join(directory, 'resources', 'disable-auto-updates'), '');
    expect(await detectUpdateManager(installation('darwin'))).toBe('packager');
  });

  it.each(['darwin', 'win32', 'linux'] satisfies NodeJS.Platform[])(
    'keeps the default for an unmanaged %s installation',
    async (platform) => {
      expect(await detectUpdateManager(installation(platform))).toBeNull();
    },
  );
});
