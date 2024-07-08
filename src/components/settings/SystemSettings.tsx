import { DeviceDesktopIcon } from '@primer/octicons-react';
import { type FC, useContext } from 'react';
import { AppContext } from '../../context/App';
import Constants from '../../utils/constants';
import { isLinux, isMacOS } from '../../utils/platform';
import { Checkbox } from '../fields/Checkbox';

export const SystemSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  return (
    <fieldset>
      <legend id="system" className="mb-1 mt-2 font-semibold">
        <DeviceDesktopIcon className="mr-2" />
        System
      </legend>
      <Checkbox
        name="kbdShortcutEnabled"
        label="Enable keyboard shortcut"
        checked={settings.keyboardShortcut}
        onChange={(evt) =>
          updateSetting('keyboardShortcut', evt.target.checked)
        }
        tooltip={
          <div>
            When enabled you can use the hotkeys{' '}
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
            updateSetting('showNotificationsCountInTray', evt.target.checked)
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
          onChange={(evt) => updateSetting('openAtStartup', evt.target.checked)}
        />
      )}
    </fieldset>
  );
};
