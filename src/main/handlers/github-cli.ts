import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { delimiter } from 'node:path';
import { promisify } from 'node:util';

import type { GitHubCliTokenError, IGitHubCliTokenResult } from '../../shared/events';
import { EVENTS } from '../../shared/events';
import { logError, toError } from '../../shared/logger';
import { isWindows } from '../../shared/platform';

import { handleMainEvent } from '../events';

const execFileAsync = promisify(execFile);

/**
 * A GUI-launched app inherits the session launcher's minimal PATH, which omits
 * the package-manager prefixes `gh` is usually installed under. Unix-only: the
 * Windows installer puts `gh` on the inherited PATH itself.
 */
const EXTRA_PATH_ENTRIES = isWindows()
  ? []
  : [
      '/opt/homebrew/bin',
      '/usr/local/bin',
      '/home/linuxbrew/.linuxbrew/bin',
      `${homedir()}/.local/bin`,
    ];

const HOSTNAME_PATTERN = /^[a-z0-9][a-z0-9.-]*$/i;

/**
 * Ask the locally installed GitHub CLI for the token it holds for `hostname`.
 *
 * Whatever the CLI resolves is what Gitify uses, including a token it takes
 * from `GH_TOKEN`/`GH_ENTERPRISE_TOKEN`: for some users that environment token
 * is the only credential `gh` has.
 *
 * @param hostname - Host to read the token for (e.g. `github.com`).
 * @returns The token, or the reason the CLI could not supply one.
 */
export async function readGitHubCliToken(hostname: string): Promise<IGitHubCliTokenResult> {
  if (typeof hostname !== 'string' || !HOSTNAME_PATTERN.test(hostname)) {
    return { error: 'GH_FAILED' };
  }

  const env: NodeJS.ProcessEnv = { ...process.env, PATH: buildPath() };

  try {
    const { stdout } = await execFileAsync('gh', ['auth', 'token', '--hostname', hostname], {
      env,
      timeout: 10_000,
    });

    const token = stdout.trim();

    return token ? { token } : { error: 'GH_NOT_AUTHENTICATED' };
  } catch (err) {
    const { error, detail } = classifyFailure(err);

    if (error === 'GH_FAILED') {
      logError('main:github-cli-token', `Failed to read gh token for ${hostname}`, toError(err));
    }

    return { error, detail };
  }
}

/**
 * An empty PATH element means "the current directory" to `execvp`, so an unset
 * PATH must not leave one behind.
 */
function buildPath(): string {
  return [process.env.PATH, ...EXTRA_PATH_ENTRIES].filter(Boolean).join(delimiter);
}

function classifyFailure(err: unknown): {
  error: GitHubCliTokenError;
  detail?: string;
} {
  const { code, killed, stderr } = err as {
    code?: string | number;
    killed?: boolean;
    stderr?: string;
  };

  if (code === 'ENOENT') {
    return { error: 'GH_NOT_FOUND' };
  }

  if (killed) {
    return { error: 'GH_TIMED_OUT' };
  }

  if (/no oauth token found|not logged in/i.test(stderr ?? '')) {
    return { error: 'GH_NOT_AUTHENTICATED' };
  }

  return { error: 'GH_FAILED', detail: stderr?.trim().split('\n')[0] || undefined };
}

/**
 * Register the IPC handler that resolves GitHub CLI tokens. Spawning is only
 * possible from the main process, so the renderer asks for the token per host.
 */
export function registerGitHubCliHandlers(): void {
  handleMainEvent(EVENTS.GITHUB_CLI_TOKEN, (_, hostname) => readGitHubCliToken(hostname));
}
