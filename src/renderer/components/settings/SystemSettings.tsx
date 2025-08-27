import { type FC, useContext } from 'react';

import { DeviceDesktopIcon, SyncIcon } from '@primer/octicons-react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Stack,
  Text,
} from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { AppContext } from '../../context/App';
import { defaultSettings } from '../../context/defaults';
import { OpenPreference } from '../../types';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { VolumeDownIcon } from '../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../icons/VolumeUpIcon';
import { Title } from '../primitives/Title';

export const SystemSettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

  return (
    <fieldset>
      <Title icon={DeviceDesktopIcon}>System</Title>

      <Stack direction="vertical" gap="condensed">
        <RadioGroup
          label="Open Links:"
          name="openLinks"
          onChange={(evt) => {
            updateSetting('openLinks', evt.target.value as OpenPreference);
          }}
          options={[
            { label: 'Foreground', value: OpenPreference.FOREGROUND },
            { label: 'Background', value: OpenPreference.BACKGROUND },
          ]}
          value={settings.openLinks}
        />

        <Checkbox
          checked={settings.keyboardShortcut}
          label="Enable keyboard shortcut"
          name="keyboardShortcut"
          onChange={(evt) =>
            updateSetting('keyboardShortcut', evt.target.checked)
          }
          tooltip={
            <Box>
              When enabled you can use the hotkeys{' '}
              <Text as="strong" className="text-gitify-caution">
                {APPLICATION.DEFAULT_KEYBOARD_SHORTCUT}
              </Text>{' '}
              to show or hide {APPLICATION.NAME}.
            </Box>
          }
        />

        <Checkbox
          checked={settings.showNotificationsCountInTray}
          label="Show notification count in tray"
          name="showNotificationsCountInTray"
          onChange={(evt) =>
            updateSetting('showNotificationsCountInTray', evt.target.checked)
          }
          visible={window.gitify.platform.isMacOS()}
        />

        <Checkbox
          checked={settings.showNotifications}
          label="Show system notifications"
          name="showNotifications"
          onChange={(evt) =>
            updateSetting('showNotifications', evt.target.checked)
          }
        />

        <Box>
          <Stack
            align="center"
            className="text-sm"
            direction="horizontal"
            gap="condensed"
          >
            <Checkbox
              checked={settings.playSound}
              label="Play sound"
              name="playSound"
              onChange={(evt) => updateSetting('playSound', evt.target.checked)}
            />

            <ButtonGroup
              className="ml-2"
              data-testid="settings-volume-group"
              hidden={!settings.playSound}
            >
              <IconButton
                aria-label="Volume down"
                data-testid="settings-volume-down"
                icon={VolumeDownIcon}
                onClick={() => {
                  const newVolume = Math.max(
                    settings.notificationVolume - 10,
                    10,
                  );
                  updateSetting('notificationVolume', newVolume);
                }}
                size="small"
                unsafeDisableTooltip={true}
              />

              <Button aria-label="Volume percentage" disabled size="small">
                {settings.notificationVolume.toFixed(0)}%
              </Button>

              <IconButton
                aria-label="Volume up"
                data-testid="settings-volume-up"
                icon={VolumeUpIcon}
                onClick={() => {
                  const newVolume = Math.min(
                    settings.notificationVolume + 10,
                    100,
                  );
                  updateSetting('notificationVolume', newVolume);
                }}
                size="small"
                unsafeDisableTooltip={true}
              />

              <IconButton
                aria-label="Reset volume"
                data-testid="settings-volume-reset"
                icon={SyncIcon}
                onClick={() => {
                  updateSetting(
                    'notificationVolume',
                    defaultSettings.notificationVolume,
                  );
                }}
                size="small"
                unsafeDisableTooltip={true}
                variant="danger"
              />
            </ButtonGroup>
          </Stack>
        </Box>

        <Checkbox
          checked={settings.useAlternateIdleIcon}
          label="Use alternate idle icon"
          name="useAlternateIdleIcon"
          onChange={(evt) =>
            updateSetting('useAlternateIdleIcon', evt.target.checked)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Use a white {APPLICATION.NAME} logo (instead of the default
                black logo) when all notifications are read.
              </Text>
              <Text>
                This is particularly useful for devices which have a dark-themed
                menubar or taskbar.
              </Text>
            </Stack>
          }
        />

        <Checkbox
          checked={settings.openAtStartup}
          label="Open at startup"
          name="openAtStartup"
          onChange={(evt) => updateSetting('openAtStartup', evt.target.checked)}
          visible={!window.gitify.platform.isLinux()}
        />
      </Stack>
    </fieldset>
  );
};
