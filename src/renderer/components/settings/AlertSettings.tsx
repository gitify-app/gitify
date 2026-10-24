import { BellIcon, SyncIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

import { VolumeDownIcon } from '../../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../../icons/VolumeUpIcon';
import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/ui/volume';

const defaultSettings = DEFAULT_SETTINGS_STATE;

export function AlertSettings() {
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const showNotifications = useSettingsStore((s) => s.showNotifications);
  const playSound = useSettingsStore((s) => s.playSound);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  return (
    <fieldset>
      <Title icon={BellIcon}>Alerts</Title>

      <Stack direction="vertical" gap="condensed">
        <Checkbox
          checked={showNotifications}
          label="Show system notifications"
          name="showNotifications"
          onChange={() => toggleSetting('showNotifications')}
          tooltip={
            <Text>Display native operating system notifications for new unread notifications.</Text>
          }
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <Checkbox
            checked={playSound}
            label="Play sound"
            name="playSound"
            onChange={() => toggleSetting('playSound')}
          />

          <ButtonGroup className="ml-2" data-testid="settings-volume-group" hidden={!playSound}>
            <IconButton
              aria-label="Volume down"
              data-testid="settings-volume-down"
              disabled={!canDecreaseVolume(notificationVolume)}
              icon={VolumeDownIcon}
              onClick={() => {
                updateSetting('notificationVolume', decreaseVolume(notificationVolume));
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <Button
              aria-label="Volume percentage"
              className="pointer-events-none"
              size="small"
              tabIndex={-1}
            >
              {notificationVolume.toFixed(0)}%
            </Button>

            <IconButton
              aria-label="Volume up"
              data-testid="settings-volume-up"
              disabled={!canIncreaseVolume(notificationVolume)}
              icon={VolumeUpIcon}
              onClick={() => {
                updateSetting('notificationVolume', increaseVolume(notificationVolume));
              }}
              size="small"
              unsafeDisableTooltip={true}
            />

            <IconButton
              aria-label="Reset volume"
              data-testid="settings-volume-reset"
              icon={SyncIcon}
              onClick={() => {
                updateSetting('notificationVolume', defaultSettings.notificationVolume);
              }}
              size="small"
              unsafeDisableTooltip={true}
              variant="danger"
            />
          </ButtonGroup>
        </Stack>
      </Stack>
    </fieldset>
  );
}
