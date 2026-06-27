import { createContext } from 'react';

import type {
  Account,
  AccountNotifications,
  AuthState,
  Forge,
  GitifyError,
  GitifyNotification,
  Hostname,
  SettingsState,
  SettingsValue,
  Status,
  Token,
} from '../types';
import type {
  DeviceFlowSession,
  LoginOAuthWebOptions,
  LoginPersonalAccessTokenOptions,
} from '../utils/auth/types';

export interface AppContextState {
  auth: AuthState;
  isLoggedIn: boolean;
  loginWithDeviceFlowStart: (
    forge: Forge,
    hostname?: Hostname,
    scopes?: string[],
  ) => Promise<DeviceFlowSession>;
  loginWithDeviceFlowPoll: (forge: Forge, session: DeviceFlowSession) => Promise<Token | null>;
  loginWithDeviceFlowComplete: (forge: Forge, token: Token, hostname: Hostname) => Promise<void>;
  loginWithOAuthApp: (forge: Forge, data: LoginOAuthWebOptions) => Promise<void>;
  loginWithPersonalAccessToken: (data: LoginPersonalAccessTokenOptions) => Promise<void>;
  logoutFromAccount: (account: Account) => Promise<void>;

  status: Status;
  globalError: GitifyError | undefined;

  notifications: AccountNotifications[];
  notificationCount: number;
  unreadNotificationCount: number;
  hasNotifications: boolean;
  hasUnreadNotifications: boolean;

  fetchNotifications: () => Promise<void>;
  removeAccountNotifications: (account: Account) => Promise<void>;

  markNotificationsAsRead: (notifications: GitifyNotification[]) => Promise<void>;
  markNotificationsAsDone: (notifications: GitifyNotification[]) => Promise<void>;
  unsubscribeNotification: (notification: GitifyNotification) => Promise<void>;

  settings: SettingsState;
  resetSettings: () => void;
  updateSetting: (name: keyof SettingsState, value: SettingsValue) => void;

  shortcutRegistrationError: string | null;
  clearShortcutRegistrationError: () => void;
}

export const AppContext = createContext<Partial<AppContextState> | undefined>(undefined);
