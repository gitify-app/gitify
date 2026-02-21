import type { FC } from 'react';

import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { useSettingsStore } from '../../stores';

import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

export const TraySettings: FC = () => {
  const showNotificationsCountInTray = useSettingsStore(
    (s) => s.showNotificationsCountInTray,
  );
  const useUnreadActiveIcon = useSettingsStore((s) => s.useUnreadActiveIcon);
  const useAlternateIdleIcon = useSettingsStore((s) => s.useAlternateIdleIcon);

  const updateSetting = useSettingsStore((s) => s.updateSetting);

  return (
    <fieldset>
      <Title icon={DevicesIcon}>Tray</Title>

      <Stack direction="vertical" gap="condensed">
        <Checkbox
          checked={showNotificationsCountInTray}
          label="Show notification count"
          name="showNotificationsCountInTray"
          onChange={() =>
            updateSetting(
              'showNotificationsCountInTray',
              !showNotificationsCountInTray,
            )
          }
          tooltip={
            <Text>
              Show the unread notification count next to the tray icon. Useful
              for a quick glance at unread activity.
            </Text>
          }
          visible={window.gitify.platform.isMacOS()}
        />

        <Checkbox
          checked={useUnreadActiveIcon}
          label="Highlight unread notifications"
          name="useUnreadActiveIcon"
          onChange={() =>
            updateSetting('useUnreadActiveIcon', !useUnreadActiveIcon)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Use a green {APPLICATION.NAME} logo when there are unread
                notifications.
              </Text>
            </Stack>
          }
        />

        <Checkbox
          checked={useAlternateIdleIcon}
          label="Use alternate idle icon"
          name="useAlternateIdleIcon"
          onChange={() =>
            updateSetting('useAlternateIdleIcon', !useAlternateIdleIcon)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Use a white {APPLICATION.NAME} logo (instead of the default
                black logo) when all notifications are read.
              </Text>
              <Text>
                This is particularly useful for devices which have a dark-themed
                menubar or taskbar.
              </Text>
            </Stack>
          }
        />
      </Stack>
    </fieldset>
  );
};
