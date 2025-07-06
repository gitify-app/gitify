import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';

import type {
  Notification,
  Reason,
  SubjectType,
  UserType,
} from './typesGitHub';
import type { AuthMethod, PlatformType } from './utils/auth/types';

declare const __brand: unique symbol;

type Brand<B> = { [__brand]: B };

export interface AuthState {
  accounts: Account[];
}

export type Branded<T, B> = T & Brand<B>;

export type AuthCode = Branded<string, 'AuthCode'>;

export type Token = Branded<string, 'Token'>;

export type ClientID = Branded<string, 'ClientID'>;

export type ClientSecret = Branded<string, 'ClientSecret'>;

export type Hostname = Branded<string, 'Hostname'>;

export type Link = Branded<string, 'WebUrl'>;

export type UserHandle = Branded<string, 'UserHandle'>;

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
  | Theme
  | FilterValue[];

export type FilterValue =
  | Reason
  | UserType
  | UserHandle
  | FilterStateType
  | SubjectType;

export type SettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  SystemSettingsState &
  FilterSettingsState;

export interface AppearanceSettingsState {
  theme: Theme;
  increaseContrast: boolean;
  zoomPercentage: number;
  showAccountHeader: boolean;
  wrapNotificationTitle: boolean;
}

export interface NotificationSettingsState {
  groupBy: GroupBy;
  fetchAllNotifications: boolean;
  detailedNotifications: boolean;
  showPills: boolean;
  showNumber: boolean;
  participating: boolean;
  markAsDoneOnOpen: boolean;
  markAsDoneOnUnsubscribe: boolean;
  delayNotificationState: boolean;
}

export interface SystemSettingsState {
  openLinks: OpenPreference;
  keyboardShortcut: boolean;
  showNotificationsCountInTray: boolean;
  showNotifications: boolean;
  useAlternateIdleIcon: boolean;
  playSound: boolean;
  notificationVolume: number;
  openAtStartup: boolean;
}

export interface FilterSettingsState {
  filterUserTypes: UserType[];
  filterIncludeHandles: string[];
  filterExcludeHandles: string[];
  filterSubjectTypes: SubjectType[];
  filterStates: FilterStateType[];
  filterReasons: Reason[];
}

export interface GitifyState {
  auth?: AuthState;
  settings?: SettingsState;
}

export enum Theme {
  SYSTEM = 'SYSTEM',
  LIGHT = 'LIGHT',
  LIGHT_COLORBLIND = 'LIGHT_COLORBLIND',
  LIGHT_TRITANOPIA = 'LIGHT_TRITANOPIA',
  DARK = 'DARK',
  DARK_COLORBLIND = 'DARK_COLORBLIND',
  DARK_TRITANOPIA = 'DARK_TRITANOPIA',
  DARK_DIMMED = 'DARK_DIMMED',
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

export interface TypeDetails {
  title: string;
  description?: string;
}

export enum IconColor {
  GRAY = 'text-gitify-icon-muted',
  GREEN = 'text-gitify-icon-open',
  PURPLE = 'text-gitify-icon-done',
  RED = 'text-gitify-icon-closed',
  YELLOW = 'text-gitify-icon-attention',
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

export type FilterStateType = 'open' | 'closed' | 'merged' | 'draft' | 'other';
