import { act, renderHook } from '@testing-library/react';

import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
} from '../__mocks__/account-mocks';

import { DEFAULT_ACCOUNTS_STATE } from './defaults';
import useAccountsStore from './useAccountsStore';

describe('renderer/stores/useAccountsStore.ts', () => {
  beforeEach(() => {
    useAccountsStore.setState({ ...DEFAULT_ACCOUNTS_STATE });
  });

  test('should start with default accounts', () => {
    const { result } = renderHook(() => useAccountsStore());

    expect(result.current).toMatchObject(DEFAULT_ACCOUNTS_STATE);
  });

  describe('removeAccount', () => {
    test('should remove an account', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.removeAccount(mockGitHubCloudAccount);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0]).toEqual(
        mockGitHubEnterpriseServerAccount,
      );
    });

    test('should not remove account if not found', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.removeAccount(mockGitHubEnterpriseServerAccount);
      });

      expect(result.current.accounts).toHaveLength(1);
      expect(result.current.accounts[0]).toEqual(mockGitHubCloudAccount);
    });
  });

  describe('isLoggedIn', () => {
    test('should return false when no accounts are present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.isLoggedIn()).toBe(false);
    });

    test('should return true when accounts are present', () => {
      useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.isLoggedIn()).toBe(true);
    });
  });

  describe('hasMultipleAccounts', () => {
    test('should return false when zero or one account is present', () => {
      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.hasMultipleAccounts()).toBe(false);

      act(() => {
        useAccountsStore.setState({ accounts: [mockGitHubCloudAccount] });
      });

      expect(result.current.hasMultipleAccounts()).toBe(false);
    });

    test('should return true when more than one account is present', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      expect(result.current.hasMultipleAccounts()).toBe(true);
    });
  });

  describe('reset', () => {
    test('should reset accounts to default', () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });

      const { result } = renderHook(() => useAccountsStore());

      act(() => {
        result.current.reset();
      });

      expect(result.current).toMatchObject(DEFAULT_ACCOUNTS_STATE);
      expect(result.current.accounts).toEqual([]);
    });
  });
});
