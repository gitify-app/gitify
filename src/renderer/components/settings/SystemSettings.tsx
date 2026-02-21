import type { FC } from 'react';

import { DeviceDesktopIcon, SyncIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { OpenPreference, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/notifications/sound';
import { VolumeDownIcon } from '../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../icons/VolumeUpIcon';

export const SystemSettings: FC = () => {
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const openLinks = useSettingsStore((s) => s.openLinks);
  const keyboardShortcutEnabled = useSettingsStore((s) => s.keyboardShortcut);
  const showSystemNotifications = useSettingsStore((s) => s.showNotifications);
  const playSoundNewNotifications = useSettingsStore((s) => s.playSound);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);
  const openAtStartup = useSettingsStore((s) => s.openAtStartup);

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
          value={openLinks}
        />

        <Checkbox
          checked={keyboardShortcutEnabled}
          label="Enable keyboard shortcut"
          name="keyboardShortcut"
          onChange={() =>
            updateSetting('keyboardShortcut', !keyboardShortcutEnabled)
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
          checked={showSystemNotifications}
          label="Show system notifications"
          name="showNotifications"
          onChange={() =>
            updateSetting('showNotifications', !showSystemNotifications)
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
            checked={playSoundNewNotifications}
            label="Play sound"
            name="playSound"
            onChange={() =>
              updateSetting('playSound', !playSoundNewNotifications)
            }
          />

          <ButtonGroup
            className="ml-2"
            data-testid="settings-volume-group"
            hidden={!playSoundNewNotifications}
          >
            <IconButton
              aria-label="Volume down"
              data-testid="settings-volume-down"
              disabled={!canDecreaseVolume(notificationVolume)}
              icon={VolumeDownIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  decreaseVolume(notificationVolume),
                );
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button aria-label="Volume percentage" disabled size="small">
              {notificationVolume.toFixed(0)}%
            </Button>

            <IconButton
              aria-label="Volume up"
              data-testid="settings-volume-up"
              disabled={!canIncreaseVolume(notificationVolume)}
              icon={VolumeUpIcon}
              onClick={() => {
                updateSetting(
                  'notificationVolume',
                  increaseVolume(notificationVolume),
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
                  useSettingsStore.getInitialState().notificationVolume,
                );
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>

        <Checkbox
          checked={openAtStartup}
          label="Open at startup"
          name="openAtStartup"
          onChange={() => updateSetting('openAtStartup', !openAtStartup)}
          tooltip={
            <Text>Launch {APPLICATION.NAME} automatically at startup.</Text>
          }
          visible={!window.gitify.platform.isLinux()}
        />
      </Stack>
    </fieldset>
  );
};
