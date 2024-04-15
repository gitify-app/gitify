import {
  ArrowLeftIcon,
  PersonAddIcon,
  SignOutIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { ipcRenderer } from 'electron';

import {
  type FC,
  type MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { Checkbox } from '../components/fields/Checkbox';
import { RadioGroup } from '../components/fields/RadioGroup';
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
  const [repoScope, setRepoScope] = useState<boolean>(false);

  const openGitHubReleaseNotes = useCallback((version) => {
    openExternalLink(
      `https://github.com/${Constants.REPO_SLUG}/releases/tag/v${version}`,
    );
  }, []);

  const openGitHubParticipatingDocs = (event: MouseEvent<HTMLElement>) => {
    // Don't trigger onClick of parent element.
    event.stopPropagation();

    openExternalLink(
      'https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github/setting-up-notifications/configuring-notifications#about-participating-and-watching-notifications',
    );
  };

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
        setRepoScope(true);
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
          <RadioGroup
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
          <Checkbox
            name="detailedNotifications"
            label={`Detailed notifications${
              !repoScope ? ' (requires repo scope)' : ''
            }`}
            checked={repoScope && settings.detailedNotifications}
            onChange={(evt) =>
              repoScope &&
              updateSetting('detailedNotifications', evt.target.checked)
            }
            disabled={!repoScope}
            tooltip={
              <div>
                <div className="pb-3">
                  Enrich notifications with author or last commenter profile
                  information, state and GitHub-like colors.
                </div>
                <div className="text-orange-600">
                  ⚠️ Users with a large number of unread notifications <i>may</i>{' '}
                  experience rate limiting under certain circumstances. Disable
                  this setting if you experience this.
                </div>
              </div>
            }
          />
          <Checkbox
            name="showAccountHostname"
            label="Show account hostname"
            checked={settings.showAccountHostname}
            onChange={(evt) =>
              updateSetting('showAccountHostname', evt.target.checked)
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <legend id="notifications" className="font-semibold mt-2 mb-1">
            Notifications
          </legend>
          <Checkbox
            name="showOnlyParticipating"
            label="Show only participating"
            checked={settings.participating}
            onChange={(evt) =>
              updateSetting('participating', evt.target.checked)
            }
            tooltip={
              <div>
                <div className="pb-3">
                  See{' '}
                  <button
                    type="button"
                    className="text-blue-500"
                    title="Open GitHub documentation for participating and watching notifications"
                    onClick={openGitHubParticipatingDocs}
                  >
                    official docs
                  </button>{' '}
                  for more details.
                </div>
              </div>
            }
          />
          <Checkbox
            name="showBots"
            label="Show notifications from Bot accounts"
            checked={settings.showBots}
            onChange={(evt) => updateSetting('showBots', evt.target.checked)}
          />
          <Checkbox
            name="markAsDoneOnOpen"
            label="Mark as done on open"
            checked={settings.markAsDoneOnOpen}
            onChange={(evt) =>
              updateSetting('markAsDoneOnOpen', evt.target.checked)
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <legend id="system" className="font-semibold mt-2 mb-1">
            System
          </legend>
          <Checkbox
            name="showNotificationsCountInTray"
            label="Show notifications count in tray"
            checked={settings.showNotificationsCountInTray}
            onChange={(evt) =>
              updateSetting('showNotificationsCountInTray', evt.target.checked)
            }
          />
          <Checkbox
            name="showNotifications"
            label="Show system notifications"
            checked={settings.showNotifications}
            onChange={(evt) =>
              updateSetting('showNotifications', evt.target.checked)
            }
          />
          <Checkbox
            name="playSound"
            label="Play sound"
            checked={settings.playSound}
            onChange={(evt) => updateSetting('playSound', evt.target.checked)}
          />
          {!isLinux && (
            <Checkbox
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
            title={`Logout from ${accounts.user.login}`}
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
