import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { mockAuth, mockSettings } from '../__mocks__/state-mocks';
import { mockPlatform } from '../__mocks__/utils';
import { AppContext } from '../context/App';
import * as comms from '../utils/comms';
import { SettingsRoute } from './Settings';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Settings.tsx', () => {
  let originalPlatform: NodeJS.Platform;
  const updateSetting = jest.fn();

  beforeAll(() => {
    // Save the original platform value
    originalPlatform = process.platform;
    mockPlatform('darwin');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore the original platform value
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });

    // Restore the original node env value
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
    });
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{ auth: mockAuth, settings: mockSettings }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      expect(screen.getByTestId('settings')).toMatchSnapshot();
    });

    it('should go back by pressing the icon', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Go Back'));
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });
  });
  describe('Appearance section', () => {
    it('should change the theme radio group', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Light'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('theme', 'LIGHT');
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
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      await screen.findByLabelText('Detailed notifications');

      fireEvent.click(screen.getByLabelText('Detailed notifications'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith(
        'detailedNotifications',
        false,
      );
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
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      await screen.findByLabelText('Show notification metric pills');

      fireEvent.click(screen.getByLabelText('Show notification metric pills'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('showPills', false);
    });

    it('should toggle account hostname checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      await screen.findByLabelText('Show account hostname');

      fireEvent.click(screen.getByLabelText('Show account hostname'));

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('showAccountHostname', true);
    });
  });

  describe('Notifications section', () => {
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
              <SettingsRoute />
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
              <SettingsRoute />
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
              <SettingsRoute />
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
              <SettingsRoute />
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

    it('should toggle the groupByRepository checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(
        screen.getByLabelText('Group notifications by repository'),
        {
          target: { checked: true },
        },
      );

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('groupByRepository', false);
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
              <SettingsRoute />
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Delay notification state'), {
        target: { checked: true },
      });

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith(
        'delayNotificationState',
        false,
      );
    });
  });

  describe('System section', () => {
    it('should toggle the keyboardShortcut checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Enable keyboard shortcut'), {
        target: { checked: true },
      });

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('keyboardShortcut', false);
    });

    it('should toggle the showNotificationsCountInTray checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(
        screen.getByLabelText('Show notifications count in tray'),
        {
          target: { checked: true },
        },
      );

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith(
        'showNotificationsCountInTray',
        false,
      );
    });

    it('should toggle the showNotifications checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Show system notifications'), {
        target: { checked: true },
      });

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('showNotifications', false);
    });

    it('should toggle the playSound checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Play sound'), {
        target: { checked: true },
      });

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('playSound', false);
    });

    it('should toggle the openAtStartup checkbox', async () => {
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
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByLabelText('Open at startup'), {
        target: { checked: true },
      });

      expect(updateSetting).toHaveBeenCalledTimes(1);
      expect(updateSetting).toHaveBeenCalledWith('openAtStartup', false);
    });
  });

  describe('Footer section', () => {
    describe('app version', () => {
      let originalEnv: NodeJS.ProcessEnv;

      beforeEach(() => {
        // Save the original node env state
        originalEnv = process.env;
      });

      afterEach(() => {
        // Restore the original node env state
        process.env = originalEnv;
      });

      it('should show production app version', async () => {
        process.env = {
          ...originalEnv,
          NODE_ENV: 'production',
        };

        await act(async () => {
          render(
            <AppContext.Provider
              value={{
                auth: mockAuth,
                settings: mockSettings,
              }}
            >
              <MemoryRouter>
                <SettingsRoute />
              </MemoryRouter>
            </AppContext.Provider>,
          );
        });

        expect(screen.getByTitle('app-version')).toMatchSnapshot();
      });

      it('should show development app version', async () => {
        process.env = {
          ...originalEnv,
          NODE_ENV: 'development',
        };

        await act(async () => {
          render(
            <AppContext.Provider
              value={{
                auth: mockAuth,
                settings: mockSettings,
              }}
            >
              <MemoryRouter>
                <SettingsRoute />
              </MemoryRouter>
            </AppContext.Provider>,
          );
        });

        expect(screen.getByTitle('app-version')).toMatchSnapshot();
      });
    });

    it('should open release notes', async () => {
      const openExternalLinkMock = jest.spyOn(comms, 'openExternalLink');

      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('View release notes'));

      expect(openExternalLinkMock).toHaveBeenCalledTimes(1);
      expect(openExternalLinkMock).toHaveBeenCalledWith(
        'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
      );
    });

    it('should open account management', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('Accounts'));
      expect(mockNavigate).toHaveBeenCalledWith('/accounts');
    });

    it('should quit the app', async () => {
      const quitAppMock = jest.spyOn(comms, 'quitApp');

      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              auth: mockAuth,
              settings: mockSettings,
            }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('Quit Gitify'));
      expect(quitAppMock).toHaveBeenCalledTimes(1);
    });
  });
});
