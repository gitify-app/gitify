import type { Account } from '../../types';

/**
 * What GitHub reported about an account's organization-level authorization,
 * taken from the `X-GitHub-SSO` response header.
 *
 * The three cases are deliberately distinct:
 * - `partial-results`: a successful cross-organization listing whose body
 *   silently omitted the named organizations.
 * - `required`: the token is not authorized, optionally with the short-lived
 *   link that authorizes it.
 * - `unknown`: GitHub sent a directive this version does not understand. It is
 *   reported so it is never mistaken for "no condition".
 */
export type OrganizationAuthorizationCondition =
  | { kind: 'partial-results'; organizationIds: string[] }
  | { kind: 'required'; url: string | null }
  | { kind: 'unknown'; raw: string };

/** Why an organization blocked a request, as far as the response said. */
export type OrganizationBlockReason = 'saml' | 'app-restriction' | 'unknown';

/**
 * Everything Gitify currently knows about an account's organization access,
 * from response headers and from attributed API errors.
 */
export interface OrganizationAuthorizationSignals {
  /** The condition reported by the most recent fetch, or `null` when clean. */
  readonly condition: OrganizationAuthorizationCondition | null;
  /** Organizations observed blocking a request, keyed by login. */
  readonly blockedOrganizations: ReadonlyMap<string, OrganizationBlockReason>;
  /** Whether a block was observed that could not be attributed to an organization. */
  readonly hasUnattributedBlock: boolean;
}

interface AccountRecord {
  condition: OrganizationAuthorizationCondition | null;
  blockedOrganizations: Map<string, OrganizationBlockReason>;
  hasUnattributedBlock: boolean;
}

/**
 * Per-account organization-authorization signals.
 *
 * Like the server poll-interval registry, this is a leaf module: a fetch
 * reports what it saw and later readers (the notifications list and the
 * organizations view) read it back. It holds no React state and is replaced,
 * never merged, so resolving a condition clears it on the next fetch.
 *
 * The account key mirrors `getAccountUUID`'s identity fields but stays local so
 * this module does not import the auth/forge module graph (which would create an
 * import cycle back through the forge clients).
 */
const records = new Map<string, AccountRecord>();

const NO_SIGNALS: OrganizationAuthorizationSignals = {
  condition: null,
  blockedOrganizations: new Map<string, OrganizationBlockReason>(),
  hasUnattributedBlock: false,
};

function accountKey(account: Account): string {
  return `${account.hostname}-${account.user?.id}-${account.method}`;
}

function recordFor(account: Account): AccountRecord {
  const key = accountKey(account);
  let record = records.get(key);
  if (!record) {
    record = {
      condition: null,
      blockedOrganizations: new Map<string, OrganizationBlockReason>(),
      hasUnattributedBlock: false,
    };
    records.set(key, record);
  }
  return record;
}

/**
 * Replace the account's condition with what the latest fetch reported.
 * Passing `null` clears it, which is how a resolved condition disappears.
 */
export function reportOrganizationAuthorization(
  account: Account,
  condition: OrganizationAuthorizationCondition | null,
): void {
  recordFor(account).condition = condition;
}

/**
 * Replace the account's observed access blocks with those from the latest
 * enrichment pass, so an organization that stops blocking drops out.
 */
export function reportBlockedOrganizations(
  account: Account,
  blocks: {
    organizations?: ReadonlyMap<string, OrganizationBlockReason>;
    hasUnattributed?: boolean;
  },
): void {
  const record = recordFor(account);
  record.blockedOrganizations = new Map(blocks.organizations ?? []);
  record.hasUnattributedBlock = blocks.hasUnattributed ?? false;
}

/**
 * Read the account's current signals. Accounts with nothing reported return a
 * shared empty value.
 */
export function getOrganizationAuthorization(account: Account): OrganizationAuthorizationSignals {
  const record = records.get(accountKey(account));
  if (!record) {
    return NO_SIGNALS;
  }

  return {
    condition: record.condition,
    blockedOrganizations: record.blockedOrganizations,
    hasUnattributedBlock: record.hasUnattributedBlock,
  };
}

/**
 * Whether the account has any known reason to be missing notifications:
 * a reported condition or an attributed block.
 */
export function hasWithheldOrganizationAccess(account: Account): boolean {
  const signals = getOrganizationAuthorization(account);
  return (
    signals.condition !== null ||
    signals.blockedOrganizations.size > 0 ||
    signals.hasUnattributedBlock
  );
}

/**
 * Clear all reported signals. Intended for use in tests to keep the
 * module-level state from leaking across cases.
 */
export function clearOrganizationAuthorization(): void {
  records.clear();
}
