import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';

import { Constants } from '../../constants';

import useSettingsStore from '../../stores/useSettingsStore';

import * as comms from '../../utils/comms';
import { NotificationSettings } from './NotificationSettings';

describe('renderer/components/settings/NotificationSettings.tsx', () => {
  let updateSettingSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    updateSettingSpy = vi.spyOn(useSettingsStore.getState(), 'updateSetting');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should change the groupBy radio group', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('radio-groupBy-date'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('groupBy', 'DATE');
  });

  describe('fetch interval settings', () => {
    it('should update the fetch interval values when using the buttons', async () => {
      await act(async () => {
        renderWithAppContext(<NotificationSettings />);
      });

      // Increase fetch interval
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(
          1,
          'fetchInterval',
          120000,
        );
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(2);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(
          2,
          'fetchInterval',
          180000,
        );
      });

      // Decrease fetch interval
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(3);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(
          3,
          'fetchInterval',
          120000,
        );
      });

      // Fetch interval reset
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-reset'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(4);
        expect(updateSettingSpy).toHaveBeenNthCalledWith(
          4,
          'fetchInterval',
          60000,
        );
      });
    });

    it('should prevent going lower than minimum interval', async () => {
      useSettingsStore.setState({
        fetchInterval:
          Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS +
          Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
      });

      await act(async () => {
        renderWithAppContext(<NotificationSettings />);
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenCalledWith('fetchInterval', 60000);
      });

      // Attempt to go below the minimum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent going above maximum interval', async () => {
      useSettingsStore.setState({
        fetchInterval:
          Constants.MAX_FETCH_NOTIFICATIONS_INTERVAL_MS -
          Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
      });

      await act(async () => {
        renderWithAppContext(<NotificationSettings />);
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
        expect(updateSettingSpy).toHaveBeenCalledWith('fetchInterval', 3600000);
      });

      // Attempt to go above the maximum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSettingSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should toggle the fetchAllNotifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-fetchAllNotifications'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'fetchAllNotifications',
      false,
    );
  });

  it('should toggle detailed notifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-detailedNotifications'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'detailedNotifications',
      false,
    );
  });

  it('should toggle metric pills checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-showPills'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('showPills', false);
  });

  it('should toggle show number checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-showNumber'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('showNumber', false);
  });

  it('should toggle the showOnlyParticipating checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-showOnlyParticipating'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('participating', true);
  });

  it('should open official docs for showOnlyParticipating tooltip', async () => {
    const openExternalLinkSpy = vi
      .spyOn(comms, 'openExternalLink')
      .mockImplementation(vi.fn());

    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    const tooltipElement = screen.getByLabelText(
      'tooltip-showOnlyParticipating',
    );

    await userEvent.click(tooltipElement);
    await userEvent.click(
      screen.getByTitle(
        'Open GitHub documentation for participating and watching notifications',
      ),
    );

    expect(openExternalLinkSpy).toHaveBeenCalledTimes(1);
    expect(openExternalLinkSpy).toHaveBeenCalledWith(
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
    );
  });

  it('should toggle the fetchReadNotifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(
      screen.getByTestId('checkbox-fetchReadNotifications'),
    );

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'fetchReadNotifications',
      true,
    );
  });

  it('should toggle the markAsDoneOnOpen checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(screen.getByTestId('checkbox-markAsDoneOnOpen'));

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith('markAsDoneOnOpen', true);
  });

  it('should toggle the markAsDoneOnUnsubscribe checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(
      screen.getByTestId('checkbox-markAsDoneOnUnsubscribe'),
    );

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'markAsDoneOnUnsubscribe',
      true,
    );
  });

  it('should toggle the delayNotificationState checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />);
    });

    await userEvent.click(
      screen.getByTestId('checkbox-delayNotificationState'),
    );

    expect(updateSettingSpy).toHaveBeenCalledTimes(1);
    expect(updateSettingSpy).toHaveBeenCalledWith(
      'delayNotificationState',
      true,
    );
  });
});
