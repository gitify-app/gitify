import type { Account } from '../../types';

import { getAdapter } from '../forges/registry';

/**
 * Whether the account's forge supports a distinct "mark as done" action.
 *
 * Capability resolution is delegated to the forge adapter; for example, GitHub
 * Enterprise Server requires version 3.13 or newer, while Gitea has no
 * equivalent and always reports false.
 */
export function isMarkAsDoneFeatureSupported(account: Account): boolean {
  return getAdapter(account).capabilities.markAsDone(account);
}

/**
 * Whether the account's forge surfaces an "answered" discussion state during
 * notification enrichment.
 */
export function isAnsweredDiscussionFeatureSupported(
  account: Account,
): boolean {
  return getAdapter(account).capabilities.answeredDiscussion(account);
}

/**
 * Whether the account's forge supports ignoring a thread subscription.
 */
export function isUnsubscribeThreadSupported(account: Account): boolean {
  return getAdapter(account).capabilities.unsubscribeThread(account);
}
