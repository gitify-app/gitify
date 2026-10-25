import type { ReactNode } from 'react';

export interface SettingsListProps {
  children: ReactNode;
}

export function SettingsList({ children }: Readonly<SettingsListProps>) {
  return <div className="divide-y divide-gitify-notification-border [&>*]:py-2">{children}</div>;
}
