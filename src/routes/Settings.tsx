import {
  ArrowLeftIcon,
  PersonAddIcon,
  SignOutIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { ipcRenderer } from 'electron';

import {
  type FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { FieldCheckbox } from '../components/fields/Checkbox';
import { FieldRadioGroup } from '../components/fields/RadioGroup';
import { AppContext } from '../context/App';
import { Theme } from '../types';
import { apiRequestAuth } from '../utils/api-requests';
import {
  openExternalLink,
  updateTrayIcon,
  updateTrayTitle,
} from '../utils/comms';
import Constants from '../utils/constants';
import { generateGitHubAPIUrl } from '../utils/helpers';
import { setTheme } from '../utils/theme';

export const SettingsRoute: FC = () => {
  const { accounts, settings, updateSetting, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const [isLinux, setIsLinux] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [colorScope, setColorScope] = useState<boolean>(false);

  const openGitHubReleaseNotes = useCallback((version) => {
    openExternalLink(
      `https://github.com/${Constants.REPO_SLUG}/releases/tag/v${version}`,
    );
  }, []);

  useEffect(() => {
    ipcRenderer.invoke('get-platform').then((result: string) => {
      setIsLinux(result === 'linux');
    });

    ipcRenderer.invoke('get-app-version').then((result: string) => {
      setAppVersion(result);
    });
  }, []);

  useMemo(() => {
    (async () => {
      const response = await apiRequestAuth(
        `${generateGitHubAPIUrl(Constants.DEFAULT_AUTH_OPTIONS.hostname)}`,
        'GET',
        accounts.token,
      );

      if (response.headers['x-oauth-scopes'].includes('repo'))
        setColorScope(true);
    })();
  }, [accounts.token]);

  ipcRenderer.on('update-native-theme', (_, updatedTheme: Theme) => {
    if (settings.theme === Theme.SYSTEM) {
      setTheme(updatedTheme);
    }
  });

  const logoutUser = useCallback(() => {
    logout();
    navigate(-1);
    updateTrayIcon();
    updateTrayTitle();
  }, []);

  const quitApp = useCallback(() => {
    ipcRenderer.send('app-quit');
  }, []);

  const goToEnterprise = useCallback(() => {
    return navigate('/login-enterprise', { replace: true });
  }, []);

  const footerButtonClass =
    'hover:text-gray-500 py-1 px-2 my-1 mx-2 focus:outline-none';

  return (
    <div
      className="flex flex-1 flex-col h-screen dark:bg-gray-dark dark:text-white"
      data-testid="settings"
    >
      <div className="flex justify-between items-center mt-2 py-2 mx-8">
        <button
          type="button"
          className="focus:outline-none"
          title="Go Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon
            size={20}
            className="hover:text-gray-400"
            aria-label="Go Back"
          />
        </button>

        <h3 className="text-lg font-semibold">Settings</h3>
      </div>

      <div className="flex-grow overflow-x-auto px-8">
        <fieldset className="mb-3">
          <legend id="appearance" className="font-semibold mt-2 mb-1">
            Appearance
          </legend>
          <FieldRadioGroup
            name="theme"
            label="Theme:"
            value={settings.theme}
            options={[
              { label: 'System', value: Theme.SYSTEM },
              { label: 'Light', value: Theme.LIGHT },
              { label: 'Dark', value: Theme.DARK },
            ]}
            onChange={(evt) => {
              updateSetting('theme', evt.target.value);
            }}
          />
          <FieldCheckbox
            name="colors"
            label={`Use GitHub-like state colors${
              !colorScope ? ' (requires repo scope)' : ''
            }`}
            checked={colorScope && settings.colors}
            onChange={(evt) =>
              colorScope && updateSetting('colors', evt.target.checked)
            }
            disabled={!colorScope}
          />
          <FieldCheckbox
            name="showAccountHostname"
            label="Show account hostname"
            checked={settings.showAccountHostname}
            onChange={(evt) =>
              updateSetting('showAccountHostname', evt.target.checked)
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <legend id="notifications" className="font-semibold  mt-2 mb-1">
            Notifications
          </legend>
          <FieldCheckbox
            name="showOnlyParticipating"
            label="Show only participating"
            checked={settings.participating}
            onChange={(evt) =>
              updateSetting('participating', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="showBots"
            label="Show notifications from Bot accounts"
            checked={settings.showBots}
            onChange={(evt) => updateSetting('showBots', evt.target.checked)}
          />
          <FieldCheckbox
            name="markAsDoneOnOpen"
            label="Mark as done on open"
            checked={settings.markAsDoneOnOpen}
            onChange={(evt) =>
              updateSetting('markAsDoneOnOpen', evt.target.checked)
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <legend id="system" className="font-semibold  mt-2 mb-1">
            System
          </legend>
          <FieldCheckbox
            name="showNotificationsCountInTray"
            label="Show notifications count in tray"
            checked={settings.showNotificationsCountInTray}
            onChange={(evt) =>
              updateSetting('showNotificationsCountInTray', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="showNotifications"
            label="Show system notifications"
            checked={settings.showNotifications}
            onChange={(evt) =>
              updateSetting('showNotifications', evt.target.checked)
            }
          />
          <FieldCheckbox
            name="playSound"
            label="Play sound"
            checked={settings.playSound}
            onChange={(evt) => updateSetting('playSound', evt.target.checked)}
          />
          {!isLinux && (
            <FieldCheckbox
              name="openAtStartUp"
              label="Open at startup"
              checked={settings.openAtStartup}
              onChange={(evt) =>
                updateSetting('openAtStartup', evt.target.checked)
              }
            />
          )}
        </fieldset>
      </div>

      <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-darker py-1 px-8 text-sm">
        <button
          type="button"
          className="font-semibold cursor-pointer"
          title="View release notes"
          onClick={() => openGitHubReleaseNotes(appVersion)}
        >
          Gitify v{appVersion}
        </button>
        <div>
          <button
            type="button"
            className={footerButtonClass}
            title="Login with GitHub Enterprise"
            onClick={goToEnterprise}
          >
            <PersonAddIcon
              size={20}
              aria-label="Login with GitHub Enterprise"
            />
          </button>

          <button
            type="button"
            className={footerButtonClass}
            title={`Logout ${accounts.user.login}`}
            role="button"
            onClick={logoutUser}
          >
            <SignOutIcon
              size={18}
              aria-label={`Logout from ${accounts.user.login}`}
            />
          </button>

          <button
            type="button"
            className={`${footerButtonClass} mr-0`}
            title="Quit Gitify"
            onClick={quitApp}
          >
            <XCircleIcon size={18} aria-label="Quit Gitify" />
          </button>
        </div>
      </div>
    </div>
  );
};
