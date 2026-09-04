import type { Account, Forge } from '../../types';
import type { ForgeAccountAdapter, ForgeAdapter, WithAccount } from './types';

import { bitbucketAdapter } from './bitbucket/adapter';
import { giteaAdapter } from './gitea/adapter';
import { githubAdapter } from './github/adapter';
import { gitlabAdapter } from './gitlab/adapter';

/**
 * Central forge adapter registry.
 *
 * Adding a new forge is one entry in this map. Shared code routes through
 * `getAdapter(forge)` for forge-wide members and `getAccountAdapter(account)` for
 * account-scoped operations, and never imports forge-specific modules
 * directly.
 */
const ADAPTERS: Record<Forge, ForgeAdapter> = {
  github: githubAdapter,
  gitea: giteaAdapter,
  bitbucket: bitbucketAdapter,
  gitlab: gitlabAdapter,
};

/** Single source of truth for the runtime set of registered forges. */
export const KNOWN_FORGES: ReadonlySet<Forge> = new Set(Object.keys(ADAPTERS) as Forge[]);

/** Type guard for unknown JSON values (e.g. persisted account state). */
export function isKnownForge(forge: unknown): forge is Forge {
  return typeof forge === 'string' && KNOWN_FORGES.has(forge as Forge);
}

/**
 * Resolve the adapter for an account or a forge id.
 *
 * Throws if the forge is not registered — should be impossible once
 * `Account.forge` is required and migration has run, but we surface a loud
 * error rather than crashing on a property access.
 */
export function getAdapter(forgeOrAccount: Forge | Account): ForgeAdapter {
  const id = typeof forgeOrAccount === 'string' ? forgeOrAccount : forgeOrAccount.forge;
  const adapter = ADAPTERS[id];
  if (!adapter) {
    throw new Error(`No forge adapter registered for "${id}"`);
  }
  return adapter;
}

/**
 * Resolve the account-bound view of an account's forge adapter.
 *
 * Every function under the adapter's `accountOps` is wrapped to receive the
 * account as its first argument, and nested bundles (capabilities, OAuth
 * scopes) are wrapped the same way. Members are looked up on the adapter at
 * call time, so replacing one on the adapter (e.g. a test spy) is honoured by
 * views created earlier.
 */
export function getAccountAdapter(account: Account): ForgeAccountAdapter {
  return bindAccount(getAdapter(account).accountOps, account);
}

function bindAccount<T extends object>(operations: WithAccount<T>, account: Account): T {
  const source = operations as Record<string, unknown>;
  const bound: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const member = source[key];
    if (typeof member === 'function') {
      bound[key] = (...args: unknown[]) =>
        (source[key] as (account: Account, ...rest: unknown[]) => unknown)(account, ...args);
    } else if (member !== null && typeof member === 'object') {
      bound[key] = bindAccount(member as WithAccount<object>, account);
    } else {
      bound[key] = member;
    }
  }
  return bound as T;
}

export function listAdapters(): ForgeAdapter[] {
  return Object.values(ADAPTERS);
}
