import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';
import { isTrayIconAppearance } from '../../../shared/events';

import { useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { SectionHeading } from '../primitives/SectionHeading';

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

      <Stack direction="vertical" gap="condensed">
        <Checkbox
          checked={showNotificationsCountInTray}
          label="Show notification count"
          name="showNotificationsCountInTray"
          onChange={() => toggleSetting('showNotificationsCountInTray')}
          tooltip={
            <Text>
              Show the unread notification count next to the tray icon. Useful for a quick glance at
              unread activity.
            </Text>
          }
          visible={window.gitify.platform.isMacOS()}
        />

        <Checkbox
          checked={useUnreadActiveIcon}
          label="Highlight unread notifications"
          name="useUnreadActiveIcon"
          onChange={() => toggleSetting('useUnreadActiveIcon')}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Turn the {APPLICATION.NAME} logo green while there are unread notifications.
              </Text>
            </Stack>
          }
        />

        <RadioGroup
          label="Idle icon:"
          name="trayIconAppearance"
          value={trayIconAppearance}
          options={[
            { label: 'Automatic', value: 'auto' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]}
          onChange={(event) => {
            const value = event.target.value;
            if (isTrayIconAppearance(value)) {
              updateSetting('trayIconAppearance', value);
            }
          }}
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>Pick a light icon for dark panels or a dark icon for light panels.</Text>
              <Text>
                Choose Automatic to follow the tray appearance on macOS and Windows; Linux uses
                light because panel detection is unreliable.
              </Text>
              <Text>This setting is independent of the {APPLICATION.NAME} app theme.</Text>
            </Stack>
          }
        />
      </Stack>
    </fieldset>
  );
}
