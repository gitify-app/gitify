import { delimiter } from 'node:path';

import { readGitHubCliToken } from './github-cli';

const execFileMock = vi.fn();

vi.mock('node:child_process', () => {
  const execFile = (...args: unknown[]) => execFileMock(...args);

  // Node's real `execFile` carries this custom implementation, which is what
  // makes `promisify(execFile)` resolve to `{ stdout, stderr }`.
  (execFile as unknown as Record<symbol, unknown>)[Symbol.for('nodejs.util.promisify.custom')] = (
    ...args: unknown[]
  ) => execFileMock(...args);

  return { execFile };
});

vi.mock('electron', () => ({ ipcMain: { handle: vi.fn() } }));

describe('main/handlers/github-cli.ts', () => {
  const inheritedEnv = { ...process.env };

  beforeEach(() => {
    execFileMock.mockReset();
    execFileMock.mockResolvedValue({ stdout: 'gho_token', stderr: '' });
  });

  afterEach(() => {
    process.env = { ...inheritedEnv };
  });

  function spawnedEnv(): Record<string, string | undefined> {
    const options = execFileMock.mock.calls[0][2];
    return options.env;
  }

  it('returns the token the CLI holds for the host', async () => {
    execFileMock.mockResolvedValue({ stdout: 'gho_token\n', stderr: '' });

    await expect(readGitHubCliToken('github.com')).resolves.toEqual({ token: 'gho_token' });
    expect(execFileMock).toHaveBeenCalledWith(
      'gh',
      ['auth', 'token', '--hostname', 'github.com'],
      expect.anything(),
    );
  });

  it('never leaves an empty PATH element, which would search the working directory', async () => {
    delete process.env.PATH;

    await readGitHubCliToken('github.com');

    expect(spawnedEnv().PATH?.split(delimiter)).not.toContain('');
  });

  it("passes an ambient token through, since it can be the CLI's only credential", async () => {
    process.env.GH_TOKEN = 'gho_from_shell';

    await readGitHubCliToken('github.com');

    expect(spawnedEnv().GH_TOKEN).toBe('gho_from_shell');
  });

  it('reports a missing CLI', async () => {
    execFileMock.mockRejectedValue(Object.assign(new Error('spawn gh ENOENT'), { code: 'ENOENT' }));

    await expect(readGitHubCliToken('github.com')).resolves.toEqual({ error: 'GH_NOT_FOUND' });
  });

  it('reports a CLI with no token for the host', async () => {
    execFileMock.mockRejectedValue(
      Object.assign(new Error('exit 1'), {
        code: 1,
        stderr: 'no oauth token found for github.example.com\n',
      }),
    );

    await expect(readGitHubCliToken('github.example.com')).resolves.toEqual({
      error: 'GH_NOT_AUTHENTICATED',
    });
  });

  it('treats empty CLI output as no token', async () => {
    execFileMock.mockResolvedValue({ stdout: '\n', stderr: '' });

    await expect(readGitHubCliToken('github.com')).resolves.toEqual({
      error: 'GH_NOT_AUTHENTICATED',
    });
  });

  it('reports a timed-out CLI separately, since a keychain prompt blocks it', async () => {
    execFileMock.mockRejectedValue(Object.assign(new Error('killed'), { killed: true }));

    await expect(readGitHubCliToken('github.com')).resolves.toEqual({ error: 'GH_TIMED_OUT' });
  });

  it("carries the CLI's own reason for an unclassified failure", async () => {
    execFileMock.mockRejectedValue(
      Object.assign(new Error('exit 1'), { code: 1, stderr: 'keyring is locked\nmore detail' }),
    );

    await expect(readGitHubCliToken('github.com')).resolves.toEqual({
      error: 'GH_FAILED',
      detail: 'keyring is locked',
    });
  });

  it('never spawns the CLI for a hostname it cannot vouch for', async () => {
    await expect(readGitHubCliToken('github.com; rm -rf /')).resolves.toEqual({
      error: 'GH_FAILED',
    });
    expect(execFileMock).not.toHaveBeenCalled();
  });
});
