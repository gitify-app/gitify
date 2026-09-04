import type { Account } from '../../types';

import { getAccountAdapter } from '../forges/registry';

/**
 * Whether the account's forge supports a distinct "mark as done" action.
 *
 * Capability resolution is delegated to the forge adapter; for example, GitHub
 * Enterprise Server requires version 3.13 or newer, while Gitea has no
 * equivalent and always reports false.
 */
export function isMarkAsDoneFeatureSupported(account: Account): boolean {
  return getAccountAdapter(account).capabilities.markAsDone();
}

/**
 * Whether the account's forge supports ignoring a thread subscription.
 */
export function isUnsubscribeThreadSupported(account: Account): boolean {
  return getAccountAdapter(account).capabilities.unsubscribeThread();
}
