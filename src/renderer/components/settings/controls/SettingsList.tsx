import type { ReactNode } from 'react';

export interface SettingsListProps {
  children: ReactNode;
}

export function SettingsList({ children }: Readonly<SettingsListProps>) {
  return <div className="settings-list">{children}</div>;
}
