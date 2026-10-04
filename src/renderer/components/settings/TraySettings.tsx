import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';
import { isTrayIconAppearance } from '../../../shared/events';

import { useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

export const TraySettings: FC = () => {
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
      <Title icon={DevicesIcon}>{t('settings.tray.title', 'Tray')}</Title>

      <Stack direction="vertical" gap="condensed">
        <Checkbox
          checked={showNotificationsCountInTray}
          label={t('settings.tray.show_notification_count', 'Show notification count')}
          name="showNotificationsCountInTray"
          onChange={() => toggleSetting('showNotificationsCountInTray')}
          tooltip={
            <Text>
              {t(
                'settings.tray.show_notification_count_help',
                'Show the unread notification count next to the tray icon. Useful for a quick glance at unread activity.',
              )}
            </Text>
          }
          visible={window.gitify.platform.isMacOS()}
        />

        <Checkbox
          checked={useUnreadActiveIcon}
          label={t('settings.tray.highlight_unread', 'Highlight unread notifications')}
          name="useUnreadActiveIcon"
          onChange={() => toggleSetting('useUnreadActiveIcon')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t(
                  'settings.tray.highlight_unread_help',
                  'Use a green {{appName}} logo when there are unread notifications.',
                  { appName: APPLICATION.NAME },
                )}
              </Text>
            </Stack>
          }
        />

        <RadioGroup
          label={t('settings.tray.idle_icon', 'Idle icon')}
          name="trayIconAppearance"
          value={trayIconAppearance}
          options={[
            { label: t('settings.tray.idle_icon_automatic', 'Automatic'), value: 'auto' },
            { label: t('settings.tray.idle_icon_light', 'Light'), value: 'light' },
            { label: t('settings.tray.idle_icon_dark', 'Dark'), value: 'dark' },
          ]}
          onChange={(event) => {
            const value = event.target.value;
            if (isTrayIconAppearance(value)) {
              updateSetting('trayIconAppearance', value);
            }
          }}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                {t(
                  'settings.tray.idle_icon_help',
                  'Choose a light icon for a dark panel, or a dark icon for a light panel.',
                )}
              </Text>
              <Text>
                {t(
                  'settings.tray.idle_icon_help_automatic',
                  'Automatic follows the system tray appearance on macOS and Windows. On Linux, it uses a light icon because panel appearance cannot be detected reliably.',
                )}
              </Text>
              <Text>
                {t(
                  'settings.tray.idle_icon_help_theme',
                  "This setting is independent of Gitify's app theme.",
                )}
              </Text>
            </Stack>
          }
        />
      </Stack>
    </fieldset>
  );
};
