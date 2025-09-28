import { type FC, useContext } from 'react';

import { DevicesIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { APPLICATION } from '../../../shared/constants';

import { AppContext } from '../../context/App';
import { Checkbox } from '../fields/Checkbox';
import { Title } from '../primitives/Title';

export const TraySettings: FC = () => {
  const { settings, updateSetting } = useContext(AppContext);

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
          visible={window.gitify.platform.isMacOS()}
        />

        <Checkbox
          checked={settings.useMonochromeIcon}
          label="Use monochrome icon"
          name="useMonochromeIcon"
          onChange={(evt) =>
            updateSetting('useMonochromeIcon', evt.target.checked)
          }
          tooltip={
            <Stack direction="vertical" gap="condensed">
              <Text>
                Display a neutral (monochrome) icon for unread notifications and
                errors, instead of using color highlights.
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
