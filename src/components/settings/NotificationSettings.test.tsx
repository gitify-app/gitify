import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import * as comms from '../../utils/comms';
import { NotificationSettings } from './NotificationSettings';

describe('routes/components/NotificationSettings.tsx', () => {
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
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Date'));

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('groupBy', 'DATE');
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
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Show only participating'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('participating', false);
  });

  it('should open official docs for showOnlyParticipating tooltip', async () => {
    const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: mockSettings,
            updateSetting,
          }}
        >
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    const tooltipElement = screen.getByLabelText(
      'tooltip-showOnlyParticipating',
    );

    fireEvent.mouseEnter(tooltipElement);

    fireEvent.click(
      screen.getByTitle(
        'Open GitHub documentation for participating and watching notifications',
      ),
    );

    expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
    expect(openExternalLinkMock).toHaveBeenCalledWith(
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
    );
  });

  it('should not be able to toggle the showBots checkbox when detailedNotifications is disabled', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: {
              ...mockSettings,
              detailedNotifications: false,
              showBots: true,
            },
            updateSetting,
          }}
        >
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    expect(
      screen
        .getByLabelText('Show notifications from Bot accounts')
        .closest('input'),
    ).toHaveProperty('disabled', true);

    // click the checkbox
    fireEvent.click(
      screen.getByLabelText('Show notifications from Bot accounts'),
    );

    // check if the checkbox is still unchecked
    expect(updateSetting).not.toHaveBeenCalled();

    expect(
      screen.getByLabelText('Show notifications from Bot accounts').parentNode
        .parentNode,
    ).toMatchSnapshot();
  });

  it('should be able to toggle the showBots checkbox when detailedNotifications is enabled', async () => {
    await act(async () => {
      render(
        <AppContext.Provider
          value={{
            auth: mockAuth,
            settings: {
              ...mockSettings,
              detailedNotifications: true,
              showBots: true,
            },
            updateSetting,
          }}
        >
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    expect(
      screen
        .getByLabelText('Show notifications from Bot accounts')
        .closest('input'),
    ).toHaveProperty('disabled', false);

    // click the checkbox
    fireEvent.click(
      screen.getByLabelText('Show notifications from Bot accounts'),
    );

    // check if the checkbox is still unchecked
    expect(updateSetting).toHaveBeenCalledWith('showBots', false);

    expect(
      screen.getByLabelText('Show notifications from Bot accounts').parentNode
        .parentNode,
    ).toMatchSnapshot();
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
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Mark as done on open'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('markAsDoneOnOpen', false);
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
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Delay notification state'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith('delayNotificationState', false);
  });
});
