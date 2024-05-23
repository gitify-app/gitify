import type { OcticonProps } from '@primer/octicons-react';
import type { FC } from 'react';
import type { Notification } from './typesGitHub';
import type {
  AuthMethod,
  EnterpriseAccount,
  PlatformType,
} from './utils/auth/types';

export interface AuthState {
  accounts: AuthAccount[];
  /**
   * @deprecated This attribute is deprecated and will be removed in the future.
   */
  token?: string;
  /**
   * @deprecated This attribute is deprecated and will be removed in the future.
   */
  enterpriseAccounts?: EnterpriseAccount[];
  /**
   * @deprecated This attribute is deprecated and will be removed in the future.
   */
  user?: GitifyUser | null;
}

export interface AuthAccount {
  method: AuthMethod;
  platform: PlatformType;
  hostname: string;
  token: string;
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
  delayNotificationState: boolean;
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

export interface AccountNotifications {
  account: AuthAccount;
  notifications: Notification[];
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
  GRAY = 'text-gray-500 dark:text-gray-300',
  GREEN = 'text-green-500',
  PURPLE = 'text-purple-500',
  RED = 'text-red-500',
  YELLOW = 'text-yellow-500 dark:text-yellow-300',
}

export type PullRequestApprovalIcon = {
  type: FC<OcticonProps>;
  color: IconColor;
  description: string;
};
