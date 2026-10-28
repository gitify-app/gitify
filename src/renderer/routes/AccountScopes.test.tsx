import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../__helpers__/test-utils';
import {
  mockGitifyOAuthAppAccount,
  mockGitHubCliAccount,
  mockCustomOAuthAppAccount,
  mockPersonalAccessTokenAccount,
} from '../__mocks__/account-mocks';

import type { Account } from '../types';

import * as links from '../utils/system/links';
import { AccountScopesRoute } from './AccountScopes';

const navigateMock = vi.fn();

// Mutable variable — individual tests reassign this before rendering to simulate
// different account states without needing vi.doMock.
let mockLocationAccount: Account = {
  ...mockGitifyOAuthAppAccount,
  scopes: ['read:user', 'notifications', 'repo'],
};

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ state: { account: mockLocationAccount } }),
  };
});

describe('renderer/routes/AccountScopes.tsx', () => {
  beforeEach(() => {
    mockLocationAccount = {
      ...mockGitifyOAuthAppAccount,
      scopes: ['read:user', 'notifications', 'repo'],
    };
  });

  it('renders itself & its children', async () => {
    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    expect(screen.getByTestId('account-scopes')).toBeInTheDocument();
  });

  it('shows all-granted status when account has all recommended scopes', async () => {
    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    // notifications + read:user (required) + repo (detailed) = 3 granted; public_repo = N/A (covered by repo)
    expect(screen.getAllByTestId('account-scopes-scope-granted')).toHaveLength(3);
    expect(screen.queryAllByTestId('account-scopes-scope-missing')).toHaveLength(0);
    expect(screen.getAllByTestId('account-scopes-scope-na')).toHaveLength(1);
  });

  it('shows required-scope row with granted/missing indicators', async () => {
    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    const rows = screen.getAllByTestId('account-scopes-required-scope');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('notifications');
    expect(rows[1]).toHaveTextContent('read:user');
  });

  it('explains scopes another tool owns instead of listing rows the user cannot grant', async () => {
    mockLocationAccount = mockGitHubCliAccount;

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    expect(screen.getByTestId('account-scopes-managed-elsewhere')).toHaveTextContent(
      'gh auth refresh -s notifications',
    );
    expect(screen.queryAllByTestId('account-scopes-required-scope')).toHaveLength(0);
  });

  it('shows Detailed Notifications section with repo and public_repo rows', async () => {
    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    expect(screen.getByText('Detailed Notifications')).toBeInTheDocument();
    expect(screen.getByTestId('account-scopes-repo-scope')).toBeInTheDocument();
    expect(screen.getByTestId('account-scopes-repo-scope')).toHaveTextContent('repo');
    expect(screen.getByTestId('account-scopes-public-repo-scope')).toBeInTheDocument();
    expect(screen.getByTestId('account-scopes-public-repo-scope')).toHaveTextContent('public_repo');
  });

  it('shows all-granted status when account has public_repo instead of repo', async () => {
    mockLocationAccount = {
      ...mockGitifyOAuthAppAccount,
      scopes: ['read:user', 'notifications', 'public_repo'],
    };

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    // notifications + read:user (required) + public_repo (detailed) = 3 granted; repo = 1 missing
    expect(screen.getAllByTestId('account-scopes-scope-granted')).toHaveLength(3);
    expect(screen.getAllByTestId('account-scopes-scope-missing')).toHaveLength(1);
  });

  it('shows missing indicator when neither repo nor public_repo is granted', async () => {
    mockLocationAccount = {
      ...mockGitifyOAuthAppAccount,
      scopes: ['read:user', 'notifications'],
    };

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    // Both repo rows show missing
    expect(screen.getAllByTestId('account-scopes-scope-missing')).toHaveLength(2);
    expect(screen.getByTestId('account-scopes-repo-scope')).toBeInTheDocument();
    expect(screen.getByTestId('account-scopes-public-repo-scope')).toBeInTheDocument();
  });

  it('shows missing indicator when notifications scope is absent', async () => {
    mockLocationAccount = {
      ...mockGitifyOAuthAppAccount,
      scopes: ['read:user', 'repo'],
    };

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    // Required scope (notifications) is missing
    expect(screen.queryAllByTestId('account-scopes-scope-missing').length).toBeGreaterThan(0);
  });

  it('shows extra scopes when token has additional permissions', async () => {
    mockLocationAccount = {
      ...mockGitifyOAuthAppAccount,
      scopes: ['read:user', 'notifications', 'repo', 'write:packages', 'read:org'],
    };

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    expect(screen.getByTestId('account-scopes-extra-scopes')).toBeInTheDocument();
    expect(screen.getByText('write:packages')).toBeInTheDocument();
    expect(screen.getByText('read:org')).toBeInTheDocument();
  });

  it('shows no-scopes message when scopes are not loaded', async () => {
    mockLocationAccount = { ...mockGitifyOAuthAppAccount, scopes: undefined };

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    expect(screen.getByTestId('account-scopes-no-scopes')).toBeInTheDocument();
  });

  it('opens account settings when manage link is clicked', async () => {
    const openAccountSettingsSpy = vi
      .spyOn(links, 'openAccountSettings')
      .mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Developer settings' }));

    expect(openAccountSettingsSpy).toHaveBeenCalledTimes(1);
  });

  it('goes back when pressing the back icon', async () => {
    await act(async () => {
      renderWithProviders(<AccountScopesRoute />);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  describe('all auth methods show permissions button', () => {
    it.each([
      ['Gitify OAuth App', mockGitifyOAuthAppAccount],
      ['Custom OAuth App', mockCustomOAuthAppAccount],
      ['Personal Access Token', mockPersonalAccessTokenAccount],
    ])('%s account has a permissions button', async (_method, account) => {
      mockLocationAccount = {
        ...account,
        scopes: ['read:user', 'notifications', 'repo'],
      };

      await act(async () => {
        renderWithProviders(<AccountScopesRoute />);
      });

      expect(screen.getByTestId('account-scopes')).toBeInTheDocument();
    });
  });
});
