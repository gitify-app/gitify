import type { FC } from 'react';

import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';
import { isTrayIconAppearance } from '../../../shared/events';

import { useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { RadioGroup } from '../fields/RadioGroup';
import { Title } from '../primitives/Title';

export const TraySettings: FC = () => {
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  // Setting store actions
  const toggleSetting = useSettingsStore((s) => s.toggleSetting);

  // Setting store values
  const showNotificationsCountInTray = useSettingsStore((s) => s.showNotificationsCountInTray);
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const trayIconAppearance = useSettingsStore((s) => s.trayIconAppearance);

  return (
    <fieldset>
      <Title icon={DevicesIcon}>Tray</Title>

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
              <Text>Use a green {APPLICATION.NAME} logo when there are unread notifications.</Text>
            </Stack>
          }
        />

        <RadioGroup
          label="Idle icon"
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
              <Text>Choose a light icon for a dark panel, or a dark icon for a light panel.</Text>
              <Text>
                Automatic follows the system tray appearance on macOS and Windows. On Linux, it uses
                a light icon because panel appearance cannot be detected reliably.
              </Text>
              <Text>This setting is independent of Gitify’s app theme.</Text>
            </Stack>
          }
        />
      </Stack>
    </fieldset>
  );
};
