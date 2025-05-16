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
import { isLinux, isMacOS } from '../../../shared/platform';
import { AppContext, defaultSettings } from '../../context/App';
import { OpenPreference } from '../../types';
import { Constants } from '../../utils/constants';
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
          name="openLinks"
          label="Open Links:"
          value={settings.openLinks}
          options={[
            { label: 'Foreground', value: OpenPreference.FOREGROUND },
            { label: 'Background', value: OpenPreference.BACKGROUND },
          ]}
          onChange={(evt) => {
            updateSetting('openLinks', evt.target.value as OpenPreference);
          }}
        />

        <Checkbox
          name="keyboardShortcut"
          label="Enable keyboard shortcut"
          checked={settings.keyboardShortcut}
          onChange={(evt) =>
            updateSetting('keyboardShortcut', evt.target.checked)
          }
          tooltip={
            <Box>
              When enabled you can use the hotkeys{' '}
              <Text as="strong" className="text-gitify-caution">
                {Constants.DEFAULT_KEYBOARD_SHORTCUT}
              </Text>{' '}
              to show or hide {APPLICATION.NAME}.
            </Box>
          }
        />

        <Checkbox
          name="showNotificationsCountInTray"
          label="Show notification count in tray"
          checked={settings.showNotificationsCountInTray}
          visible={isMacOS()}
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

        <Box>
          <Stack
            direction="horizontal"
            gap="condensed"
            align="center"
            className="text-sm"
          >
            <Checkbox
              name="playSound"
              label="Play sound"
              checked={settings.playSound}
              onChange={(evt) => updateSetting('playSound', evt.target.checked)}
            />

            <ButtonGroup
              className="ml-2"
              hidden={!settings.playSound}
              data-testid="settings-volume-group"
            >
              <IconButton
                aria-label="Volume down"
                size="small"
                icon={VolumeDownIcon}
                unsafeDisableTooltip={true}
                onClick={() => {
                  const newVolume = Math.max(
                    settings.notificationVolume - 10,
                    0,
                  );
                  updateSetting('notificationVolume', newVolume);
                }}
                data-testid="settings-volume-down"
              />

              <Button aria-label="Volume percentage" size="small" disabled>
                {settings.notificationVolume.toFixed(0)}%
              </Button>

              <IconButton
                aria-label="Volume up"
                size="small"
                icon={VolumeUpIcon}
                unsafeDisableTooltip={true}
                onClick={() => {
                  const newVolume = Math.min(
                    settings.notificationVolume + 10,
                    100,
                  );
                  updateSetting('notificationVolume', newVolume);
                }}
                data-testid="settings-volume-up"
              />

              <IconButton
                aria-label="Reset volume"
                size="small"
                variant="danger"
                icon={SyncIcon}
                unsafeDisableTooltip={true}
                onClick={() => {
                  updateSetting(
                    'notificationVolume',
                    defaultSettings.notificationVolume,
                  );
                }}
                data-testid="settings-volume-reset"
              />
            </ButtonGroup>
          </Stack>
        </Box>

        <Checkbox
          name="useAlternateIdleIcon"
          label="Use alternate idle icon"
          checked={settings.useAlternateIdleIcon}
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
          name="openAtStartup"
          label="Open at startup"
          checked={settings.openAtStartup}
          visible={!isLinux()}
          onChange={(evt) => updateSetting('openAtStartup', evt.target.checked)}
        />
      </Stack>
    </fieldset>
  );
};
