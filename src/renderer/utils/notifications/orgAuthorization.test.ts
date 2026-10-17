import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import {
  clearOrganizationAuthorization,
  getOrganizationAuthorization,
  hasWithheldOrganizationAccess,
  reportBlockedOrganizations,
  reportOrganizationAuthorization,
} from './orgAuthorization';

describe('renderer/utils/notifications/orgAuthorization.ts', () => {
  beforeEach(() => {
    clearOrganizationAuthorization();
  });

  it('reports no signals before anything is reported', () => {
    expect(getOrganizationAuthorization(mockGitHubCloudAccount)).toEqual({
      condition: null,
      blockedOrganizations: new Map(),
      hasUnattributedBlock: false,
    });
    expect(hasWithheldOrganizationAccess(mockGitHubCloudAccount)).toBe(false);
  });

  it('reports and reads back a condition', () => {
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'partial-results',
      organizationIds: ['1', '2'],
    });

    expect(getOrganizationAuthorization(mockGitHubCloudAccount).condition).toEqual({
      kind: 'partial-results',
      organizationIds: ['1', '2'],
    });
    expect(hasWithheldOrganizationAccess(mockGitHubCloudAccount)).toBe(true);
  });

  it('replaces the condition on a later report', () => {
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'partial-results',
      organizationIds: ['1'],
    });
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'required',
      url: 'https://github.com/orgs/acme/sso',
    });

    expect(getOrganizationAuthorization(mockGitHubCloudAccount).condition).toEqual({
      kind: 'required',
      url: 'https://github.com/orgs/acme/sso',
    });
  });

  it('clears the condition when a later fetch reports none', () => {
    reportOrganizationAuthorization(mockGitHubCloudAccount, { kind: 'unknown', raw: 'x' });
    reportOrganizationAuthorization(mockGitHubCloudAccount, null);

    expect(getOrganizationAuthorization(mockGitHubCloudAccount).condition).toBeNull();
    expect(hasWithheldOrganizationAccess(mockGitHubCloudAccount)).toBe(false);
  });

  it('keeps accounts independent', () => {
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'partial-results',
      organizationIds: ['1'],
    });

    expect(getOrganizationAuthorization(mockGitHubEnterpriseServerAccount).condition).toBeNull();
    expect(getOrganizationAuthorization(mockGitHubCloudAccount).condition).not.toBeNull();
  });

  it('replaces observed blocks rather than accumulating them, keeping each reason', () => {
    reportBlockedOrganizations(mockGitHubCloudAccount, {
      organizations: new Map([
        ['acme', 'saml'],
        ['beta', 'app-restriction'],
      ]),
    });

    expect(getOrganizationAuthorization(mockGitHubCloudAccount).blockedOrganizations).toEqual(
      new Map([
        ['acme', 'saml'],
        ['beta', 'app-restriction'],
      ]),
    );

    reportBlockedOrganizations(mockGitHubCloudAccount, {
      organizations: new Map([['beta', 'app-restriction']]),
    });

    expect(getOrganizationAuthorization(mockGitHubCloudAccount).blockedOrganizations).toEqual(
      new Map([['beta', 'app-restriction']]),
    );
  });

  it('records an unattributed block without naming an organization', () => {
    reportBlockedOrganizations(mockGitHubCloudAccount, { hasUnattributed: true });

    const signals = getOrganizationAuthorization(mockGitHubCloudAccount);
    expect(signals.blockedOrganizations.size).toBe(0);
    expect(signals.hasUnattributedBlock).toBe(true);
    expect(hasWithheldOrganizationAccess(mockGitHubCloudAccount)).toBe(true);
  });

  it('clears all reported signals', () => {
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'partial-results',
      organizationIds: ['1'],
    });
    reportBlockedOrganizations(mockGitHubCloudAccount, {
      organizations: new Map([['acme', 'saml']]),
    });

    clearOrganizationAuthorization();

    expect(hasWithheldOrganizationAccess(mockGitHubCloudAccount)).toBe(false);
  });
});
