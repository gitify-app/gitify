import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BaseStyles, ThemeProvider } from '@primer/react';

import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { Constants } from '../../constants';
import { AppContext } from '../../context/App';
import * as comms from '../../utils/comms';
import { NotificationSettings } from './NotificationSettings';

describe('renderer/components/settings/NotificationSettings.tsx', () => {
  const updateSetting = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should change the groupBy radio group', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('radio-groupBy-date'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('groupBy', 'DATE');
  });

  it('should change the fetchType radio group', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('radio-fetchType-inactivity'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('fetchType', 'INACTIVITY');
  });

  describe('fetch interval settings', () => {
    it('should update the fetch interval values when using the buttons', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
              updateSetting,
            }}
          >
            <NotificationSettings />
          </AppContext.Provider>,
        );
      });

      // Increase fetch interval
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSetting).toHaveBeenCalledTimes(1);
        expect(updateSetting).toHaveBeenCalledWith('fetchInterval', 120000);
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSetting).toHaveBeenCalledTimes(2);
        expect(updateSetting).toHaveBeenNthCalledWith(
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

        expect(updateSetting).toHaveBeenCalledTimes(3);
        expect(updateSetting).toHaveBeenNthCalledWith(
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

        expect(updateSetting).toHaveBeenCalledTimes(4);
        expect(updateSetting).toHaveBeenNthCalledWith(
          4,
          'fetchInterval',
          60000,
        );
      });
    });

    it('should prevent going lower than minimum interval', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: {
                ...mockSettings,
                fetchInterval:
                  Constants.MIN_FETCH_NOTIFICATIONS_INTERVAL_MS +
                  Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
              },
              updateSetting,
            }}
          >
            <NotificationSettings />
          </AppContext.Provider>,
        );
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(updateSetting).toHaveBeenCalledTimes(1);
        expect(updateSetting).toHaveBeenNthCalledWith(
          1,
          'fetchInterval',
          60000,
        );
      });

      // Attempt to go below the minimum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-decrease'),
        );

        expect(updateSetting).toHaveBeenCalledTimes(1);
      });
    });

    it('should prevent going above maximum interval', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: {
                ...mockSettings,
                fetchInterval:
                  Constants.MAX_FETCH_NOTIFICATIONS_INTERVAL_MS -
                  Constants.FETCH_NOTIFICATIONS_INTERVAL_STEP_MS,
              },
              updateSetting,
            }}
          >
            <NotificationSettings />
          </AppContext.Provider>,
        );
      });

      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSetting).toHaveBeenCalledTimes(1);
        expect(updateSetting).toHaveBeenNthCalledWith(
          1,
          'fetchInterval',
          3600000,
        );
      });

      // Attempt to go above the maximum interval, update settings should not be called
      await act(async () => {
        await userEvent.click(
          screen.getByTestId('settings-fetch-interval-increase'),
        );

        expect(updateSetting).toHaveBeenCalledTimes(1);
      });
    });
  });

  it('should toggle the fetchAllNotifications checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-fetchAllNotifications'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('fetchAllNotifications', false);
  });

  it('should toggle detailed notifications checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-detailedNotifications'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('detailedNotifications', false);
  });

  it('should toggle metric pills checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-showPills'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showPills', false);
  });

  it('should toggle show number checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-showNumber'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('showNumber', false);
  });

  it('should toggle the showOnlyParticipating checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-showOnlyParticipating'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('participating', true);
  });

  it('should open official docs for showOnlyParticipating tooltip', async () => {
    const openExternalLinkMock = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

    await act(async () => {
      render(
        <ThemeProvider>
          <BaseStyles>
            <AppContext.Provider
              value={{
                auth: mockAuth,
                settings: mockSettings,
                updateSetting,
              }}
            >
              <NotificationSettings />
            </AppContext.Provider>
          </BaseStyles>
        </ThemeProvider>,
      );
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

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
    );
  });

  it('should toggle the markAsDoneOnOpen checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(screen.getByTestId('checkbox-markAsDoneOnOpen'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markAsDoneOnOpen', true);
  });

  it('should toggle the markAsDoneOnUnsubscribe checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(
      screen.getByTestId('checkbox-markAsDoneOnUnsubscribe'),
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markAsDoneOnUnsubscribe', true);
  });

  it('should toggle the delayNotificationState checkbox', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <NotificationSettings />
        </AppContext.Provider>,
      );
    });

    await userEvent.click(
      screen.getByTestId('checkbox-delayNotificationState'),
    );

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('delayNotificationState', true);
  });
});
