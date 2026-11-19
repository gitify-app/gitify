import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { delimiter } from 'node:path';
import { promisify } from 'node:util';

import type {
  GitHubCliAccountsError,
  GitHubCliIdentity,
  GitHubCliTokenError,
  IGitHubCliAccount,
  IGitHubCliAccountsResult,
  IGitHubCliTokenRequest,
  IGitHubCliTokenResult,
} from '../../shared/events';
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

/** GitHub logins are alphanumeric plus hyphens, up to 39 characters. */
const LOGIN_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;

/**
 * Credential sources `gh` reports for a token it reads from the environment
 * rather than from its credential store.
 */
const ENVIRONMENT_TOKEN_SOURCES = new Set([
  'GH_TOKEN',
  'GITHUB_TOKEN',
  'GH_ENTERPRISE_TOKEN',
  'GITHUB_ENTERPRISE_TOKEN',
]);

/** The subset of `gh auth status --json hosts` this handler relies on. */
interface IRawCliAccount {
  login?: string;
  active?: boolean;
  state?: string;
  tokenSource?: string;
}

interface IRawCliHosts {
  hosts?: Record<string, IRawCliAccount[]>;
}

function buildEnv(): NodeJS.ProcessEnv {
  return { ...process.env, PATH: buildPath() };
}

/**
 * List the identities the locally installed GitHub CLI holds for `hostname`.
 *
 * A stored account is identified by its login; a credential supplied through
 * the CLI's environment is reported as the separate `environment` identity.
 * Identities the CLI reports as unusable are omitted, and an empty list is a
 * normal answer rather than a failure.
 *
 * @param hostname - Host to list identities for (e.g. `github.com`).
 * @returns The usable identities, or a classified failure with an optional detail line.
 */
export async function listGitHubCliAccounts(hostname: string): Promise<IGitHubCliAccountsResult> {
  if (!isValidHostname(hostname)) {
    return { error: 'GH_FAILED' };
  }

  try {
    const { stdout } = await execFileAsync(
      'gh',
      ['auth', 'status', '--hostname', hostname, '--json', 'hosts'],
      { env: buildEnv(), timeout: 10_000 },
    );

    return { accounts: parseCliAccounts(stdout) };
  } catch (err) {
    const { error, detail } = classifyAccountsFailure(err);

    if (error === 'GH_FAILED') {
      logError(
        'main:github-cli-accounts',
        `Failed to list gh accounts for ${hostname}`,
        toError(err),
      );
    }

    return { error, detail };
  }
}

function isValidHostname(hostname: string): boolean {
  return typeof hostname === 'string' && HOSTNAME_PATTERN.test(hostname);
}

function parseCliAccounts(stdout: string): IGitHubCliAccount[] {
  const parsed = JSON.parse(stdout) as IRawCliHosts;
  const entries = Object.values(parsed.hosts ?? {}).flat();
  const accounts: IGitHubCliAccount[] = [];
  let environmentReported = false;

  for (const entry of entries) {
    if (entry.state !== 'success') {
      continue;
    }

    if (isEnvironmentIdentity(entry)) {
      if (!environmentReported) {
        accounts.push({ identity: { kind: 'environment' }, active: entry.active === true });
        environmentReported = true;
      }
      continue;
    }

    if (!entry.login || !LOGIN_PATTERN.test(entry.login)) {
      continue;
    }

    accounts.push({
      identity: { kind: 'account', login: entry.login },
      active: entry.active === true,
    });
  }

  return accounts;
}

function isEnvironmentIdentity(entry: IRawCliAccount): boolean {
  return (
    !entry.login &&
    typeof entry.tokenSource === 'string' &&
    ENVIRONMENT_TOKEN_SOURCES.has(entry.tokenSource)
  );
}

function classifyAccountsFailure(err: unknown): {
  error: GitHubCliAccountsError;
  detail?: string;
} {
  const { code, killed, stderr } = err as {
    code?: string | number;
    killed?: boolean;
    stderr?: string;
  };
  const text = stderr ?? '';

  if (code === 'ENOENT') {
    return { error: 'GH_NOT_FOUND' };
  }

  if (killed) {
    return { error: 'GH_TIMED_OUT' };
  }

  if (/unknown flag|unknown shorthand flag|flag provided but not defined/i.test(text)) {
    return { error: 'GH_ACCOUNTS_UNSUPPORTED' };
  }

  if (/no oauth token found|not logged in/i.test(text)) {
    return { error: 'GH_NOT_AUTHENTICATED' };
  }

  return { error: 'GH_FAILED', detail: text.trim().split('\n')[0] || undefined };
}

/**
 * Ask the locally installed GitHub CLI for the credential it holds for
 * `hostname`. A named account is resolved with `--user`, which reads that
 * account's token without changing which account the CLI treats as active; an
 * environment identity is resolved without it, and fails closed when the
 * environment token has gone away rather than falling back to an active account.
 *
 * @param request - Host to read a token for, and the identity to address.
 * @returns The CLI token, or a classified failure with an optional detail line.
 */
export async function readGitHubCliToken(
  request: IGitHubCliTokenRequest,
): Promise<IGitHubCliTokenResult> {
  if (typeof request !== 'object' || request === null) {
    return { error: 'GH_FAILED' };
  }

  const { hostname, identity } = request;

  if (!isValidHostname(hostname) || !isValidIdentity(identity)) {
    return { error: 'GH_FAILED' };
  }

  const env = buildEnv();

  if (identity?.kind === 'environment' && !hasEnvironmentToken(env)) {
    return { error: 'GH_NOT_AUTHENTICATED' };
  }

  const args = ['auth', 'token', '--hostname', hostname];

  if (identity?.kind === 'account') {
    args.push('--user', identity.login);
  }

  try {
    const { stdout } = await execFileAsync('gh', args, {
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

function isValidIdentity(identity: GitHubCliIdentity | undefined): boolean {
  if (identity === undefined) {
    return true;
  }

  if (typeof identity !== 'object' || identity === null) {
    return false;
  }

  if (identity.kind === 'environment') {
    return true;
  }

  return (
    identity.kind === 'account' &&
    typeof identity.login === 'string' &&
    LOGIN_PATTERN.test(identity.login)
  );
}

function hasEnvironmentToken(env: NodeJS.ProcessEnv): boolean {
  return [...ENVIRONMENT_TOKEN_SOURCES].some((source) => Boolean(env[source]));
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
  handleMainEvent(EVENTS.GITHUB_CLI_TOKEN, (_, request) => readGitHubCliToken(request));
  handleMainEvent(EVENTS.GITHUB_CLI_ACCOUNTS, (_, hostname) => listGitHubCliAccounts(hostname));
}
