import type { OcticonProps } from '@primer/octicons-react';
import type { FC } from 'react';
import type { Notification, Reason } from './typesGitHub';
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
  version?: string;
  hostname: Hostname;
  token: Token;
  user: GitifyUser | null;
  hasRequiredScopes?: boolean;
}

export type SettingsValue =
  | boolean
  | number
  | GroupBy
  | OpenPreference
  | Reason[]
  | Theme;

export type SettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  SystemSettingsState &
  FilterSettingsState;

interface AppearanceSettingsState {
  theme: Theme;
  zoomPercentage: number;
  detailedNotifications: boolean;
  showAccountHeader: boolean;
  showPills: boolean;
  showNumber: boolean;
}

interface NotificationSettingsState {
  groupBy: GroupBy;
  fetchAllNotifications: boolean;
  participating: boolean;
  markAsDoneOnOpen: boolean;
  markAsDoneOnUnsubscribe: boolean;
  delayNotificationState: boolean;
}

interface SystemSettingsState {
  openLinks: OpenPreference;
  keyboardShortcut: boolean;
  showNotificationsCountInTray: boolean;
  showNotifications: boolean;
  useAlternateIdleIcon: boolean;
  playSound: boolean;
  openAtStartup: boolean;
}

interface FilterSettingsState {
  hideBots: boolean;
  filterReasons: Reason[];
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

export enum OpenPreference {
  FOREGROUND = 'FOREGROUND',
  BACKGROUND = 'BACKGROUND',
}

export enum GroupBy {
  REPOSITORY = 'REPOSITORY',
  DATE = 'DATE',
}

export type RadioGroupItem = {
  label: string;
  value: string;
};

export interface AccountNotifications {
  account: Account;
  notifications: Notification[];
  error: GitifyError | null;
}

export interface GitifyUser {
  login: string;
  name: string | null;
  avatar: Link | null;
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
  WHITE = 'text-white',
}

export enum Opacity {
  READ = 'opacity-50',
  LOW = 'opacity-70',
  MEDIUM = 'opacity-80',
  HIGH = 'opacity-90',
}

export type PullRequestApprovalIcon = {
  type: FC<OcticonProps>;
  color: IconColor;
  description: string;
};

export enum Size {
  XSMALL = 12,
  SMALL = 14,
  MEDIUM = 16,
  LARGE = 18,
  XLARGE = 20,
}

export type Chevron = {
  icon: FC<OcticonProps>;
  label: string;
};
