import { useEffect, useState } from 'react';

import { BellIcon, SyncIcon } from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { DEFAULT_SETTINGS_STATE, useSettingsStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { NativeNotificationClickAction, NativeNotificationStyle } from '../../types';

import { VolumeDownIcon } from '../../icons/VolumeDownIcon';
import { VolumeUpIcon } from '../../icons/VolumeUpIcon';
import {
  canDecreaseVolume,
  canIncreaseVolume,
  decreaseVolume,
  increaseVolume,
} from '../../utils/ui/volume';
import { SettingsChoice } from './controls/SettingsChoice';
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
  const nativeNotificationStyle = useSettingsStore((s) => s.nativeNotificationStyle);
  const nativeNotificationActions = useSettingsStore((s) => s.nativeNotificationActions);
  const nativeNotificationKeepVisible = useSettingsStore((s) => s.nativeNotificationKeepVisible);
  const nativeNotificationClickAction = useSettingsStore((s) => s.nativeNotificationClickAction);
  const playSound = useSettingsStore((s) => s.playSound);
  const notificationVolume = useSettingsStore((s) => s.notificationVolume);

  const [nativeNotificationsSupported, setNativeNotificationsSupported] = useState(true);

  useEffect(() => {
    let active = true;

    void window.gitify.nativeNotifications
      .isSupported()
      .then((supported) => {
        if (active) {
          setNativeNotificationsSupported(supported);
        }
      })
      .catch(() => {
        if (active) {
          setNativeNotificationsSupported(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

        {!nativeNotificationsSupported && (
          <Banner
            data-testid="native-notifications-unsupported"
            description="This system does not support native desktop notifications."
            title="Desktop notifications unavailable"
            variant="warning"
          />
        )}

        <SettingsChoice
          label="Notification style"
          name="nativeNotificationStyle"
          onChange={(value) =>
            updateSetting('nativeNotificationStyle', value as NativeNotificationStyle)
          }
          options={[
            { label: 'Individual', value: NativeNotificationStyle.INDIVIDUAL },
            { label: 'Summary', value: NativeNotificationStyle.SUMMARY },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Choose how notifications from a new batch are delivered.</Text>
              <Text>
                <Text as="strong">Individual</Text> shows up to five separate notifications, grouped
                by repository where the platform supports it. A larger batch becomes one summary.
              </Text>
              <Text>
                <Text as="strong">Summary</Text> always shows one notification with the total count.
              </Text>
            </Stack>
          }
          value={nativeNotificationStyle}
        />

        <SettingsToggle
          checked={nativeNotificationActions}
          label="Show notification actions"
          name="nativeNotificationActions"
          onChange={() => toggleSetting('nativeNotificationActions')}
          tooltip="Offer Mark as read, Mark as done, and Unsubscribe actions where the platform and account support them. Clicking a notification opens it."
        />

        <SettingsToggle
          checked={nativeNotificationKeepVisible}
          label="Keep notifications on screen"
          name="nativeNotificationKeepVisible"
          onChange={() => toggleSetting('nativeNotificationKeepVisible')}
          tooltip="Keep notifications visible until dismissed, where the operating system supports it."
        />

        <SettingsChoice
          label="Notification click"
          name="nativeNotificationClickAction"
          onChange={(value) =>
            updateSetting('nativeNotificationClickAction', value as NativeNotificationClickAction)
          }
          options={[
            { label: 'Gitify', value: NativeNotificationClickAction.APP },
            { label: 'Browser', value: NativeNotificationClickAction.BROWSER },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Choose what clicking a notification body opens.</Text>
              <Text>
                <Text as="strong">Gitify</Text> reveals the matching notification in the app.
              </Text>
              <Text>
                <Text as="strong">Browser</Text> opens the notification target in your default
                browser.
              </Text>
              <Text>
                Browser focus is controlled by <Text as="strong">Link focus</Text> in the System
                section.
              </Text>
            </Stack>
          }
          value={nativeNotificationClickAction}
        />

        <SettingsToggle
          checked={playSound}
          label="Play notification sound"
          name="playSound"
          onChange={() => toggleSetting('playSound')}
          tooltip="Play a sound when new unread notifications arrive after filtering. Use the adjacent volume controls to adjust the sound level."
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
          </SettingsRow>
        </SettingsReveal>

        <SettingsToggle
          checked={showUpdateNotifications}
          label="Show app update notifications"
          name="showUpdateNotifications"
          onChange={() => toggleSetting('showUpdateNotifications')}
          tooltip="Show a notification when a Gitify update is ready. Updates are still checked and shown in the menu bar."
        />
      </SettingsList>
    </fieldset>
  );
}
