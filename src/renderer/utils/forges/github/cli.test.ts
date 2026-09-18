import type { Hostname } from '../../../types';

import * as comms from '../../system/comms';
import { forgetGitHubCliToken, resolveGitHubCliToken } from './cli';

const GITHUB = 'github.com' as Hostname;
const ENTERPRISE = 'github.example.com' as Hostname;

describe('renderer/utils/forges/github/cli.ts', () => {
  const readToken = vi.spyOn(comms, 'readGitHubCliToken');

  beforeEach(() => {
    forgetGitHubCliToken(GITHUB);
    forgetGitHubCliToken(ENTERPRISE);
    readToken.mockReset();
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

  it('resolves each host against its own CLI entry', async () => {
    readToken.mockImplementation(async (hostname) =>
      hostname === GITHUB ? { token: 'gho_cloud' } : { token: 'gho_enterprise' },
    );

    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_cloud');
    await expect(resolveGitHubCliToken(ENTERPRISE)).resolves.toBe('gho_enterprise');
  });

  it('does not cache a failed read', async () => {
    readToken.mockResolvedValueOnce({ error: 'GH_FAILED' });
    readToken.mockResolvedValueOnce({ token: 'gho_token' });

    await expect(resolveGitHubCliToken(GITHUB)).rejects.toThrow();
    await expect(resolveGitHubCliToken(GITHUB)).resolves.toBe('gho_token');
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
});
