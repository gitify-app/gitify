import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithAppContext } from '../../__helpers__/test-utils';
import { mockSettings } from '../../__mocks__/state-mocks';
import { Constants } from '../../constants';
import * as comms from '../../utils/comms';
import { NotificationSettings } from './NotificationSettings';

describe('renderer/components/settings/NotificationSettings.tsx', () => {
  const mockUpdateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the groupBy radio group', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('radio-groupBy-date'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('groupBy', 'DATE');
  });

  it('should change the fetchType radio group', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('radio-fetchType-inactivity'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('fetchType', 'INACTIVITY');
  });

  describe('fetch interval settings', () => {
    it('should update the fetch interval values when using the buttons', async () => {
      await act(async () => {
        renderWithAppContext(<NotificationSettings />, {
          updateSetting: mockUpdateSetting,
        });
      });

      // Increase fetch interval
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
        expect(mockUpdateSetting).toHaveBeenNthCalledWith(
          1,
          'fetchInterval',
          120000,
        );
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(mockUpdateSetting).toHaveBeenCalledTimes(2);
        expect(mockUpdateSetting).toHaveBeenNthCalledWith(
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

        expect(mockUpdateSetting).toHaveBeenCalledTimes(3);
        expect(mockUpdateSetting).toHaveBeenNthCalledWith(
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

        expect(mockUpdateSetting).toHaveBeenCalledTimes(4);
        expect(mockUpdateSetting).toHaveBeenNthCalledWith(
          4,
          'fetchInterval',
          60000,
        );
      });
    });

    it('should prevent going lower than minimum interval', async () => {
      await act(async () => {
        renderWithAppContext(<NotificationSettings />, {
          settings: {
            ...mockSettings,
            fetchInterval:
              Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS +
              Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
          },
          updateSetting: mockUpdateSetting,
        });
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
        expect(mockUpdateSetting).toHaveBeenCalledWith('fetchInterval', 60000);
      });

      // Attempt to go below the minimum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent going above maximum interval', async () => {
      await act(async () => {
        renderWithAppContext(<NotificationSettings />, {
          settings: {
            ...mockSettings,
            fetchInterval:
              Constants.MAX_FETCH_NOTIFICATIONS_INTERVAL_MS -
              Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
          },
          updateSetting: mockUpdateSetting,
        });
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
        expect(mockUpdateSetting).toHaveBeenCalledWith(
          'fetchInterval',
          3600000,
        );
      });

      // Attempt to go above the maximum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should toggle the fetchAllNotifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-fetchAllNotifications'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'fetchAllNotifications',
      false,
    );
  });

  it('should toggle detailed notifications checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-detailedNotifications'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'detailedNotifications',
      false,
    );
  });

  it('should toggle metric pills checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showPills'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('showPills', false);
  });

  it('should toggle show number checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showNumber'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('showNumber', false);
  });

  it('should toggle the showOnlyParticipating checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-showOnlyParticipating'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('participating', true);
  });

  it('should open official docs for showOnlyParticipating tooltip', async () => {
    const openExternalLinkSpy = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    const tooltipElement = screen.getByLabelText(
      'tooltip-showOnlyParticipating',
    );

    await userEvent.hover(tooltipElement);
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

  it('should toggle the markAsDoneOnOpen checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(screen.getByTestId('checkbox-markAsDoneOnOpen'));

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith('markAsDoneOnOpen', true);
  });

  it('should toggle the markAsDoneOnUnsubscribe checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(
      screen.getByTestId('checkbox-markAsDoneOnUnsubscribe'),
    );

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'markAsDoneOnUnsubscribe',
      true,
    );
  });

  it('should toggle the delayNotificationState checkbox', async () => {
    await act(async () => {
      renderWithAppContext(<NotificationSettings />, {
        updateSetting: mockUpdateSetting,
      });
    });

    await userEvent.click(
      screen.getByTestId('checkbox-delayNotificationState'),
    );

    expect(mockUpdateSetting).toHaveBeenCalledTimes(1);
    expect(mockUpdateSetting).toHaveBeenCalledWith(
      'delayNotificationState',
      true,
    );
  });
});
