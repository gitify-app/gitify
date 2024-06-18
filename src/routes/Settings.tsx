import {
  CheckIcon,
  CommentIcon,
  IssueClosedIcon,
  MilestoneIcon,
  PersonIcon,
  TagIcon,
  XCircleIcon,
} from '@primer/octicons-react';
import { ipcRenderer } from 'electron';
import {
  type FC,
  type MouseEvent,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Checkbox } from '../components/fields/Checkbox';
import { RadioGroup } from '../components/fields/RadioGroup';
import { AppContext } from '../context/App';
import { BUTTON_CLASS_NAME } from '../styles/gitify';
import { Theme } from '../types';
import { getAppVersion, quitApp } from '../utils/comms';
import Constants from '../utils/constants';
import {
  openGitHubParticipatingDocs,
  openGitifyReleaseNotes,
} from '../utils/links';
import { isLinux, isMacOS } from '../utils/platform';
import { setTheme } from '../utils/theme';

export const SettingsRoute: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);
  const navigate = useNavigate();

  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (process.env.NODE_ENV === 'development') {
        setAppVersion('dev');
      } else {
        const result = await getAppVersion();
        setAppVersion(`v${result}`);
      }
    })();

    ipcRenderer.on('gitify:update-theme', (_, updatedTheme: Theme) => {
      if (settings.theme === Theme.SYSTEM) {
        setTheme(updatedTheme);
      }
    });
  }, [settings.theme]);

  return (
    <div className="flex h-screen flex-col" data-testid="settings">
      <Header>Settings</Header>
      <div className="flex-grow overflow-x-auto px-8">
        <fieldset className="mb-3">
          <legend id="appearance" className="mb-1 mt-2 font-semibold">
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
            label="Detailed notifications"
            checked={settings.detailedNotifications}
            onChange={(evt) =>
              updateSetting('detailedNotifications', evt.target.checked)
            }
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
            name="showPills"
            label="Show notification metric pills"
            checked={settings.showPills}
            onChange={(evt) => updateSetting('showPills', evt.target.checked)}
            tooltip={
              <div>
                <div>Show notification metric pills for:</div>
                <div className="pl-6">
                  <ul className="list-disc">
                    <li>
                      <IssueClosedIcon size={16} className="pr-1" />
                      linked issues
                    </li>
                    <li>
                      <CheckIcon size={16} className="pr-1" /> pr reviews
                    </li>
                    <li>
                      <CommentIcon size={16} className="pr-1" />
                      comments
                    </li>

                    <li>
                      <TagIcon size={16} className="pr-1" />
                      labels
                    </li>
                    <li>
                      <MilestoneIcon size={16} className="pr-1" />
                      milestones
                    </li>
                  </ul>
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
          <legend id="notifications" className="mb-1 mt-2 font-semibold">
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
                See
                <button
                  type="button"
                  className="mx-1 text-blue-500"
                  title="Open GitHub documentation for participating and watching notifications"
                  onClick={(event: MouseEvent<HTMLElement>) => {
                    // Don't trigger onClick of parent element.
                    event.stopPropagation();
                    openGitHubParticipatingDocs();
                  }}
                >
                  official docs
                </button>
                for more details.
              </div>
            }
          />
          <Checkbox
            name="showBots"
            label="Show notifications from Bot accounts"
            checked={!settings.detailedNotifications || settings.showBots}
            onChange={(evt) =>
              settings.detailedNotifications &&
              updateSetting('showBots', evt.target.checked)
            }
            disabled={!settings.detailedNotifications}
            tooltip={
              <div>
                <div className="pb-3">
                  Show or hide notifications from Bot accounts, such as
                  @dependabot, @renovatebot, etc
                </div>
                <div className="text-orange-600">
                  ⚠️ This setting requires{' '}
                  <strong>Detailed Notifications</strong> to be enabled.
                </div>
              </div>
            }
          />
          <Checkbox
            name="markAsDoneOnOpen"
            label="Mark as done on open"
            checked={settings.markAsDoneOnOpen}
            onChange={(evt) =>
              updateSetting('markAsDoneOnOpen', evt.target.checked)
            }
          />
          <Checkbox
            name="delayNotificationState"
            label="Delay notification state"
            checked={settings.delayNotificationState}
            onChange={(evt) =>
              updateSetting('delayNotificationState', evt.target.checked)
            }
            tooltip={
              <div>
                Keep the notification within Gitify window upon interaction
                (click, mark as read, mark as done, etc) until the next refresh
                window (scheduled or user initiated).
              </div>
            }
          />
        </fieldset>

        <fieldset className="mb-3">
          <legend id="system" className="mb-1 mt-2 font-semibold">
            System
          </legend>
          <Checkbox
            name="kbdShortcutEnabled"
            label="Enable keyboard shortcut"
            checked={!!settings.keyboardShortcut}
            onChange={(evt) =>
              updateSetting('keyboardShortcut', evt.target.checked)
            }
            tooltip={
              <div>
                When enabled you can choose to use the hotkeys{' '}
                <span className="text-orange-600">
                  {Constants.DEFAULT_KEYBOARD_SHORTCUT}
                </span>{' '}
                to show or hide Gitify.
              </div>
            }
          />
          {isMacOS() && (
            <Checkbox
              name="showNotificationsCountInTray"
              label="Show notifications count in tray"
              checked={settings.showNotificationsCountInTray}
              onChange={(evt) =>
                updateSetting(
                  'showNotificationsCountInTray',
                  evt.target.checked,
                )
              }
            />
          )}
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
          {!isLinux() && (
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

      <div className="flex items-center justify-between bg-gray-200 px-8 py-1 text-sm dark:bg-gray-darker">
        <button
          type="button"
          className="cursor-pointer font-semibold"
          title="View release notes"
          onClick={() => openGitifyReleaseNotes(appVersion)}
        >
          <span title="app-version">Gitify {appVersion}</span>
        </button>
        <div>
          <button
            type="button"
            className={BUTTON_CLASS_NAME}
            title="Accounts"
            onClick={() => {
              navigate('/accounts');
            }}
          >
            <PersonIcon size={18} aria-label="Accounts" />
          </button>

          <button
            type="button"
            className={BUTTON_CLASS_NAME}
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
