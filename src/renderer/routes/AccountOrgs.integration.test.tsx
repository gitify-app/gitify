import { act, screen } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { GroupBy, type Account } from '../types';

import { getAccountUUID } from '../utils/auth/utils';
import { getAdapter } from '../utils/forges/registry';
import { type BuildItemsContext, buildAccountItems } from '../utils/notifications/listItems';
import {
  clearOrganizationAuthorization,
  hasWithheldOrganizationAccess,
  reportOrganizationAuthorization,
} from '../utils/notifications/orgAuthorization';
import { AccountOrgsRoute } from './AccountOrgs';

let mockLocationAccount: Account = mockGitHubCloudAccount;

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLocation: () => ({ state: { account: mockLocationAccount } }),
  };
});

const orgAuthorization = getAdapter('github').accountOps.orgAuthorization!;

/**
 * Mirrors how the notification list derives the set of accounts whose empty
 * state should explain withheld access, so this test exercises the real
 * registry-to-list linkage rather than a hand-built set.
 */
function itemsFor(account: Account) {
  const context: BuildItemsContext = {
    showAccountHeader: false,
    hasMultipleAccounts: false,
    collapsedAccounts: new Set<string>(),
    collapsedRepositories: new Set<string>(),
    animatingNotifications: new Set<string>(),
    animatingRepositories: new Map<string, ReadonlySet<string>>(),
    withheldOrganizationAccountUUIDs: hasWithheldOrganizationAccess(account)
      ? new Set([getAccountUUID(account)])
      : new Set<string>(),
    groupBy: GroupBy.DATE,
  };

  return buildAccountItems({ account, notifications: [], error: null }, context);
}

describe('organization authorization, end to end', () => {
  beforeEach(() => {
    clearOrganizationAuthorization();
    vi.restoreAllMocks();
  });

  it('ties a reported condition to the empty inbox notice, the organization list, and its clearing', async () => {
    const account = mockGitHubCloudAccount;

    // A notifications poll reports that organizations were withheld.
    reportOrganizationAuthorization(account, {
      kind: 'partial-results',
      organizationIds: ['1'],
    });

    expect(itemsFor(account)).toEqual([
      { key: `all-read-${getAccountUUID(account)}`, kind: 'all-read', mayBeWithheld: true },
    ]);

    // The organizations view lists the organization, without needing the poll.
    vi.spyOn(orgAuthorization, 'fetchOrganizationAccess').mockResolvedValue({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'authorization-required' }],
    });

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(await screen.findByText('acme')).toBeInTheDocument();
    expect(screen.getByTestId('account-orgs-state-authorization-required')).toBeInTheDocument();

    // Authorizing externally and polling again clears the condition.
    reportOrganizationAuthorization(account, null);

    expect(itemsFor(account)).toEqual([
      { key: `all-read-${getAccountUUID(account)}`, kind: 'all-read', mayBeWithheld: false },
    ]);
  });
});
