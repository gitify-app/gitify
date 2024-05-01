import type { OcticonProps } from '@primer/octicons-react';
import type { FC } from 'react';
import type { Reason, StateType } from './typesGitHub';

export interface AuthState {
  token?: string;
  enterpriseAccounts: EnterpriseAccount[];
  user: GitifyUser | null;
}

export type Status = 'loading' | 'success' | 'error';

export type SettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  SystemSettingsState;

interface AppearanceSettingsState {
  theme: Theme;
  detailedNotifications: boolean;
  showAccountHostname: boolean;
}

interface NotificationSettingsState {
  participating: boolean;
  showNotifications: boolean;
  showBots: boolean;
  markAsDoneOnOpen: boolean;
}

interface SystemSettingsState {
  playSound: boolean;
  openAtStartup: boolean;
  showNotificationsCountInTray: boolean;
}

export enum Theme {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export type RadioGroupItem = {
  label: string;
  value: string;
};

export interface EnterpriseAccount {
  hostname: string;
  token: string;
}

export interface AccountNotifications {
  hostname: string;
  notifications: GitifyNotification[];
}

export interface AuthOptions {
  hostname: string;
  clientId: string;
  clientSecret: string;
}

export interface AuthTokenOptions {
  hostname: string;
  token: string;
}

export interface AuthResponse {
  authCode: string;
  authOptions: AuthOptions;
}
export interface AuthTokenResponse {
  hostname: string;
  token: string;
}

export interface GitifyNotification {
  id: string;
  hostname: string;
  updated_at: {
    raw: string;
    formatted: string;
  };
  title: string;
  type: string;
  html_url: string;
  unread: boolean;
  reason: {
    code: Reason;
    type: string;
    description: string;
  };
  state?: StateType;
  user?: GitifyNotificationUser;
  icon: {
    type: FC<OcticonProps>;
    color: string;
  };
  repository: {
    full_name: string;
    avatar_url: string;
    html_url: string;
    owner: {
      avatar_url: string;
    };
  };
}

export interface GitifyNotificationUser {
  login: string;
  html_url: string;
  avatar_url: string;
  type: string;
}

export interface GitifyUser {
  login: string;
  name: string;
  id: number;
}

export interface GitifyError {
  title: string;
  descriptions: string[];
  emojis: string[];
}

export type ErrorType =
  | 'BAD_CREDENTIALS'
  | 'MISSING_SCOPES'
  | 'NETWORK'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export interface FormattedReason {
  title: string;
  description: string;
}

export enum IconColor {
  GREEN = 'text-green-500',
  RED = 'text-red-500',
  PURPLE = 'text-purple-500',
  GRAY = 'text-gray-500 dark:text-gray-300',
}
