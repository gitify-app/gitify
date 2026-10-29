import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BellIcon, SyncIcon } from '@primer/octicons-react';
import { Banner, Button, ButtonGroup, IconButton, Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

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
  const { t } = useTranslation();
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

  const isMacOS = window.gitify.platform.isMacOS();
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
        {t('settings.alerts.title', 'Alerts')}
      </SectionHeading>

      <SettingsList>
        <SettingsToggle
          checked={showNotifications}
          label={t('settings.alerts.show_desktop', 'Show desktop notifications')}
          name="showNotifications"
          onChange={() => toggleSetting('showNotifications')}
          tooltip={t(
            'settings.alerts.show_desktop_help',
            'Display native operating system notifications for new unread notifications.',
          )}
        />

        {!nativeNotificationsSupported && (
          <Banner
            data-testid="native-notifications-unsupported"
            description={t(
              'settings.alerts.unsupported_description',
              'This system does not support native desktop notifications.',
            )}
            title={t('settings.alerts.unsupported_title', 'Desktop notifications unavailable')}
            variant="warning"
          />
        )}

        <SettingsChoice
          label={t('settings.alerts.style', 'Notification style')}
          name="nativeNotificationStyle"
          onChange={(value) =>
            updateSetting('nativeNotificationStyle', value as NativeNotificationStyle)
          }
          options={[
            {
              label: t('settings.alerts.style_individual', 'Individual'),
              value: NativeNotificationStyle.INDIVIDUAL,
            },
            {
              label: t('settings.alerts.style_summary', 'Summary'),
              value: NativeNotificationStyle.SUMMARY,
            },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t(
                  'settings.alerts.style_help',
                  'Choose how notifications from a new batch are delivered.',
                )}
              </Text>
              <Text>
                <Trans
                  components={[<Text as="strong" key={0} />]}
                  defaults="<0>Individual</0> shows up to five separate notifications, grouped by repository where the platform supports it. A larger batch becomes one summary."
                  i18nKey="settings.alerts.style_individual_help"
                />
              </Text>
              <Text>
                <Trans
                  components={[<Text as="strong" key={0} />]}
                  defaults="<0>Summary</0> always shows one notification with the total count."
                  i18nKey="settings.alerts.style_summary_help"
                />
              </Text>
            </Stack>
          }
          value={nativeNotificationStyle}
        />

        <SettingsToggle
          checked={nativeNotificationActions}
          label={t('settings.alerts.actions', 'Show notification actions')}
          name="nativeNotificationActions"
          onChange={() => toggleSetting('nativeNotificationActions')}
          tooltip={t(
            'settings.alerts.actions_help',
            'Offer Mark as read, Mark as done, and Unsubscribe actions where the platform and account support them. Clicking a notification opens it.',
          )}
        />

        {/* macOS decides how long notifications stay on screen (System Settings →
            Notifications), so the toggle only applies on Windows and Linux. */}
        {!isMacOS && (
          <SettingsToggle
            checked={nativeNotificationKeepVisible}
            label={t('settings.alerts.keep_visible', 'Keep notifications on screen')}
            name="nativeNotificationKeepVisible"
            onChange={() => toggleSetting('nativeNotificationKeepVisible')}
            tooltip={t(
              'settings.alerts.keep_visible_help',
              'Keep notifications visible until you dismiss them.',
            )}
          />
        )}

        <SettingsChoice
          label={t('settings.alerts.click', 'Notification click')}
          name="nativeNotificationClickAction"
          onChange={(value) =>
            updateSetting('nativeNotificationClickAction', value as NativeNotificationClickAction)
          }
          options={[
            { label: APPLICATION.NAME, value: NativeNotificationClickAction.APP },
            {
              label: t('settings.alerts.click_browser', 'Browser'),
              value: NativeNotificationClickAction.BROWSER,
            },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t('settings.alerts.click_help', 'Choose what clicking a notification body opens.')}
              </Text>
              <Text>
                <Trans
                  components={[<Text as="strong" key={0} />]}
                  defaults="<0>{{appName}}</0> reveals the matching notification in the app."
                  i18nKey="settings.alerts.click_app_help"
                  values={{ appName: APPLICATION.NAME }}
                />
              </Text>
              <Text>
                <Trans
                  components={[<Text as="strong" key={0} />]}
                  defaults="<0>Browser</0> opens the notification target in your default browser."
                  i18nKey="settings.alerts.click_browser_help"
                />
              </Text>
              <Text>
                <Trans
                  components={[<Text as="strong" key={0} />]}
                  defaults="Browser focus is controlled by <0>Link focus</0> in the System section."
                  i18nKey="settings.alerts.click_focus_help"
                />
              </Text>
            </Stack>
          }
          value={nativeNotificationClickAction}
        />

        <SettingsToggle
          checked={playSound}
          label={t('settings.alerts.play_sound', 'Play notification sound')}
          name="playSound"
          onChange={() => toggleSetting('playSound')}
          tooltip={t(
            'settings.alerts.play_sound_help',
            'Play a sound when new unread notifications arrive after filtering. Use the adjacent volume controls to adjust the sound level.',
          )}
        />

        <SettingsReveal name="volume" open={playSound}>
          <SettingsRow
            label={t('settings.alerts.volume', 'Notification volume')}
            name="notificationVolume"
            tooltip={t(
              'settings.alerts.volume_help',
              'Adjust the volume of the notification sound.',
            )}
          >
            <ButtonGroup data-testid="settings-volume-group">
              <IconButton
                aria-label={t('settings.alerts.volume_down', 'Volume down')}
                disabled={!canDecreaseVolume(notificationVolume)}
                icon={VolumeDownIcon}
                onClick={() => {
                  updateSetting('notificationVolume', decreaseVolume(notificationVolume));
                }}
                size="small"
                unsafeDisableTooltip={true}
              />

              <Button
                aria-label={t('settings.alerts.volume_percentage', 'Volume percentage')}
                className="pointer-events-none"
                size="small"
                tabIndex={-1}
              >
                {notificationVolume.toFixed(0)}%
              </Button>

              <IconButton
                aria-label={t('settings.alerts.volume_up', 'Volume up')}
                disabled={!canIncreaseVolume(notificationVolume)}
                icon={VolumeUpIcon}
                onClick={() => {
                  updateSetting('notificationVolume', increaseVolume(notificationVolume));
                }}
                size="small"
                unsafeDisableTooltip={true}
              />

              <IconButton
                aria-label={t('settings.alerts.volume_reset', 'Reset volume')}
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
          label={t('settings.alerts.show_updates', 'Show app update notifications')}
          name="showUpdateNotifications"
          onChange={() => toggleSetting('showUpdateNotifications')}
          tooltip={t(
            'settings.alerts.show_updates_help',
            'Show a notification when a {{appName}} update is ready. Updates are still checked and shown in the menu bar.',
            { appName: APPLICATION.NAME },
          )}
        />
      </SettingsList>
    </fieldset>
  );
}
