import type { FC } from 'react';
import { Header } from '../components/Header';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { SettingsFooter } from '../components/settings/SettingsFooter';
import { SystemSettings } from '../components/settings/SystemSettings';

export const SettingsRoute: FC = () => {
  return (
    <div className="flex h-screen flex-col" data-testid="settings">
      <Header fetchOnBack={true}>Settings</Header>

      <div className="flex-grow overflow-x-auto px-8">
        <AppearanceSettings />
        <NotificationSettings />
        <SystemSettings />
      </div>

      <SettingsFooter />
    </div>
  );
};
