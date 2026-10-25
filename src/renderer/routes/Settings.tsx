import { useTranslation } from 'react-i18next';

import { GearIcon } from '@primer/octicons-react';
import { Stack } from '@primer/react';

import { Contents } from '../components/layout/Contents';
import { Page } from '../components/layout/Page';
import { Header } from '../components/primitives/Header';
import { AlertSettings } from '../components/settings/AlertSettings';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { InboxSettings } from '../components/settings/InboxSettings';
import { SettingsFooter } from '../components/settings/SettingsFooter';
import { SettingsReset } from '../components/settings/SettingsReset';
import { SystemSettings } from '../components/settings/SystemSettings';
import { TraySettings } from '../components/settings/TraySettings';

export function SettingsRoute() {
  const { t } = useTranslation();

  return (
    <Page testId="settings">
      <Header fetchOnBack icon={GearIcon}>
        {t('settings.title', 'Settings')}
      </Header>

      <Contents paddingBottom scrollFade>
        <Stack direction="vertical" gap="spacious">
          <AppearanceSettings />
          <InboxSettings />
          <AlertSettings />
          <TraySettings />
          <SystemSettings />
          <SettingsReset />
        </Stack>
      </Contents>

      <SettingsFooter />
    </Page>
  );
}
