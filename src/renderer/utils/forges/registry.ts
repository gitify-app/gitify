import type { Account, Forge } from '../../types';
import type { ForgeAdapter } from './types';

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
};

/**
 * Resolve the adapter for a given account.
 *
 * Throws if the account's forge is not registered — this should be impossible
 * once `Account.forge` is required and migration has run, but we surface a
 * loud error rather than crashing on a property access.
 */
export function getAdapter(account: Account): ForgeAdapter {
  const adapter = ADAPTERS[account.forge];
  if (!adapter) {
    throw new Error(`No forge adapter registered for "${account.forge}"`);
  }
  return adapter;
}

export function getAdapterById(forge: Forge): ForgeAdapter {
  const adapter = ADAPTERS[forge];
  if (!adapter) {
    throw new Error(`No forge adapter registered for "${forge}"`);
  }
  return adapter;
}

export function listAdapters(): ForgeAdapter[] {
  return Object.values(ADAPTERS);
}
