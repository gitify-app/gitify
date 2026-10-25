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
        Tray
      </SectionHeading>

      <SettingsList>
        <SettingsToggle
          checked={showNotificationsCountInTray}
          label="Show notification count"
          name="showNotificationsCountInTray"
          onChange={() => toggleSetting('showNotificationsCountInTray')}
          tooltip="Show the unread notification count next to the tray icon. Useful for a quick glance at unread activity."
          visible={window.gitify.platform.isMacOS()}
        />

        <SettingsToggle
          checked={useUnreadActiveIcon}
          label="Highlight unread notifications"
          name="useUnreadActiveIcon"
          onChange={() => toggleSetting('useUnreadActiveIcon')}
          tooltip={`Turn the ${APPLICATION.NAME} logo green while there are unread notifications.`}
        />

        <SettingsChoice
          label="Idle icon"
          name="trayIconAppearance"
          onChange={(value) => {
            if (isTrayIconAppearance(value)) {
              updateSetting('trayIconAppearance', value);
            }
          }}
          options={[
            { label: 'Automatic', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Pick a light icon for dark panels or a dark icon for light panels.</Text>
              <Text>
                Automatic follows the tray appearance on macOS and Windows; Linux uses light because
                panel detection is unreliable.
              </Text>
              <Text>This setting is independent of the {APPLICATION.NAME} app theme.</Text>
            </Stack>
          }
          value={trayIconAppearance}
        />
      </SettingsList>
    </fieldset>
  );
}
