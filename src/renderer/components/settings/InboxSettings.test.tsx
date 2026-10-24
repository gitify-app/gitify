import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '../../__helpers__/test-utils';
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
  });

  it('should change the groupBy radio group', async () => {
    await act(async () => {
      renderWithProviders(<InboxSettings />);
    });

    await userEvent.click(screen.getByTestId('radio-groupBy-date'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('groupBy', 'DATE');
  });

  describe('fetch interval settings', () => {
    it('should update the fetch interval values when using the buttons', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />);
      });

      // Increase fetch interval
      await act(async () => {
        await userEvent.click(screen.getByTestId('settings-fetch-interval-increase'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(1, 'fetchInterval', 120000);
      });

      await act(async () => {
        await userEvent.click(screen.getByTestId('settings-fetch-interval-increase'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(2);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(2, 'fetchInterval', 180000);
      });

      // Decrease fetch interval
      await act(async () => {
        await userEvent.click(screen.getByTestId('settings-fetch-interval-decrease'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(3);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(3, 'fetchInterval', 120000);
      });

      // Fetch interval reset
      await act(async () => {
        await userEvent.click(screen.getByTestId('settings-fetch-interval-reset'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(4);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(4, 'fetchInterval', 60000);
      });
    });

    it('should prevent going lower than minimum interval', async () => {
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
        await userEvent.click(screen.getByTestId('settings-fetch-interval-decrease'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenCalledWith('fetchInterval', 60000);
      });

      // Attempt to go below the minimum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(screen.getByTestId('settings-fetch-interval-decrease'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent going above maximum interval', async () => {
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
        await userEvent.click(screen.getByTestId('settings-fetch-interval-increase'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenCalledWith('fetchInterval', 3600000);
      });

      // Attempt to go above the maximum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(screen.getByTestId('settings-fetch-interval-increase'));

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  it.each([
    ['checkbox-fetchAllNotifications', 'fetchAllNotifications'],
    ['checkbox-detailedNotifications', 'detailedNotifications'],
    ['checkbox-showPills', 'showPills'],
    ['checkbox-showNumber', 'showNumber'],
    ['checkbox-showOnlyParticipating', 'participating'],
    ['checkbox-fetchReadNotifications', 'fetchReadNotifications'],
    ['checkbox-markAsDoneOnOpen', 'markAsDoneOnOpen'],
    ['checkbox-markAsDoneOnUnsubscribe', 'markAsDoneOnUnsubscribe'],
    ['checkbox-showAccountHeader', 'showAccountHeader'],
    ['checkbox-wrapNotificationTitle', 'wrapNotificationTitle'],
    ['checkbox-delayNotificationState', 'delayNotificationState'],
  ] as const)('should toggle %s checkbox', async (testId, setting) => {
    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    await userEvent.click(screen.getByTestId(testId));

    expect(toggleSettingSpy).toHaveBeenCalledTimes(1);
    expect(toggleSettingSpy).toHaveBeenCalledWith(setting);
  });

  it('reactively hides the account header checkbox when a second account is added', async () => {
    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    expect(screen.getByTestId('checkbox-showAccountHeader')).toBeInTheDocument();

    await act(async () => {
      useAccountsStore.setState({
        accounts: [mockGitHubCloudAccount, mockGitHubEnterpriseServerAccount],
      });
    });

    expect(screen.queryByTestId('checkbox-showAccountHeader')).not.toBeInTheDocument();
  });

  describe('GitHub-specific settings', () => {
    it('hides GitHub-only settings when no GitHub account is connected', async () => {
      await act(async () => {
        renderWithProviders(<InboxSettings />, {
          accounts: [mockGitLabAccount],
        });
      });

      expect(screen.queryByTestId('checkbox-showOnlyParticipating')).not.toBeInTheDocument();
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

      expect(screen.getByTestId('checkbox-markAsDoneOnOpen')).toBeDisabled();
      expect(screen.getByTestId('checkbox-markAsDoneOnUnsubscribe')).toBeDisabled();
      expect(
        screen.getByText(
          'Mark as done requires GitHub Cloud or GitHub Enterprise Server 3.13 or later.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('should open official docs for showOnlyParticipating tooltip', async () => {
    const openExternalLinkSpy = vi.spyOn(comms, 'openExternalLink').mockImplementation(vi.fn());

    await act(async () => {
      renderWithProviders(<InboxSettings />, {
        accounts: [mockGitHubCloudAccount],
      });
    });

    const tooltipElement = screen.getByLabelText('tooltip-showOnlyParticipating');

    await userEvent.click(tooltipElement);
    await userEvent.click(
      screen.getByTitle('Open GitHub documentation for participating and watching notifications'),
    );

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
    );
  });

  it('should show help for the fetch interval', async () => {
    await act(async () => {
      renderWithProviders(<InboxSettings />);
    });

    await userEvent.click(screen.getByTestId('tooltip-icon-tooltip-fetchInterval'));

    expect(
      screen.getByText(
        'Set how often Gitify checks for new notifications. Shorter intervals check more often and use more API requests.',
      ),
    ).toBeInTheDocument();
  });
});
