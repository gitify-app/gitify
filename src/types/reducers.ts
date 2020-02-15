import { Notification } from './github';

export interface EnterpriseAccount {
  hostname: string;
  token: string;
}

export interface AppState {
  auth: AuthState;
  notifications: NotificationsState;
  settings: SettingsState;
}

export interface AuthState {
  response: {};
  token?: string;
  isFetching: boolean;
  failed: boolean;
  enterpriseAccounts: EnterpriseAccount[];
}

export interface AccountNotifications {
  hostname: string;
  notifications: Notification[];
}

export interface NotificationsState {
  response: AccountNotifications[];
  isFetching: boolean;
  failed: boolean;
}

export interface SettingsState {
  participating: boolean;
  playSound: boolean;
  showNotifications: boolean;
  markOnClick: boolean;
  openAtStartup: boolean;
  showDockIcon: boolean;
}
