import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import type { Account } from '../types';

import { getAdapter } from '../utils/forges/registry';
import {
  clearOrganizationAuthorization,
  reportOrganizationAuthorization,
} from '../utils/notifications/orgAuthorization';
import * as links from '../utils/system/links';
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

describe('renderer/routes/AccountOrgs.tsx', () => {
  beforeEach(() => {
    clearOrganizationAuthorization();
    vi.restoreAllMocks();

    vi.spyOn(orgAuthorization, 'fetchOrganizationAccess').mockResolvedValue({
      outcome: 'determined',
      organizations: [],
    });
  });

  it('should render itself and fetch for the selected account only', async () => {
    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(screen.getByTestId('account-orgs')).toBeInTheDocument();
    await screen.findByTestId('account-orgs-none');

    expect(orgAuthorization.fetchOrganizationAccess).toHaveBeenCalledTimes(1);
    expect(orgAuthorization.fetchOrganizationAccess).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('should show a row per organization with its state', async () => {
    vi.mocked(orgAuthorization.fetchOrganizationAccess).mockResolvedValue({
      outcome: 'determined',
      organizations: [
        { login: 'acme', state: 'granted' },
        { login: 'beta', state: 'authorization-required' },
        { login: 'gamma', state: 'membership-pending' },
        { login: 'delta', state: 'app-access-blocked' },
      ],
    });

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(await screen.findAllByTestId('account-orgs-organization')).toHaveLength(4);
    expect(screen.getByTestId('account-orgs-state-granted')).toBeInTheDocument();
    expect(screen.getByTestId('account-orgs-state-authorization-required')).toBeInTheDocument();
    expect(screen.getByTestId('account-orgs-state-membership-pending')).toBeInTheDocument();
    expect(screen.getByTestId('account-orgs-state-app-access-blocked')).toBeInTheDocument();
  });

  it('should show an unnamed row rather than omitting an unknown organization', async () => {
    vi.mocked(orgAuthorization.fetchOrganizationAccess).mockResolvedValue({
      outcome: 'determined',
      organizations: [{ login: null, state: 'unknown' }],
    });

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(await screen.findByText('Unknown organization')).toBeInTheDocument();
    expect(screen.getByTestId('account-orgs-state-unknown')).toBeInTheDocument();
  });

  it('should report an undetermined result and retry on request', async () => {
    vi.mocked(orgAuthorization.fetchOrganizationAccess).mockRejectedValue(new Error('Forbidden'));

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(await screen.findByTestId('account-orgs-undetermined')).toBeInTheDocument();
    expect(screen.queryAllByTestId('account-orgs-organization')).toHaveLength(0);

    vi.mocked(orgAuthorization.fetchOrganizationAccess).mockResolvedValue({
      outcome: 'determined',
      organizations: [{ login: 'acme', state: 'granted' }],
    });

    await userEvent.click(screen.getByTestId('account-orgs-retry'));

    expect(await screen.findByTestId('account-orgs-organization')).toBeInTheDocument();
    expect(screen.queryByTestId('account-orgs-undetermined')).not.toBeInTheDocument();
  });

  it('should offer the authorizing action only for the current condition link', async () => {
    const openAuthorizationSpy = vi
      .spyOn(links, 'openOrganizationAuthorization')
      .mockImplementation(vi.fn());

    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'required',
      url: 'https://github.com/orgs/acme/sso?authorization_request=abc',
    });

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    await userEvent.click(await screen.findByTestId('account-orgs-authorize'));

    expect(openAuthorizationSpy).toHaveBeenCalledWith(
      'https://github.com/orgs/acme/sso?authorization_request=abc',
    );
  });

  it('should not reuse an older link once the current condition carries none', async () => {
    vi.spyOn(links, 'openOrganizationAuthorization').mockImplementation(vi.fn());
    vi.spyOn(links, 'openAccountSettings').mockImplementation(vi.fn());

    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'required',
      url: 'https://github.com/orgs/acme/sso?authorization_request=abc',
    });
    reportOrganizationAuthorization(mockGitHubCloudAccount, {
      kind: 'partial-results',
      organizationIds: ['1'],
    });

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(await screen.findByTestId('account-orgs-manage-link')).toBeInTheDocument();
    expect(screen.queryByTestId('account-orgs-authorize')).not.toBeInTheDocument();
  });

  it('should offer developer settings guidance when no link is available', async () => {
    const settingsSpy = vi.spyOn(links, 'openAccountSettings').mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    await userEvent.click(await screen.findByTestId('account-orgs-manage-link'));

    expect(settingsSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('should state plainly when every organization is reachable', async () => {
    vi.mocked(orgAuthorization.fetchOrganizationAccess).mockResolvedValue({
      outcome: 'determined',
      organizations: [
        { login: 'acme', state: 'granted' },
        { login: 'beta', state: 'granted' },
      ],
    });

    await act(async () => {
      renderWithProviders(<AccountOrgsRoute />);
    });

    expect(await screen.findByTestId('account-orgs-complete')).toBeInTheDocument();
  });
});
