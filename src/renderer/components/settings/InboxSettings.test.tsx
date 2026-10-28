import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { navigateMock, renderWithProviders } from '../../__helpers__/test-utils';
import {
  mockGitHubCloudAccount,
  mockGitHubEnterpriseServerAccount,
  mockGitLabAccount,
} from '../../__mocks__/account-mocks';
import { mockSettings } from '../../__mocks__/state-mocks';

import { Constants } from '../../constants';

import { useAccountsStore, useSettingsStore } from '../../stores';

import * as comms from '../../utils/system/comms';
import { InboxSettings } from './InboxSettings';

describe('renderer/components/settings/InboxSettings.tsx', () => {
  let toggleSettingSpy: ReturnType<typeof vi.spyOn>;
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    toggleSettingSpy = vi.spyOn(useSettingsStore.getState(), 'toggleSetting');
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
    navigateMock.mockReset();
  });

  it('changes the groupBy choice', async () => {
    await act(async () => {
      renderWithProviders(<InboxSettings />);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Date' }));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('groupBy', 'DATE');
  });

  describe('fetch interval settings', () => {
    it('updates the fetch interval values when using the buttons', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />);
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Increase fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(1, 'fetchInterval', 120000);
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Increase fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(2);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(2, 'fetchInterval', 180000);
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Decrease fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(3);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(3, 'fetchInterval', 120000);
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Reset fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(4);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(4, 'fetchInterval', 60000);
      });
    });

    it('prevents going lower than minimum interval', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          settings: {
            ...mockSettings,
            fetchInterval:
              Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS +
              Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
          },
        });
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Decrease fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenCalledWith('fetchInterval', 60000);
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Decrease fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('prevents going above maximum interval', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          settings: {
            ...mockSettings,
            fetchInterval:
              Constants.MAX_FETCH_NOTIFICATIONS_INTERVAL_MS -
              Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
          },
        });
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Increase fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenCalledWith('fetchInterval', 3600000);
      });

      await act(async () => {
        await userEvent.click(screen.getByRole('button', { name: 'Increase fetch interval' }));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  it.each([
    ['Fetch all notifications', 'fetchAllNotifications'],
    ['Fetch detailed notifications', 'detailedNotifications'],
    ['Show notification metrics', 'showPills'],
    ['Show reference', 'showNumber'],
    ['Fetch only participating', 'participating'],
    ['Fetch read and done notifications', 'fetchReadNotifications'],
    ['Mark as done on open', 'markAsDoneOnOpen'],
    ['Mark as done on unsubscribe', 'markAsDoneOnUnsubscribe'],
    ['Show account header', 'showAccountHeader'],
    ['Show full notification title', 'wrapNotificationTitle'],
    ['Delay notification removal', 'delayNotificationState'],
  ] as const)('toggles %s switch', async (label, setting) => {
    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    await userEvent.click(screen.getByRole('button', { name: label }));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });

  it('reactively hides the account header switch when a second account is added', async () => {
    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    expect(screen.getByRole('button', { name: 'Show account header' })).toBeInTheDocument();

    await act(async () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
    });

    expect(screen.queryByTestId('switch-showAccountHeader')).not.toBeInTheDocument();
  });

  describe('GitHub-specific settings', () => {
    it('hides GitHub-only settings when no GitHub account is connected', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          accounts: [mockGitLabAccount],
        });
      });

      expect(screen.queryByTestId('switch-showOnlyParticipating')).not.toBeInTheDocument();
      expect(
        screen.getByText('GitHub-specific options require a GitHub account.'),
      ).toBeInTheDocument();
    });

    it('disables mark as done when the GitHub account does not support it', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          accounts: [mockGitHubEnterpriseServerAccount],
        });
      });

      expect(screen.getByRole('button', { name: 'Mark as done on open' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Mark as done on unsubscribe' })).toHaveAttribute(
        'aria-disabled',
        'true',
      );
      expect(
        screen.getAllByText('Requires GitHub Cloud or GitHub Enterprise Server 3.13 or later.'),
      ).toHaveLength(2);
    });

    it('hides notification metrics when detailed notifications are disabled', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          accounts: [mockGitHubCloudAccount],
          settings: { ...mockSettings, detailedNotifications: false },
        });
      });

      expect(screen.getByTestId('reveal-notificationMetrics')).toHaveAttribute(
        'data-state',
        'closed',
      );
    });

    it('shows notification metrics when detailed notifications are enabled', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          accounts: [mockGitHubCloudAccount],
          settings: { ...mockSettings, detailedNotifications: true },
        });
      });

      expect(screen.getByTestId('reveal-notificationMetrics')).toHaveAttribute(
        'data-state',
        'open',
      );
    });

    it('shows a banner when GitHub accounts are missing scopes', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          accounts: [mockGitHubCloudAccount],
        });
      });

      expect(screen.getByTestId('settings-scope-warning')).toBeInTheDocument();
      expect(
        screen.getByText(
          'One or more accounts are missing scopes required for notification enrichment. Notification details may be incomplete.',
        ),
      ).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Review account scopes' }));

      expect(navigateMock).toHaveBeenCalledWith('/accounts');
    });
  });

  it('opens official docs from the participating help link', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    await userEvent.click(screen.getByRole('button', { name: 'Help: Fetch only participating' }));

    await userEvent.click(
      screen.getByTitle('Open GitHub documentation for participating and watching notifications'),
    );

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
    );
  });

  it.each([
    ['groupBy', 'Group by'],
    ['showAccountHeader', 'Show account header'],
    ['wrapNotificationTitle', 'Show full notification title'],
    ['showNumber', 'Show reference'],
    ['delayNotificationState', 'Delay notification removal'],
  ] as const)('renders the %s tooltip', async (_name, label) => {
    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    expect(screen.getByRole('button', { name: `Help: ${label}` })).toBeInTheDocument();
  });

  it('shows the fetch interval details in a tooltip', async () => {
    await act(async () => {
      renderWithProviders(<InboxSettings />);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Help: Fetch interval' }));

    expect(
      screen.getByText(
        'Check for new notifications at this interval. Shorter intervals keep the list fresher but spend more API requests.',
      ),
    ).toBeInTheDocument();
  });
});
