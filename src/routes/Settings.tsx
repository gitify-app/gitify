import {
  ArrowLeftIcon,
  PersonAddIcon,
  SignOutIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { ipcRenderer } from 'electron';
import React, {
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
import { Appearance } from '../types';
import { apiRequestAuth } from '../utils/api-requests';
import { setAppearance } from '../utils/appearance';
import { openExternalLink, updateTrayIcon } from '../utils/comms';
import Constants from '../utils/constants';
import { generateGitHubAPIUrl } from '../utils/helpers';

export const SettingsRoute: React.FC = () => {
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

  ipcRenderer.on('update-native-theme', (_, updatedAppearance: Appearance) => {
    if (settings.appearance === Appearance.SYSTEM) {
      setAppearance(updatedAppearance);
    }
  });

  const logoutUser = useCallback(() => {
    logout();
    navigate(-1);
    updateTrayIcon();
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
      className="flex flex-1 flex-col dark:bg-gray-dark dark:text-white"
      data-testid="settings"
    >
      <div className="flex justify-between items-center mt-4 py-2 mx-8">
        <button
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

      <div className="flex-1 px-8">
        <FieldRadioGroup
          name="appearance"
          label="Appearance"
          value={settings.appearance}
          options={[
            { label: 'System', value: Appearance.SYSTEM },
            { label: 'Light', value: Appearance.LIGHT },
            { label: 'Dark', value: Appearance.DARK },
          ]}
          onChange={(evt) => {
            updateSetting('appearance', evt.target.value);
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
          name="showOnlyParticipating"
          label="Show only participating"
          checked={settings.participating}
          onChange={(evt) => updateSetting('participating', evt.target.checked)}
        />

        <FieldCheckbox
          name="showNotifications"
          label="Show notifications"
          checked={settings.showNotifications}
          onChange={(evt) =>
            updateSetting('showNotifications', evt.target.checked)
          }
        />
        <FieldCheckbox
          name="markAsDoneOnOpen"
          label="Mark as done on open"
          checked={settings.markAsDoneOnOpen}
          onChange={(evt) =>
            updateSetting('markAsDoneOnOpen', evt.target.checked)
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
      </div>

      <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-darker py-4 px-8">
        <small
          className="font-semibold cursor-pointer"
          title="View release notes"
          onClick={() => openGitHubReleaseNotes(appVersion)}
        >
          Gitify v{appVersion}
        </small>
        <div>
          <button
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
            className={footerButtonClass}
            title="Logout"
            onClick={logoutUser}
          >
            <SignOutIcon size={18} aria-label="Logout" />
          </button>

          <button
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
