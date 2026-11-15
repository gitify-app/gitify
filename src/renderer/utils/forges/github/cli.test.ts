import type { Hostname } from '../../../types';

import * as comms from '../../system/comms';
import {
  forgetGitHubCliToken,
  forgetGitHubCliTokens,
  identifyGitHubCliIdentity,
  listGitHubCliAccounts,
  resolveGitHubCliToken,
} from './cli';

const GITHUB = 'github.com' as Hostname;
const ENTERPRISE = 'github.example.com' as Hostname;

describe('renderer/utils/forges/github/cli.ts', () => {
  const readToken = vi.spyOn(comms, 'readGitHubCliToken');
  const readAccounts = vi.spyOn(comms, 'listGitHubCliAccounts');

  beforeEach(() => {
    forgetGitHubCliTokens(GITHUB);
    forgetGitHubCliTokens(ENTERPRISE);
    readToken.mockReset();
    readAccounts.mockReset();
  });

  it('collapses concurrent resolutions onto one CLI read', async () => {
    readToken.mockResolvedValue({ token: 'gho_token' });

    const [first, second] = await Promise.all([
      resolveGitHubCliToken(GITHUB),
      resolveGitHubCliToken(GITHUB),
    ]);

    expect([first, second]).toEqual(['gho_token', 'gho_token']);
    expect(readToken).toHaveBeenCalledTimes(1);
  });

  it('re-reads the CLI once the host is forgotten', async () => {
    readToken.mockResolvedValueOnce({ token: 'gho_stale' });
    readToken.mockResolvedValueOnce({ token: 'gho_rotated' });

    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_stale');
    forgetGitHubCliToken(GITHUB);

    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_rotated');
  });

  it('reads a replacement credential after a successful read', async () => {
    readToken.mockResolvedValueOnce({ token: 'gho_original' });
    readToken.mockResolvedValueOnce({ token: 'gho_replacement' });

    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_original');
    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_replacement');
    expect(readToken).toHaveBeenCalledTimes(2);
  });

  it('observes CLI logout after a successful read', async () => {
    readToken.mockResolvedValueOnce({ token: 'gho_original' });
    readToken.mockResolvedValueOnce({ error: 'GH_NOT_AUTHENTICATED' });

    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_original');
    await expect(resolveGitHubCliToken(GITHUB)).rejects.toThrow('GitHub CLI has no token');
  });

  it('resolves each host against its own CLI entry', async () => {
    readToken.mockImplementation(async (request) =>
      request.hostname === GITHUB ? { token: 'gho_cloud' } : { token: 'gho_enterprise' },
    );

    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_cloud');
    await expect(resolveGitHubCliToken(ENTERPRISE)).resolves.toBe('gho_enterprise');
  });

  it('does not cache a failed read', async () => {
    readToken.mockResolvedValueOnce({ error: 'GH_FAILED' });
    readToken.mockResolvedValueOnce({ token: 'gho_token' });

    await expect(resolveGitHubCliToken(GITHUB)).rejects.toThrow(
      'GitHub CLI could not provide a token for github.com.',
    );
    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_token');
  });

  it('does not evict a newer pending read when an invalidated read settles', async () => {
    const original = Promise.withResolvers<{ token: string }>();
    const replacement = Promise.withResolvers<{ token: string }>();
    readToken.mockReturnValueOnce(original.promise).mockReturnValueOnce(replacement.promise);

    const first = resolveGitHubCliToken(GITHUB);
    forgetGitHubCliToken(GITHUB);
    const second = resolveGitHubCliToken(GITHUB);
    original.resolve({ token: 'gho_original' });
    await first;

    expect(resolveGitHubCliToken(GITHUB)).toBe(second);
    expect(readToken).toHaveBeenCalledTimes(2);
    replacement.resolve({ token: 'gho_replacement' });
    await expect(second).resolves.toBe('gho_replacement');
  });

  it('tells the user how to install a CLI it could not find', async () => {
    readToken.mockResolvedValue({ error: 'GH_NOT_FOUND' });

    await expect(resolveGitHubCliToken(GITHUB)).rejects.toThrow(
      'GitHub CLI (gh) was not found. Install it from https://cli.github.com, log in, and try again.',
    );
  });

  it('tells the user how to log the CLI in to the host', async () => {
    readToken.mockResolvedValue({ error: 'GH_NOT_AUTHENTICATED' });

    await expect(resolveGitHubCliToken(ENTERPRISE)).rejects.toThrow(
      'GitHub CLI has no token for github.example.com. Run `gh auth login --hostname github.example.com` and try again.',
    );
  });

  it('names the keychain prompt when the CLI does not respond', async () => {
    readToken.mockResolvedValue({ error: 'GH_TIMED_OUT' });

    await expect(resolveGitHubCliToken(GITHUB)).rejects.toThrow(
      'GitHub CLI did not respond within 10 seconds for github.com. It may be waiting on a keychain prompt.',
    );
  });

  it("passes through the CLI's own reason for an unclassified failure", async () => {
    readToken.mockResolvedValue({ error: 'GH_FAILED', detail: 'keyring is locked' });

    await expect(resolveGitHubCliToken(GITHUB)).rejects.toThrow(
      'GitHub CLI could not provide a token for github.com: keyring is locked',
    );
  });

  it('names the pinned account when its credential is gone', async () => {
    readToken.mockResolvedValue({ error: 'GH_NOT_AUTHENTICATED' });

    await expect(
      resolveGitHubCliToken(GITHUB, { kind: 'account', login: 'alice' }),
    ).rejects.toThrow(
      'GitHub CLI has no token for github.com account alice. Run `gh auth login --hostname github.com` and try again.',
    );
  });

  it('resolves different identities on one host separately', async () => {
    readToken.mockImplementation(async ({ identity }) => ({
      token: identity?.kind === 'account' ? `gho_${identity.login}` : 'gho_active',
    }));

    const [alice, bob] = await Promise.all([
      resolveGitHubCliToken(GITHUB, { kind: 'account', login: 'alice' }),
      resolveGitHubCliToken(GITHUB, { kind: 'account', login: 'bob' }),
    ]);

    expect([alice, bob]).toEqual(['gho_alice', 'gho_bob']);
    expect(readToken).toHaveBeenCalledTimes(2);
  });

  it('collapses concurrent reads for one identity onto one CLI call', async () => {
    readToken.mockResolvedValue({ token: 'gho_alice' });
    const identity = { kind: 'account', login: 'alice' } as const;

    await Promise.all([
      resolveGitHubCliToken(GITHUB, identity),
      resolveGitHubCliToken(GITHUB, identity),
    ]);

    expect(readToken).toHaveBeenCalledTimes(1);
  });

  it('forgets one identity without disturbing another', async () => {
    readToken.mockImplementation(async ({ identity }) => ({
      token: identity?.kind === 'account' ? `gho_${identity.login}_second` : 'gho_active',
    }));

    await resolveGitHubCliToken(GITHUB, { kind: 'account', login: 'alice' });
    await resolveGitHubCliToken(GITHUB, { kind: 'account', login: 'bob' });
    forgetGitHubCliToken(GITHUB, { kind: 'account', login: 'alice' });
    await resolveGitHubCliToken(GITHUB, { kind: 'account', login: 'bob' });

    expect(readToken).toHaveBeenCalledTimes(3);
  });

  describe('listing identities', () => {
    it('maps the CLI list onto renderer choices', async () => {
      readAccounts.mockResolvedValue({
        accounts: [{ identity: { kind: 'account', login: 'alice' }, active: true }],
      });

      await expect(listGitHubCliAccounts(GITHUB)).resolves.toEqual({
        accounts: [{ identity: { kind: 'account', login: 'alice' }, active: true }],
      });
    });

    it('maps an unsupported CLI onto the renderer fallback code', async () => {
      readAccounts.mockResolvedValue({ error: 'GH_ACCOUNTS_UNSUPPORTED' });

      await expect(listGitHubCliAccounts(GITHUB)).resolves.toEqual({
        error: 'CLI_UNSUPPORTED',
        detail: undefined,
      });
    });

    it('identifies a stored login ignoring case', async () => {
      readAccounts.mockResolvedValue({
        accounts: [
          { identity: { kind: 'account', login: 'Alice' }, active: false },
          { identity: { kind: 'environment' }, active: true },
        ],
      });

      await expect(identifyGitHubCliIdentity(GITHUB, 'alice')).resolves.toEqual({
        kind: 'account',
        login: 'Alice',
      });
    });

    it('falls back to the environment identity when no stored login matches', async () => {
      readAccounts.mockResolvedValue({
        accounts: [{ identity: { kind: 'environment' }, active: true }],
      });

      await expect(identifyGitHubCliIdentity(GITHUB, 'alice')).resolves.toEqual({
        kind: 'environment',
      });
    });

    it('leaves the account unpinned when the CLI cannot be read', async () => {
      readAccounts.mockResolvedValue({ error: 'GH_FAILED', detail: 'keyring is locked' });

      await expect(identifyGitHubCliIdentity(GITHUB, 'alice')).resolves.toBeUndefined();
    });
  });
});
