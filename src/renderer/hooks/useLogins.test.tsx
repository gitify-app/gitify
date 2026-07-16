import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { setNotificationsOverrides } from '../__helpers__/hook-mocks';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { Constants } from '../constants';

import { useAccountsStore } from '../stores';

import type { ClientID, ClientSecret, Token } from '../types';
import type { DeviceFlowSession } from '../utils/auth/types';

import { getAdapter } from '../utils/forges/registry';
import { useLogins } from './useLogins';

// Exercise the real hook implementation (globally mocked in vitest.setup)
vi.unmock('./useLogins');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const renderLoginsHook = () => renderHook(() => useLogins(), { wrapper: createWrapper() });

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

  it('loginWithDeviceFlowStart delegates to the forge adapter', async () => {
    const adapter = getAdapter('github');
    const startSpy = vi.spyOn(adapter.deviceFlow!, 'start').mockImplementation(vi.fn());

    const { result } = renderLoginsHook();

    await act(async () => {
      result.current.loginWithDeviceFlowStart('github');
    });

    expect(startSpy).toHaveBeenCalled();
  });

  it('loginWithDeviceFlowPoll delegates to the forge adapter', async () => {
    const adapter = getAdapter('github');
    const pollSpy = vi.spyOn(adapter.deviceFlow!, 'poll').mockImplementation(vi.fn());

    const { result } = renderLoginsHook();

    await act(async () => {
      result.current.loginWithDeviceFlowPoll('github', 'session' as unknown as DeviceFlowSession);
    });

    expect(pollSpy).toHaveBeenCalledWith('session');
  });

  it('loginWithDeviceFlowComplete creates the account', async () => {
    const { result } = renderLoginsHook();

    await act(async () => {
      await result.current.loginWithDeviceFlowComplete(
        'github',
        'token' as Token,
        Constants.GITHUB_HOSTNAME,
      );
    });

    expect(createAccountSpy).toHaveBeenCalledWith('GitHub App', 'token', 'github.com', 'github');
  });

  it('loginWithOAuthApp delegates to the forge adapter', async () => {
    const adapter = getAdapter('github');
    const oauthSpy = vi.spyOn(adapter.oauthWebApp!, 'performWebOAuth');

    const { result } = renderLoginsHook();

    await act(async () => {
      result.current.loginWithOAuthApp('github', {
        clientId: 'id' as ClientID,
        clientSecret: 'secret' as ClientSecret,
        hostname: Constants.GITHUB_HOSTNAME,
      });
    });

    expect(oauthSpy).toHaveBeenCalled();
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

  it('loginWithOAuthApp throws when the forge does not support OAuth app login', async () => {
    const { result } = renderLoginsHook();

    await expect(
      result.current.loginWithOAuthApp('gitea', {
        clientId: 'id' as ClientID,
        clientSecret: 'secret' as ClientSecret,
        hostname: Constants.GITHUB_HOSTNAME,
      }),
    ).rejects.toThrow(/OAuth app login is not supported for forge "gitea"/);
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
});
