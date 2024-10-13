import { type FC, useContext } from 'react';

import { GearIcon } from '@primer/octicons-react';
import { Button } from '@primer/react';

import { Header } from '../components/Header';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SettingsFooter } from '../components/settings/SettingsFooter';
import { SystemSettings } from '../components/settings/SystemSettings';
import { AppContext } from '../context/App';

export const SettingsRoute: FC = () => {
  const { resetSettings } = useContext(AppContext);

  return (
    <>
      <div className="flex h-screen flex-col" data-testid="settings">
        <Header fetchOnBack icon={GearIcon}>
          Settings
        </Header>

        <div className="flex flex-col flex-grow overflow-x-auto px-8 gap-3">
          <AppearanceSettings />
          <NotificationSettings />
          <SystemSettings />

          <Button
            variant="danger"
            onClick={() => {
              confirm(
                'Please confirm that you want to reset all settings to the Gitify defaults?',
              ) && resetSettings();
            }}
          >
            Reset settings
          </Button>
        </div>

        <SettingsFooter />
      </div>
    </>
  );
};
