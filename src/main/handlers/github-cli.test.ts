import { delimiter } from 'node:path';

import { readGitHubCliToken, listGitHubCliAccounts } from './github-cli';

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

    await expect(readGitHubCliToken({ hostname: 'github.com' })).resolves.toEqual({
      token: 'gho_token',
    });
    expect(execFileMock).toHaveBeenCalledWith(
      'gh',
      ['auth', 'token', '--hostname', 'github.com'],
      expect.anything(),
    );
  });

  it('addresses a named account with --user', async () => {
    execFileMock.mockResolvedValue({ stdout: 'gho_alice\n', stderr: '' });

    await expect(
      readGitHubCliToken({
        hostname: 'github.com',
        identity: { kind: 'account', login: 'alice' },
      }),
    ).resolves.toEqual({ token: 'gho_alice' });
    expect(execFileMock.mock.calls[0][1]).toEqual([
      'auth',
      'token',
      '--hostname',
      'github.com',
      '--user',
      'alice',
    ]);
  });

  it('resolves the environment identity without --user', async () => {
    process.env.GH_TOKEN = 'gho_from_shell';
    execFileMock.mockResolvedValue({ stdout: 'gho_from_shell\n', stderr: '' });

    await expect(
      readGitHubCliToken({ hostname: 'github.com', identity: { kind: 'environment' } }),
    ).resolves.toEqual({ token: 'gho_from_shell' });
    expect(execFileMock.mock.calls[0][1]).toEqual(['auth', 'token', '--hostname', 'github.com']);
  });

  it('fails closed when the environment credential has gone away', async () => {
    delete process.env.GH_TOKEN;
    delete process.env.GITHUB_TOKEN;

    await expect(
      readGitHubCliToken({ hostname: 'github.com', identity: { kind: 'environment' } }),
    ).resolves.toEqual({ error: 'GH_NOT_AUTHENTICATED' });
    expect(execFileMock).not.toHaveBeenCalled();
  });

  it('refuses a login it cannot vouch for without spawning the CLI', async () => {
    await expect(
      readGitHubCliToken({
        hostname: 'github.com',
        identity: { kind: 'account', login: 'alice; rm -rf /' },
      }),
    ).resolves.toEqual({ error: 'GH_FAILED' });
    expect(execFileMock).not.toHaveBeenCalled();
  });

  it('never leaves an empty PATH element, which would search the working directory', async () => {
    delete process.env.PATH;

    await readGitHubCliToken({ hostname: 'github.com' });

    expect(spawnedEnv().PATH?.split(delimiter)).not.toContain('');
  });

  it("passes an ambient token through, since it can be the CLI's only credential", async () => {
    process.env.GH_TOKEN = 'gho_from_shell';

    await readGitHubCliToken({ hostname: 'github.com' });

    expect(spawnedEnv().GH_TOKEN).toBe('gho_from_shell');
  });

  it('reports a missing CLI', async () => {
    execFileMock.mockRejectedValue(Object.assign(new Error('spawn gh ENOENT'), { code: 'ENOENT' }));

    await expect(readGitHubCliToken({ hostname: 'github.com' })).resolves.toEqual({
      error: 'GH_NOT_FOUND',
    });
  });

  it('reports a CLI with no token for the host', async () => {
    execFileMock.mockRejectedValue(
      Object.assign(new Error('exit 1'), {
        code: 1,
        stderr: 'no oauth token found for github.example.com\n',
      }),
    );

    await expect(readGitHubCliToken({ hostname: 'github.example.com' })).resolves.toEqual({
      error: 'GH_NOT_AUTHENTICATED',
    });
  });

  it('treats empty CLI output as no token', async () => {
    execFileMock.mockResolvedValue({ stdout: '\n', stderr: '' });

    await expect(readGitHubCliToken({ hostname: 'github.com' })).resolves.toEqual({
      error: 'GH_NOT_AUTHENTICATED',
    });
  });

  it('reports a timed-out CLI separately, since a keychain prompt blocks it', async () => {
    execFileMock.mockRejectedValue(Object.assign(new Error('killed'), { killed: true }));

    await expect(readGitHubCliToken({ hostname: 'github.com' })).resolves.toEqual({
      error: 'GH_TIMED_OUT',
    });
  });

  it("carries the CLI's own reason for an unclassified failure", async () => {
    execFileMock.mockRejectedValue(
      Object.assign(new Error('exit 1'), { code: 1, stderr: 'keyring is locked\nmore detail' }),
    );

    await expect(readGitHubCliToken({ hostname: 'github.com' })).resolves.toEqual({
      error: 'GH_FAILED',
      detail: 'keyring is locked',
    });
  });

  it('never spawns the CLI for a hostname it cannot vouch for', async () => {
    await expect(readGitHubCliToken({ hostname: 'github.com; rm -rf /' })).resolves.toEqual({
      error: 'GH_FAILED',
    });
    expect(execFileMock).not.toHaveBeenCalled();
  });

  describe('listing identities', () => {
    it('lists every usable identity and marks the active one', async () => {
      execFileMock.mockResolvedValue({
        stdout: JSON.stringify({
          hosts: {
            'github.com': [
              { state: 'success', active: true, login: 'alice', tokenSource: 'keyring' },
              { state: 'success', active: false, login: 'bob', tokenSource: 'keyring' },
              { state: 'error', active: false, login: 'carol', tokenSource: 'keyring' },
            ],
          },
        }),
        stderr: '',
      });

      await expect(listGitHubCliAccounts('github.com')).resolves.toEqual({
        accounts: [
          { identity: { kind: 'account', login: 'alice' }, active: true },
          { identity: { kind: 'account', login: 'bob' }, active: false },
        ],
      });
      expect(execFileMock).toHaveBeenCalledWith(
        'gh',
        ['auth', 'status', '--hostname', 'github.com', '--json', 'hosts'],
        expect.anything(),
      );
    });

    it('reports the environment credential as its own identity', async () => {
      execFileMock.mockResolvedValue({
        stdout: JSON.stringify({
          hosts: {
            'github.com': [{ state: 'success', active: true, login: '', tokenSource: 'GH_TOKEN' }],
          },
        }),
        stderr: '',
      });

      await expect(listGitHubCliAccounts('github.com')).resolves.toEqual({
        accounts: [{ identity: { kind: 'environment' }, active: true }],
      });
    });

    it('returns an empty list for a host with no identities', async () => {
      execFileMock.mockResolvedValue({ stdout: '{"hosts":{}}', stderr: '' });

      await expect(listGitHubCliAccounts('github.example.com')).resolves.toEqual({
        accounts: [],
      });
    });

    it('reports an unsupported CLI rather than an empty list', async () => {
      execFileMock.mockRejectedValue(
        Object.assign(new Error('exit 1'), { code: 1, stderr: 'unknown flag: --json' }),
      );

      await expect(listGitHubCliAccounts('github.com')).resolves.toEqual({
        error: 'GH_ACCOUNTS_UNSUPPORTED',
      });
    });

    it('reports a missing CLI while listing', async () => {
      execFileMock.mockRejectedValue(
        Object.assign(new Error('spawn gh ENOENT'), { code: 'ENOENT' }),
      );

      await expect(listGitHubCliAccounts('github.com')).resolves.toEqual({
        error: 'GH_NOT_FOUND',
      });
    });

    it('never spawns the CLI for a hostname it cannot vouch for while listing', async () => {
      await expect(listGitHubCliAccounts('github.com; rm -rf /')).resolves.toEqual({
        error: 'GH_FAILED',
      });
      expect(execFileMock).not.toHaveBeenCalled();
    });
  });
});
