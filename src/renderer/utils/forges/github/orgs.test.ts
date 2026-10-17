import { mockGitHubCloudAccount } from '../../../__mocks__/account-mocks';

import {
  clearOrganizationAuthorization,
  reportBlockedOrganizations,
  reportOrganizationAuthorization,
} from '../../notifications/orgAuthorization';
import * as client from './client';
import { fetchOrganizationAccess } from './orgs';

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof import('./client')>('./client');
  return {
    ...actual,
    getOrganizationLoginById: vi.fn(),
    listOrganizationMemberships: vi.fn(),
    listReachableOrganizations: vi.fn(),
  };
});

describe('renderer/utils/forges/github/orgs.ts', () => {
  beforeEach(() => {
    clearOrganizationAuthorization();

    vi.mocked(client.listReachableOrganizations).mockReset();
    vi.mocked(client.listOrganizationMemberships).mockReset();
    vi.mocked(client.getOrganizationLoginById).mockReset();

    vi.mocked(client.listReachableOrganizations).mockResolvedValue({
      logins: [],
      withheldOrganizationIds: [],
    });
    vi.mocked(client.listOrganizationMemberships).mockResolvedValue([]);
    vi.mocked(client.getOrganizationLoginById).mockResolvedValue(null);
  });

  it('classifies a reachable active membership as granted', async () => {
    vi.mocked(client.listReachableOrganizations).mockResolvedValue({
      logins: ['acme'],
      withheldOrganizationIds: [],
    });
    vi.mocked(client.listOrganizationMemberships).mockResolvedValue([
      { login: 'acme', state: 'active' },
    ]);

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'granted' }],
    });
  });

  it('classifies an active membership the token cannot reach as authorization required', async () => {
    vi.mocked(client.listOrganizationMemberships).mockResolvedValue([
      { login: 'acme', state: 'active' },
    ]);

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'authorization-required' }],
    });
  });

  it('classifies a pending membership as membership pending', async () => {
    vi.mocked(client.listOrganizationMemberships).mockResolvedValue([
      { login: 'acme', state: 'pending' },
    ]);

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'membership-pending' }],
    });
  });

  it('classifies an observed SAML block as authorization required, ahead of reachability', async () => {
    vi.mocked(client.listReachableOrganizations).mockResolvedValue({
      logins: ['acme'],
      withheldOrganizationIds: [],
    });
    vi.mocked(client.listOrganizationMemberships).mockResolvedValue([
      { login: 'acme', state: 'active' },
    ]);
    reportBlockedOrganizations(mockGitHubCloudAccount, {
      organizations: new Map([['acme', 'saml']]),
    });

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'authorization-required' }],
    });
  });

  it('classifies an observed app-access block as app access blocked', async () => {
    vi.mocked(client.listReachableOrganizations).mockResolvedValue({
      logins: ['acme'],
      withheldOrganizationIds: [],
    });
    vi.mocked(client.listOrganizationMemberships).mockResolvedValue([
      { login: 'acme', state: 'active' },
    ]);
    reportBlockedOrganizations(mockGitHubCloudAccount, {
      organizations: new Map([['acme', 'app-restriction']]),
    });

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'app-access-blocked' }],
    });
  });

  it('resolves a withheld identifier to a login', async () => {
    vi.mocked(client.listReachableOrganizations).mockResolvedValue({
      logins: [],
      withheldOrganizationIds: ['21955855'],
    });
    vi.mocked(client.getOrganizationLoginById).mockResolvedValue('acme');

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'authorization-required' }],
    });
  });

  it('reports a withheld identifier it cannot resolve without a name', async () => {
    vi.mocked(client.listReachableOrganizations).mockResolvedValue({
      logins: [],
      withheldOrganizationIds: ['99999999'],
    });

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: null, state: 'unknown' }],
    });
  });

  it('reports an unattributed block without naming an organization', async () => {
    reportBlockedOrganizations(mockGitHubCloudAccount, { hasUnattributed: true });

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: null, state: 'app-access-blocked' }],
    });
  });

  it('names an organization from an organization-scoped authorizing link', async () => {
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'required',
      url: 'https://github.com/orgs/acme/sso?authorization_request=abc',
    });

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'authorization-required' }],
    });
  });

  it('returns undetermined when a listing fails', async () => {
    vi.mocked(client.listOrganizationMemberships).mockRejectedValue(new Error('Forbidden'));

    await expect(fetchOrganizationAccess(mockGitHubCloudAccount)).resolves.toEqual({
      outcome: 'undetermined',
    });
  });
});
