import type { Account } from '../../../types';
import type {
  OrganizationAccessEntry,
  OrganizationAccessReport,
  OrganizationAccessState,
} from '../types';

import { getOrganizationAuthorization } from '../../notifications/orgAuthorization';
import {
  getOrganizationLoginById,
  listOrganizationMemberships,
  listReachableOrganizations,
  type OrganizationMembershipRecord,
} from './client';
import { organizationLoginFromSsoUrl } from './sso';

/**
 * Resolve an account's organizations and classify the access state of each.
 *
 * The picture is assembled from what GitHub will list: the memberships give the
 * organizations the user belongs to (with pending ones distinguished), the
 * reachable listing gives the ones the token can actually see, and the signal
 * registry adds what earlier responses reported — a withheld identifier, an
 * authorizing link naming an organization, or an observed block.
 *
 * A failed listing yields an undetermined result rather than a guess. An
 * organization Gitify cannot identify is still reported, without a name, so the
 * gap is visible instead of silently missing.
 */
export async function fetchOrganizationAccess(account: Account): Promise<OrganizationAccessReport> {
  const signals = getOrganizationAuthorization(account);

  let reachable: Awaited<ReturnType<typeof listReachableOrganizations>>;
  let memberships: OrganizationMembershipRecord[];

  try {
    [reachable, memberships] = await Promise.all([
      listReachableOrganizations(account),
      listOrganizationMemberships(account),
    ]);
  } catch {
    return { outcome: 'undetermined' };
  }

  const reachableLogins = new Set(reachable.logins);
  const namedByCondition = new Set<string>();

  if (signals.condition?.kind === 'required') {
    const login = organizationLoginFromSsoUrl(signals.condition.url);
    if (login) {
      namedByCondition.add(login);
    }
  }

  const named = new Map<string, OrganizationAccessState>();

  const classify = (login: string, state: 'active' | 'pending'): OrganizationAccessState => {
    if (state === 'pending') {
      return 'membership-pending';
    }

    const block = signals.blockedOrganizations.get(login);
    if (block === 'saml') {
      return 'authorization-required';
    }
    if (block === 'app-restriction' || block === 'unknown') {
      return 'app-access-blocked';
    }

    if (reachableLogins.has(login)) {
      return 'granted';
    }

    // An active membership the token cannot see is being withheld pending
    // authorization, whether or not the header named it.
    return 'authorization-required';
  };

  for (const membership of memberships) {
    named.set(membership.login, classify(membership.login, membership.state));
  }

  // The token can reach an organization with no listed membership (for example a
  // membership the token may not read); reaching it still means access.
  for (const login of reachableLogins) {
    if (!named.has(login)) {
      named.set(login, 'granted');
    }
  }

  for (const login of namedByCondition) {
    if (!named.has(login)) {
      named.set(login, 'authorization-required');
    }
  }

  const unnamed: OrganizationAccessEntry[] = [];

  for (const identifier of reachable.withheldOrganizationIds) {
    const login = await getOrganizationLoginById(account, identifier);

    if (login) {
      if (!named.has(login)) {
        named.set(login, 'authorization-required');
      }
    } else {
      unnamed.push({ login: null, state: 'unknown' });
    }
  }

  if (signals.hasUnattributedBlock) {
    unnamed.push({ login: null, state: 'app-access-blocked' });
  }

  const organizations: OrganizationAccessEntry[] = [...named.entries()]
    .map(([login, state]) => ({ login, state }))
    .sort((a, b) => (a.login ?? '').localeCompare(b.login ?? ''));

  return { outcome: 'determined', organizations: [...organizations, ...unnamed] };
}
