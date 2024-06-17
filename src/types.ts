import type { OcticonProps } from '@primer/octicons-react';
import type { FC } from 'react';
import type { Notification } from './typesGitHub';
import type {
  AuthMethod,
  EnterpriseAccount,
  PlatformType,
} from './utils/auth/types';

declare const __brand: unique symbol;

type Brand<B> = { [__brand]: B };

export interface AuthState {
  accounts: Account[];
  /**
   * @deprecated This attribute is deprecated and will be removed in a future release.
   */
  token?: Token;
  /**
   * @deprecated This attribute is deprecated and will be removed in a future release.
   */
  enterpriseAccounts?: EnterpriseAccount[];
  /**
   * @deprecated This attribute is deprecated and will be removed in a future release.
   */
  user?: GitifyUser | null;
}

export type Branded<T, B> = T & Brand<B>;

export type AuthCode = Branded<string, 'AuthCode'>;

export type Token = Branded<string, 'Token'>;

export type ClientID = Branded<string, 'ClientID'>;

export type ClientSecret = Branded<string, 'ClientSecret'>;

export type Hostname = Branded<string, 'Hostname'>;

export type Link = Branded<string, 'WebUrl'>;

export type Status = 'loading' | 'success' | 'error';

export interface Account {
  method: AuthMethod;
  platform: PlatformType;
  hostname: Hostname;
  token: Token;
  user: GitifyUser | null;
}

export type SettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  SystemSettingsState;

interface AppearanceSettingsState {
  theme: Theme;
  detailedNotifications: boolean;
  showAccountHostname: boolean;
  showPills: boolean;
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
  keyboardShortcut: boolean;
}

export interface GitifyState {
  auth?: AuthState;
  settings?: SettingsState;
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
  account: Account;
  notifications: Notification[];
}

export interface GitifyUser {
  login: string;
  name: string | null;
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
