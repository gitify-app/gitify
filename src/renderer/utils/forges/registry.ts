import type { Account, Forge } from '../../types';
import type { ForgeAdapter } from './types';

import { bitbucketAdapter } from './bitbucket/adapter';
import { giteaAdapter } from './gitea/adapter';
import { githubAdapter } from './github/adapter';

/**
 * Central forge adapter registry.
 *
 * Adding a new forge is one entry in this map. Shared code routes through
 * `getAdapter(account)` and never imports forge-specific modules directly.
 */
const ADAPTERS: Record<Forge, ForgeAdapter> = {
  github: githubAdapter,
  gitea: giteaAdapter,
  bitbucket: bitbucketAdapter,
};

/** Single source of truth for the runtime set of registered forges. */
export const KNOWN_FORGES: ReadonlySet<Forge> = new Set(
  Object.keys(ADAPTERS) as Forge[],
);

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
  const id =
    typeof forgeOrAccount === 'string' ? forgeOrAccount : forgeOrAccount.forge;
  const adapter = ADAPTERS[id];
  if (!adapter) {
    throw new Error(`No forge adapter registered for "${id}"`);
  }
  return adapter;
}

export function listAdapters(): ForgeAdapter[] {
  return Object.values(ADAPTERS);
}
