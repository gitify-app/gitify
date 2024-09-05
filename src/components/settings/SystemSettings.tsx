import { DeviceDesktopIcon } from '@primer/octicons-react';
import { type FC, useContext } from 'react';
import { AppContext } from '../../context/App';
import type { OpenPreference } from '../../types';
import { Constants } from '../../utils/constants';
import { isLinux, isMacOS } from '../../utils/platform';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Legend } from './Legend';

export const SystemSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  return (
    <fieldset>
      <Legend icon={DeviceDesktopIcon}>System</Legend>
      <RadioGroup
        name="openLinks"
        label="Open Links:"
        value={settings.openLinks}
        options={[
          { label: 'Foreground', value: 'FOREGROUND' },
          { label: 'Background', value: 'BACKGROUND' },
        ]}
        onChange={(evt) => {
          updateSetting('openLinks', evt.target.value as OpenPreference);
        }}
      />
      <Checkbox
        name="keyboardShortcutEnabled"
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
      <Checkbox
        name="useAlternateIdleIcon"
        label="Use alternate idle icon"
        checked={settings.useAlternateIdleIcon}
        onChange={(evt) =>
          updateSetting('useAlternateIdleIcon', evt.target.checked)
        }
        tooltip={
          <div>
            Use a white Gitify logo (instead of the default black logo) when all
            notifications are read. Particularly useful for devices which have a
            dark-themed menubar or taskbar.
          </div>
        }
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
