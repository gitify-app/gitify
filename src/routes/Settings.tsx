import { GearIcon } from '@primer/octicons-react';
import { type FC, useContext } from 'react';
import { Header } from '../components/Header';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SettingsFooter } from '../components/settings/SettingsFooter';
import { SystemSettings } from '../components/settings/SystemSettings';
import { AppContext } from '../context/App';

export const SettingsRoute: FC = () => {
  const { resetSettings } = useContext(AppContext);

  return (
    <div className="flex h-screen flex-col" data-testid="settings">
      <Header fetchOnBack icon={GearIcon}>
        Settings
      </Header>

      <div className="flex flex-col flex-grow overflow-x-auto px-8 gap-3">
        <AppearanceSettings />
        <NotificationSettings />
        <SystemSettings />
        <button
          type="button"
          onClick={() => {
            confirm('Are you sure you want to reset all settings?') &&
              resetSettings();
          }}
          className="text-sm hover:underline mb-4 hover:cursor-pointer"
        >
          Restore settings to their defaults
        </button>
      </div>

      <SettingsFooter />
    </div>
  );
};
