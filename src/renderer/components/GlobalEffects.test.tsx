import { act } from '@testing-library/react';

import { renderWithProviders } from '../__helpers__/test-utils';
import { mockGitHubCloudAccount } from '../__mocks__/account-mocks';

import { useShortcutRegistrationStore } from '../hooks/useShortcutRegistration';
import { useAccountsStore, useSettingsStore } from '../stores';

import { Theme } from '../types';

import * as authUtils from '../utils/auth/utils';
import * as comms from '../utils/system/comms';
import * as tray from '../utils/system/tray';
import { GlobalEffects } from './GlobalEffects';

describe('renderer/components/GlobalEffects.tsx', () => {
  const setTrayIconColorAndTitleSpy = vi
    .spyOn(tray, 'setTrayIconColorAndTitle')
    .mockImplementation(vi.fn());

  it('updates the tray icon with the notification count', async () => {
    await act(async () => {
      renderWithProviders(<GlobalEffects />, { status: 'success', notificationCount: 3 });
    });

    expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledWith(3, true);
  });

  it('updates the tray icon with the error state', async () => {
    await act(async () => {
      renderWithProviders(<GlobalEffects />, { status: 'error', notificationCount: 3 });
    });

    expect(setTrayIconColorAndTitleSpy).toHaveBeenCalledWith(-1, true);
  });

  it('resets all stores when the app is reset', async () => {
    await act(async () => {
      renderWithProviders(<GlobalEffects />, {
        accounts: [mockGitHubCloudAccount],
        settings: { theme: Theme.DARK },
        shortcutRegistrationError: 'in use',
      });
    });

    const onResetApp = vi.mocked(window.gitify.onResetApp).mock.calls[0][0];

    act(() => {
      onResetApp();
    });

    expect(useAccountsStore.getState().accounts).toEqual([]);
    expect(useSettingsStore.getState().theme).toBe(Theme.SYSTEM);
    expect(useShortcutRegistrationStore.getState().shortcutRegistrationError).toBeNull();
  });

  describe('persistRotatedAccountTokens (startup)', () => {
    const refreshAccountSpy = vi
      .spyOn(authUtils, 'refreshAccount')
      .mockImplementation(async (account) => account);
    const decryptValueSpy = vi.spyOn(comms, 'decryptValue');
    const encryptValueSpy = vi.spyOn(comms, 'encryptValue');

    beforeEach(() => {
      decryptValueSpy.mockReset();
      encryptValueSpy.mockReset();
      refreshAccountSpy.mockClear();
    });

    it('persists rotated ciphertext when decryptValue reports a re-encryption', async () => {
      decryptValueSpy.mockResolvedValue({
        token: 'plain-token',
        reEncryptedToken: 'rotated-cipher',
      });

      await act(async () => {
        renderWithProviders(<GlobalEffects />, {
          accounts: [{ ...mockGitHubCloudAccount }],
        });
      });

      expect(useAccountsStore.getState().accounts[0]?.token).toBe('rotated-cipher');
    });

    it('does not persist when decryptValue returns no rotated ciphertext', async () => {
      decryptValueSpy.mockResolvedValue({ token: 'plain-token' });

      await act(async () => {
        renderWithProviders(<GlobalEffects />, {
          accounts: [{ ...mockGitHubCloudAccount }],
        });
      });

      expect(useAccountsStore.getState().accounts[0]?.token).toBe(mockGitHubCloudAccount.token);
    });

    it('does not re-encrypt or persist when decrypt throws', async () => {
      decryptValueSpy.mockRejectedValue(new Error('not encrypted'));

      await act(async () => {
        renderWithProviders(<GlobalEffects />, {
          accounts: [{ ...mockGitHubCloudAccount }],
        });
      });

      expect(encryptValueSpy).not.toHaveBeenCalled();
      expect(useAccountsStore.getState().accounts[0]?.token).toBe(mockGitHubCloudAccount.token);
    });
  });
});
