import { mockGitHubCloudAccount } from '../../__mocks__/account-mocks';

import type { Account } from '../../types';
import type { ForgeAccountAdapter, RefreshAccountData } from '../forges/types';

import * as logger from '../core/logger';
import { getAccountAdapter } from '../forges/registry';
import { refreshAccount } from './utils';

vi.mock('../forges/registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../forges/registry')>();

  return { ...actual, getAccountAdapter: vi.fn() };
});

vi.mock('../core/logger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../core/logger')>();

  return { ...actual, rendererLogError: vi.fn(), rendererLogWarn: vi.fn() };
});

const refreshed: RefreshAccountData = {
  user: {
    id: '42',
    login: 'refreshed-user',
    name: 'Refreshed User',
    avatar: 'https://avatars.example/refreshed-user.png',
  },
  version: '3.13.0',
  scopes: ['notifications', 'read:user'],
};

function mockAdapter(overrides: Partial<ForgeAccountAdapter> = {}) {
  const adapter = {
    fetchAuthenticatedUser: vi.fn().mockResolvedValue(refreshed),
    oauthScopes: { hasRequired: vi.fn(() => true) },
    ...overrides,
  } as unknown as ForgeAccountAdapter;

  vi.mocked(getAccountAdapter).mockReturnValue(adapter);

  return adapter;
}

describe('renderer/utils/auth/utils.ts', () => {
  beforeEach(() => {
    vi.mocked(getAccountAdapter).mockReset();
    vi.mocked(logger.rendererLogWarn).mockClear();
    vi.mocked(logger.rendererLogError).mockClear();
  });

  it('refreshes the account details in place', async () => {
    mockAdapter();
    const account = { ...mockGitHubCloudAccount } as Account;

    const result = await refreshAccount(account);

    expect(result).toBe(account);
    expect(account.user).toEqual({
      id: '42',
      login: 'refreshed-user',
      name: 'Refreshed User',
      avatar: 'https://avatars.example/refreshed-user.png',
    });
    expect(account.version).toBe('3.13.0');
    expect(account.scopes).toEqual(['notifications', 'read:user']);
    expect(logger.rendererLogWarn).not.toHaveBeenCalled();
    expect(logger.rendererLogError).not.toHaveBeenCalled();
  });

  it('warns when the refreshed account is missing required scopes', async () => {
    mockAdapter({
      oauthScopes: {
        externallyManaged: vi.fn(() => undefined),
        hasAlternate: vi.fn(() => false),
        hasRecommended: vi.fn(() => false),
        hasRequired: vi.fn(() => false),
      },
    });

    await refreshAccount({ ...mockGitHubCloudAccount } as Account);

    expect(logger.rendererLogWarn).toHaveBeenCalledWith(
      'refreshAccount',
      'account for user refreshed-user is missing required scopes',
    );
  });

  it('logs and rethrows when the refresh fails', async () => {
    const error = new Error('network failed');
    mockAdapter({
      fetchAuthenticatedUser: vi.fn().mockRejectedValue(error),
    });
    const account = { ...mockGitHubCloudAccount } as Account;

    await expect(refreshAccount(account)).rejects.toThrow('network failed');

    expect(logger.rendererLogError).toHaveBeenCalledWith(
      'refreshAccount',
      `failed to refresh account for user ${account.user?.login ?? account.hostname}`,
      error,
    );
    expect(account.user).toBe(mockGitHubCloudAccount.user);
  });
});
