import { act, renderHook } from '@testing-library/react';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../../__mocks__/account-mocks';

import { useAccountsStore, useSettingsStore } from '../../stores';

import { notificationsKeys } from '../../utils/api/queryKeys';
import { getAccountUUID } from '../../utils/auth/utils';
import { useNotificationsQueryKey } from './useNotificationsQueryKey';

describe('renderer/hooks/notifications/useNotificationsQueryKey.ts', () => {
  it('derives the notifications list key from the accounts and settings stores', () => {
    useAccountsStore.setState({
      accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
    });
    useSettingsStore.setState({ fetchReadNotifications: true, participating: true });

    const { result } = renderHook(() => useNotificationsQueryKey());

    expect(result.current).toEqual(
      notificationsKeys.list(
        [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount].map(getAccountUUID),
        true,
        true,
      ),
    );
  });

  it('keeps the same key reference while the source state is unchanged', () => {
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

    const { result, rerender } = renderHook(() => useNotificationsQueryKey());
    const initialKey = result.current;

    rerender();

    expect(result.current).toBe(initialKey);
  });

  it('recomputes the key when an account is added', () => {
    useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

    const { result } = renderHook(() => useNotificationsQueryKey());
    const initialKey = result.current;

    act(() => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
    });

    expect(result.current).toEqual(
      notificationsKeys.list(
        [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount].map(getAccountUUID),
        useSettingsStore.getState().fetchReadNotifications,
        useSettingsStore.getState().participating,
      ),
    );
    expect(result.current).not.toBe(initialKey);
  });
});
