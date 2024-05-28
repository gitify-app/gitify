import { act, fireEvent, render, screen } from '@testing-library/react';
import { ipcRenderer, shell } from 'electron';
import { MemoryRouter } from 'react-router-dom';
import { mockAccounts, mockSettings } from '../__mocks__/state-mocks';
import { AppContext } from '../context/App';
import { SettingsRoute } from './Settings';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('routes/Settings.tsx', () => {
  const updateSetting = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('General', () => {
    it('should render itself & its children', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{ settings: mockSettings, accounts: mockAccounts }}
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
              settings: mockSettings,
              accounts: mockAccounts,
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
              settings: mockSettings,
              accounts: mockAccounts,
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
              settings: mockSettings,
              accounts: mockAccounts,
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
  });

  describe('Notifications section', () => {
    it('should toggle the showOnlyParticipating checkbox', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
              accounts: mockAccounts,
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
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
              accounts: mockAccounts,
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

      expect(shell.openExternal).toHaveBeenCalledTimes(1);
      expect(shell.openExternal).toHaveBeenCalledWith(
        'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
      );
    });

    it('should not be able to toggle the showBots checkbox when detailedNotifications is disabled', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: {
                ...mockSettings,
                detailedNotifications: false,
                showBots: true,
              },
              accounts: mockAccounts,
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
              settings: {
                ...mockSettings,
                detailedNotifications: true,
                showBots: true,
              },
              accounts: mockAccounts,
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

    it('should toggle the markAsDoneOnOpen checkbox', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
              accounts: mockAccounts,
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
              settings: mockSettings,
              accounts: mockAccounts,
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
    it('should toggle the showNotificationsCountInTray checkbox', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
              accounts: mockAccounts,
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
              settings: mockSettings,
              accounts: mockAccounts,
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
              settings: mockSettings,
              accounts: mockAccounts,
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
              settings: mockSettings,
              accounts: mockAccounts,
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
    it('should open release notes', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
              accounts: mockAccounts,
            }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('View release notes'));

      expect(shell.openExternal).toHaveBeenCalledTimes(1);
      expect(shell.openExternal).toHaveBeenCalledWith(
        'https://github.com/gitify-app/gitify/releases/tag/v0.0.1',
      );
    });

    describe('Login with Personal Access Token', () => {
      it('should show login with personal access token button if not logged in', async () => {
        await act(async () => {
          render(
            <AppContext.Provider
              value={{
                settings: mockSettings,
                accounts: { ...mockAccounts, token: null },
              }}
            >
              <MemoryRouter>
                <SettingsRoute />
              </MemoryRouter>
            </AppContext.Provider>,
          );
        });

        expect(
          screen.getByTitle('Login with Personal Access Token').hidden,
        ).toBe(false);

        fireEvent.click(screen.getByTitle('Login with Personal Access Token'));
        expect(mockNavigate).toHaveBeenNthCalledWith(
          1,
          '/login-personal-access-token',
          {
            replace: true,
          },
        );
      });

      it('should hide login with personal access token button if already logged in', async () => {
        await act(async () => {
          render(
            <AppContext.Provider
              value={{
                settings: mockSettings,
                accounts: { ...mockAccounts, token: '1234' },
              }}
            >
              <MemoryRouter>
                <SettingsRoute />
              </MemoryRouter>
            </AppContext.Provider>,
          );
        });

        expect(
          screen.getByTitle('Login with Personal Access Token').hidden,
        ).toBe(true);
      });
    });

    describe('Login with OAuth App', () => {
      it('should show login with oauth app if not logged in', async () => {
        await act(async () => {
          render(
            <AppContext.Provider
              value={{
                settings: mockSettings,
                accounts: {
                  ...mockAccounts,
                  enterpriseAccounts: [],
                },
              }}
            >
              <MemoryRouter>
                <SettingsRoute />
              </MemoryRouter>
            </AppContext.Provider>,
          );
        });

        expect(screen.getByTitle('Login with OAuth App').hidden).toBe(false);

        fireEvent.click(screen.getByTitle('Login with OAuth App'));
        expect(mockNavigate).toHaveBeenNthCalledWith(1, '/login-oauth-app', {
          replace: true,
        });
      });

      it('should hide login with oauth app route if already logged in', async () => {
        await act(async () => {
          render(
            <AppContext.Provider
              value={{
                settings: mockSettings,
                accounts: mockAccounts,
              }}
            >
              <MemoryRouter>
                <SettingsRoute />
              </MemoryRouter>
            </AppContext.Provider>,
          );
        });

        expect(screen.getByTitle('Login with OAuth App').hidden).toBe(true);
      });
    });

    it('should press the logout', async () => {
      const logoutMock = jest.fn();
      await act(async () => {
        render(
          <AppContext.Provider
            value={{
              settings: mockSettings,
              accounts: mockAccounts,
              logout: logoutMock,
            }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('Logout'));

      expect(logoutMock).toHaveBeenCalledTimes(1);

      expect(ipcRenderer.send).toHaveBeenCalledTimes(2);
      expect(ipcRenderer.send).toHaveBeenCalledWith('update-icon');
      expect(ipcRenderer.send).toHaveBeenCalledWith('update-title', '');
      expect(mockNavigate).toHaveBeenNthCalledWith(1, -1);
    });

    it('should quit the app', async () => {
      await act(async () => {
        render(
          <AppContext.Provider
            value={{ settings: mockSettings, accounts: mockAccounts }}
          >
            <MemoryRouter>
              <SettingsRoute />
            </MemoryRouter>
          </AppContext.Provider>,
        );
      });

      fireEvent.click(screen.getByTitle('Quit Gitify'));
      expect(ipcRenderer.send).toHaveBeenCalledWith('app-quit');
    });
  });
});
