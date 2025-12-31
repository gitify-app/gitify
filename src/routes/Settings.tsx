import type { FC } from 'react';

import { GearIcon } from '@primer/octicons-react';
import { Stack } from '@primer/react';

import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Header } from '../components/primitives/Header';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SettingsFooter } from '../components/settings/SettingsFooter';
import { SettingsReset } from '../components/settings/SettingsReset';
import { SystemSettings } from '../components/settings/SystemSettings';
import { TraySettings } from '../components/settings/TraySettings';

export const SettingsRoute: FC = () => {
  return (
    <Page testId="settings">
      <Header fetchOnBack icon={GearIcon}>
        Settings
      </Header>

      <Contents paddingBottom>
        <Stack direction="vertical" gap="spacious">
          <AppearanceSettings />
          <NotificationSettings />
          <TraySettings />
          <SystemSettings />
          <SettingsReset />
        </Stack>
      </Contents>

      <SettingsFooter />
    </Page>
  );
};
