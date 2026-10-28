import { BellIcon, SyncIcon } from '@primer/octicons-react';
import { Button, ButtonGroup, IconButton } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { VolumeDownIcon } from '../../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../../icons/VolumeUpIcon';
import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/ui/volume';
import { SettingsList } from './controls/SettingsList';
import { SettingsReveal } from './controls/SettingsReveal';
import { SettingsRow } from './controls/SettingsRow';
import { SettingsToggle } from './controls/SettingsToggle';

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

      <SettingsList>
        <SettingsToggle
          checked={showNotifications}
          label="Show desktop notifications"
          name="showNotifications"
          onChange={() => toggleSetting('showNotifications')}
          tooltip="Display native operating system notifications for new unread notifications."
        />

        <SettingsToggle
          checked={playSound}
          label="Play notification sound"
          name="playSound"
          onChange={() => toggleSetting('playSound')}
          tooltip="Play a sound when new unread notifications arrive after filtering. Use the notification volume controls to adjust the sound level."
        />

        <SettingsReveal name="volume" open={playSound}>
          <SettingsRow
            label="Notification volume"
            name="notificationVolume"
            tooltip="Adjust the volume of the notification sound."
          >
            <ButtonGroup data-testid="settings-volume-group">
              <IconButton
                aria-label="Volume down"
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
                icon={SyncIcon}
                onClick={() => {
                  updateSetting('notificationVolume', defaultSettings.notificationVolume);
                }}
                size="small"
                unsafeDisableTooltip={true}
                variant="danger"
              />
            </ButtonGroup>
          </SettingsRow>
        </SettingsReveal>

        <SettingsToggle
          checked={showUpdateNotifications}
          label="Show app update notifications"
          name="showUpdateNotifications"
          onChange={() => toggleSetting('showUpdateNotifications')}
          tooltip={`Show a notification when a ${APPLICATION.NAME} update is ready. Updates are still checked and shown in the menu bar.`}
        />
      </SettingsList>
    </fieldset>
  );
}
