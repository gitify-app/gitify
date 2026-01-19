import type { FC } from 'react';

import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../shared/constants';

import { useAppContext } from '../../hooks/useAppContext';

import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

export const TraySettings: FC = () => {
  const { settings, updateSetting } = useAppContext();

  return (
    <fieldset>
      <Title icon={DevicesIcon}>Tray</Title>

      <Stack direction="vertical" gap="condensed">
        <Checkbox
          checked={settings.showNotificationsCountInTray}
          label="Show notification count"
          name="showNotificationsCountInTray"
          onChange={(evt) =>
            updateSetting('showNotificationsCountInTray', evt.target.checked)
          }
          tooltip={
            <Text>
              Show the unread notification count next to the tray icon. Useful
              for a quick glance at unread activity.
            </Text>
          }
          visible={
            typeof window !== 'undefined' && window.gitify !== undefined
              ? window.gitify.platform.isMacOS()
              : true
          }
        />

        <Checkbox
          checked={settings.useUnreadActiveIcon}
          label="Highlight unread notifications"
          name="useUnreadActiveIcon"
          onChange={(evt) =>
            updateSetting('useUnreadActiveIcon', evt.target.checked)
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
          checked={settings.useAlternateIdleIcon}
          label="Use alternate idle icon"
          name="useAlternateIdleIcon"
          onChange={(evt) =>
            updateSetting('useAlternateIdleIcon', evt.target.checked)
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
