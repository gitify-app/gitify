import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { setNotificationsOverrides } from '../__helpers__/hook-mocks';
import {
  mockBitbucketAccount,
  mockGitHubCliAccount,
  mockGitHubCloudAccount,
} from '../__mocks__/account-mocks';

import { Constants } from '../constants';

import { useAccountsStore } from '../stores';

import type { ClientID, Token } from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import { notificationsKeys } from '../utils/api/queryKeys';
import { getAdapter } from '../utils/forges/registry';
import { useLogins } from './useLogins';

// Exercise the real hook implementation (globally mocked in vitest.setup)
vi.unmock('./useLogins');

const renderLoginsHook = (
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }),
) =>
  renderHook(() => useLogins(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

describe('renderer/hooks/useLogins.ts', () => {
  const removeAccountNotificationsMock = vi.fn();
  let createAccountSpy: ReturnType<typeof vi.spyOn>;
  let removeAccountSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    removeAccountNotificationsMock.mockReset();
    setNotificationsOverrides({ removeAccountNotifications: removeAccountNotificationsMock });

    createAccountSpy = vi
      .spyOn(useAccountsStore.getState(), 'createAccount')
      .mockResolvedValue(undefined);
    createAccountSpy.mockClear();
    removeAccountSpy = vi.spyOn(useAccountsStore.getState(), 'removeAccount');
    removeAccountSpy.mockClear();
  });

  it.each<{ name: string; login: (logins: ReturnType<typeof useLogins>) => Promise<void> }>([
    {
      name: 'GitHub CLI',
      login: (logins) => logins.loginWithCli('github', Constants.GITHUB_HOSTNAME),
    },
    {
      name: 'OAuth device flow',
      login: (logins) =>
        logins.loginWithDeviceFlowComplete('github', 'token' as Token, Constants.GITHUB_HOSTNAME),
    },
    {
      name: 'personal access token',
      login: (logins) =>
        logins.loginWithPersonalAccessToken({
          forge: 'github',
          hostname: Constants.GITHUB_HOSTNAME,
          token: 'token' as Token,
        }),
    },
  ])(
    'completes $name login after saving the account without waiting for notifications',
    async ({ login }) => {
      const saved = Promise.withResolvers<void>();
      const refreshed = Promise.withResolvers<void>();
      const queryClient = new QueryClient();
      const invalidate = vi
        .spyOn(queryClient, 'invalidateQueries')
        .mockReturnValue(refreshed.promise);
      createAccountSpy.mockReturnValue(saved.promise);
      const github = getAdapter('github');
      vi.spyOn(github.cliAuth!, 'resolveToken').mockResolvedValue('token' as Token);
      vi.spyOn(github.accountOps, 'fetchAuthenticatedUser').mockResolvedValue({
        user: { ...mockGitHubCloudAccount.user!, avatar: mockGitHubCloudAccount.user!.avatar! },
      });

      const { result } = renderLoginsHook(queryClient);
      const onComplete = vi.fn();
      const loginPromise = login(result.current).then(onComplete);

      try {
        await vi.waitFor(() => expect(createAccountSpy).toHaveBeenCalled());
        expect(invalidate).not.toHaveBeenCalled();
        expect(onComplete).not.toHaveBeenCalled();

        saved.resolve();
        await vi.waitFor(() => expect(onComplete).toHaveBeenCalledOnce());
        expect(invalidate).toHaveBeenCalledWith({ queryKey: notificationsKeys.all });
      } finally {
        saved.resolve();
        refreshed.resolve();
        await loginPromise;
      }
    },
  );

  it('loginWithDeviceFlowStart delegates to the forge adapter', async () => {
    const adapter = getAdapter('github');
    const startSpy = vi.spyOn(adapter.deviceFlow!, 'start').mockImplementation(vi.fn());

    const { result } = renderLoginsHook();

    await act(async () => {
      void result.current.loginWithDeviceFlowStart('github');
    });

    expect(startSpy).toHaveBeenCalled();
  });

  it('clears old CLI notifications only after the replacement account is created', async () => {
    useAccountsStore.setState({ accounts: [mockGitHubCliAccount] });
    vi.spyOn(getAdapter('github').cliAuth!, 'resolveToken').mockResolvedValue('cli-token' as Token);
    createAccountSpy.mockImplementation(async () => {
      expect(removeAccountNotificationsMock).not.toHaveBeenCalled();
    });
    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithCli('github', Constants.GITHUB_HOSTNAME);
    });

    expect(createAccountSpy).toHaveBeenCalledWith(
      'GitHub CLI',
      '',
      'github.com',
      'github',
      undefined,
      undefined,
      undefined,
    );
    expect(removeAccountNotificationsMock).toHaveBeenCalledWith(mockGitHubCliAccount);
  });

  it('threads the chosen CLI identity through resolution and account creation', async () => {
    const identity = { kind: 'account' as const, login: 'alice' };
    const resolveSpy = vi
      .spyOn(getAdapter('github').cliAuth!, 'resolveToken')
      .mockResolvedValue('cli-token' as Token);
    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithCli('github', Constants.GITHUB_HOSTNAME, identity);
    });

    expect(resolveSpy).toHaveBeenCalledWith(Constants.GITHUB_HOSTNAME, identity);
    expect(createAccountSpy).toHaveBeenCalledWith(
      'GitHub CLI',
      '',
      'github.com',
      'github',
      undefined,
      undefined,
      identity,
    );
  });

  it('keeps another pinned CLI account notifications when adding a different identity', async () => {
    const alice = {
      ...mockGitHubCliAccount,
      cliIdentity: { kind: 'account' as const, login: 'alice' },
    };
    useAccountsStore.setState({ accounts: [alice] });
    vi.spyOn(getAdapter('github').cliAuth!, 'resolveToken').mockResolvedValue('cli-token' as Token);
    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithCli('github', Constants.GITHUB_HOSTNAME, {
        kind: 'account',
        login: 'bob',
      });
    });

    expect(removeAccountNotificationsMock).not.toHaveBeenCalledWith(alice);
  });

  it('keeps old CLI notifications when replacement login fails', async () => {
    useAccountsStore.setState({ accounts: [mockGitHubCliAccount] });
    vi.spyOn(getAdapter('github').cliAuth!, 'resolveToken').mockResolvedValue('cli-token' as Token);
    createAccountSpy.mockRejectedValueOnce(new Error('CLI login failed'));
    const { result } = renderLoginsHook();

    await expect(result.current.loginWithCli('github', Constants.GITHUB_HOSTNAME)).rejects.toThrow(
      'CLI login failed',
    );

    expect(removeAccountNotificationsMock).not.toHaveBeenCalled();
    expect(useAccountsStore.getState().accounts).toEqual([mockGitHubCliAccount]);
  });

  it('loginWithDeviceFlowPoll delegates to the forge adapter', async () => {
    const adapter = getAdapter('github');
    const pollSpy = vi.spyOn(adapter.deviceFlow!, 'poll').mockImplementation(vi.fn());

    const { result } = renderLoginsHook();

    await act(async () => {
      void result.current.loginWithDeviceFlowPoll(
        'github',
        'session' as unknown as DeviceFlowSession,
      );
    });

    expect(pollSpy).toHaveBeenCalledWith('session');
  });

  it('loginWithDeviceFlowComplete records the built-in Gitify OAuth App account', async () => {
    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithDeviceFlowComplete(
        'github',
        'token' as Token,
        Constants.GITHUB_HOSTNAME,
      );
    });

    expect(createAccountSpy).toHaveBeenCalledWith(
      'Gitify OAuth App',
      'token',
      'github.com',
      'github',
      undefined,
      undefined,
    );
  });

  it('loginWithDeviceFlowComplete records a custom app client ID', async () => {
    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithDeviceFlowComplete(
        'github',
        'token' as Token,
        Constants.GITHUB_HOSTNAME,
        'CUSTOM_CLIENT_ID_123' as ClientID,
      );
    });

    expect(createAccountSpy).toHaveBeenCalledWith(
      'Custom OAuth App',
      'token',
      'github.com',
      'github',
      undefined,
      'CUSTOM_CLIENT_ID_123',
    );
  });

  it('loginWithDeviceFlowStart throws when the forge does not support device flow', async () => {
    const { result } = renderLoginsHook();

    await expect(result.current.loginWithDeviceFlowStart('gitea')).rejects.toThrow(
      /Device flow is not supported for forge "gitea"/,
    );
  });

  it('loginWithDeviceFlowPoll throws when the forge does not support device flow', async () => {
    const { result } = renderLoginsHook();

    await expect(
      result.current.loginWithDeviceFlowPoll('gitea', {} as DeviceFlowSession),
    ).rejects.toThrow(/Device flow is not supported for forge "gitea"/);
  });

  it('loginWithDeviceFlowComplete throws when the forge does not support device flow', async () => {
    const { result } = renderLoginsHook();

    await expect(
      result.current.loginWithDeviceFlowComplete(
        'gitea',
        'token' as Token,
        Constants.GITHUB_HOSTNAME,
      ),
    ).rejects.toThrow(/does not support device flow/);
  });

  it('logoutFromAccount calls removeAccountNotifications, removeAccount', async () => {
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

    const { result } = renderLoginsHook();

    await act(async () => {
      result.current.logoutFromAccount(mockGitHubCloudAccount);
    });

    expect(removeAccountNotificationsMock).toHaveBeenCalledWith(mockGitHubCloudAccount);
    expect(removeAccountSpy).toHaveBeenCalledWith(mockGitHubCloudAccount);
  });

  it('loginWithPersonalAccessToken forwards username for Bitbucket accounts', async () => {
    vi.spyOn(getAdapter('bitbucket').accountOps, 'fetchAuthenticatedUser').mockResolvedValue({
      user: {
        id: mockBitbucketAccount.user!.id,
        login: mockBitbucketAccount.user!.login,
        name: mockBitbucketAccount.user!.name,
        avatar: mockBitbucketAccount.user!.avatar!,
      },
    });

    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithPersonalAccessToken({
        token: mockBitbucketAccount.token,
        hostname: mockBitbucketAccount.hostname,
        forge: 'bitbucket',
        username: 'user@example.com',
      });
    });

    expect(createAccountSpy).toHaveBeenCalledWith(
      'Personal Access Token',
      mockBitbucketAccount.token,
      mockBitbucketAccount.hostname,
      'bitbucket',
      'user@example.com',
    );
  });
});
