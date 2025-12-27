import type { FC } from 'react';

import { DeviceDesktopIcon, SyncIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../shared/constants';

import { useAppContext } from '../../context/App';
import { defaultSettings } from '../../context/defaults';
import { OpenPreference } from '../../types';
import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/notifications/sound';
import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { VolumeDownIcon } from '../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../icons/VolumeUpIcon';
import { Title } from '../primitives/Title';

export const SystemSettings: FC = () => {
  const { settings, updateSetting } = useAppContext();

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
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Controls the behavior of how external links should opened.
              </Text>
              <Text>
                <Text as="strong">Foreground</Text> will open the link and bring
                the opened window or browser to the front.
              </Text>
              <Text>
                <Text as="strong">Background</Text> opens the link without
                stealing focus from the current window.
              </Text>
            </Stack>
          }
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
            <div>
              When enabled you can use the hotkeys{' '}
              <Text as="strong" className="text-gitify-caution">
                {APPLICATION.DEFAULT_KEYBOARD_SHORTCUT}
              </Text>{' '}
              to show or hide {APPLICATION.NAME}.
            </div>
          }
        />

        <Checkbox
          checked={settings.showNotifications}
          label="Show system notifications"
          name="showNotifications"
          onChange={(evt) =>
            updateSetting('showNotifications', evt.target.checked)
          }
          tooltip={
            <Text>
              Display native operating system notifications for new unread
              notifications.
            </Text>
          }
        />

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
              disabled={!canDecreaseVolume(settings.notificationVolume)}
              icon={VolumeDownIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  decreaseVolume(settings.notificationVolume),
                );
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
              disabled={!canIncreaseVolume(settings.notificationVolume)}
              icon={VolumeUpIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  increaseVolume(settings.notificationVolume),
                );
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

        <Checkbox
          checked={settings.openAtStartup}
          label="Open at startup"
          name="openAtStartup"
          onChange={(evt) => updateSetting('openAtStartup', evt.target.checked)}
          tooltip={
            <Text>Launch {APPLICATION.NAME} automatically at startup.</Text>
          }
          visible={
            typeof window !== 'undefined' && window.gitify !== undefined
              ? !window.gitify.platform.isLinux()
              : true
          }
        />
      </Stack>
    </fieldset>
  );
};
