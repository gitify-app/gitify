import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../../__mocks__/state-mocks';
import { AppContext } from '../../context/App';
import * as comms from '../../utils/comms';
import { NotificationSettings } from './NotificationSettings';

describe('routes/components/settings/NotificationSettings.tsx', () => {
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
    const openExternalLinkMock = jest
      .spyOn(comms, 'openExternalLink')
      .mockImplementation();

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
          <MemoryRouter>
            <NotificationSettings />
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    fireEvent.click(screen.getByLabelText('Mark as done on unsubscribe'), {
      target: { checked: true },
    });

    expect(updateSetting).toHaveBeenCalledTimes(1);
    expect(updateSetting).toHaveBeenCalledWith(
      'markAsDoneOnUnsubscribe',
      false,
    );
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
