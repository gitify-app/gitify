import { useTranslation } from 'react-i18next';

import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';
import { isTrayIconAppearance } from '../../../shared/events';

import { useSettingsStore } from '../../stores';

import { SectionHeading } from '../primitives/SectionHeading';

import { SettingsChoice } from './controls/SettingsChoice';
import { SettingsList } from './controls/SettingsList';
import { SettingsToggle } from './controls/SettingsToggle';

export function TraySettings() {
  const { t } = useTranslation();
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);

  // Setting store values
  const showNotificationsCountInTray = useSettingsStore((s) => s.showNotificationsCountInTray);
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const trayIconAppearance = useSettingsStore((s) => s.trayIconAppearance);

  return (
    <fieldset>
      <SectionHeading as="legend" icon={DevicesIcon}>
        {t('settings.tray.title', 'Tray')}
      </SectionHeading>

      <SettingsList>
        <SettingsToggle
          checked={showNotificationsCountInTray}
          label={t('settings.tray.show_notification_count', 'Show notification count')}
          name="showNotificationsCountInTray"
          onChange={() => toggleSetting('showNotificationsCountInTray')}
          tooltip={t(
            'settings.tray.show_notification_count_help',
            'Show the unread notification count next to the tray icon. Useful for a quick glance at unread activity.',
          )}
          visible={window.gitify.platform.isMacOS()}
        />

        <SettingsToggle
          checked={useUnreadActiveIcon}
          label={t('settings.tray.highlight_unread', 'Highlight unread notifications')}
          name="useUnreadActiveIcon"
          onChange={() => toggleSetting('useUnreadActiveIcon')}
          tooltip={t(
            'settings.tray.highlight_unread_help',
            'Turn the {{appName}} logo green while there are unread notifications.',
            { appName: APPLICATION.NAME },
          )}
        />

        <SettingsChoice
          label={t('settings.tray.idle_icon', 'Idle icon')}
          name="trayIconAppearance"
          onChange={(value) => {
            if (isTrayIconAppearance(value)) {
              updateSetting('trayIconAppearance', value);
            }
          }}
          options={[
            { label: t('settings.tray.idle_icon_automatic', 'Automatic'), value: 'auto' },
            { label: t('settings.tray.idle_icon_light', 'Light'), value: 'light' },
            { label: t('settings.tray.idle_icon_dark', 'Dark'), value: 'dark' },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t(
                  'settings.tray.idle_icon_help',
                  'Pick a light icon for dark panels or a dark icon for light panels.',
                )}
              </Text>
              <Text>
                {t(
                  'settings.tray.idle_icon_help_automatic',
                  'Automatic follows the tray appearance on macOS and Windows; Linux uses light because panel detection is unreliable.',
                )}
              </Text>
              <Text>
                {t(
                  'settings.tray.idle_icon_help_theme',
                  'This setting is independent of the {{appName}} app theme.',
                  { appName: APPLICATION.NAME },
                )}
              </Text>
            </Stack>
          }
          value={trayIconAppearance}
        />
      </SettingsList>
    </fieldset>
  );
}
