import { BellIcon, SyncIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { SectionHeading } from '../primitives/SectionHeading';

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
  const showUpdateNotifications = useSettingsStore((s) => s.showUpdateNotifications);
  const playSound = useSettingsStore((s) => s.playSound);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  return (
    <fieldset>
      <SectionHeading as="legend" icon={BellIcon}>
        Alerts
      </SectionHeading>

      <Stack direction="vertical" gap="condensed">
        <Checkbox
          checked={showNotifications}
          label="Show desktop notifications"
          name="showNotifications"
          onChange={() => toggleSetting('showNotifications')}
          tooltip={
            <Text>Display native operating system notifications for new unread notifications.</Text>
          }
        />

        <Stack align="center" className="text-sm" direction="horizontal" gap="condensed">
          <Checkbox
            checked={playSound}
            label="Play notification sound"
            name="playSound"
            onChange={() => toggleSetting('playSound')}
            tooltip={
              <Text>
                Play a sound when new unread notifications arrive after filtering. Use the adjacent
                volume controls to adjust the sound level.
              </Text>
            }
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

        <Checkbox
          checked={showUpdateNotifications}
          label="Show app update notifications"
          name="showUpdateNotifications"
          onChange={() => toggleSetting('showUpdateNotifications')}
          tooltip={
            <Text>
              Show a notification when a {APPLICATION.NAME} update is ready. Updates will still be
              checked and shown in the menu bar.
            </Text>
          }
        />
      </Stack>
    </fieldset>
  );
}
