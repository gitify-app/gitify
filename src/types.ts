import type { Notification } from './typesGithub';

export interface AuthState {
  token?: string;
  enterpriseAccounts: EnterpriseAccount[];
  user: GitifyUser | null;
}

export type SettingsState = AppearanceSettingsState &
  NotificationSettingsState &
  SystemSettingsState;

interface AppearanceSettingsState {
  theme: Theme;
  colors: boolean | null;
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
  notifications: Notification[];
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

export interface GitifyUser {
  login: string;
  name: string;
  id: number;
}

export interface GitifyError {
  title: string;
  description: string;
  emojis: string[];
}

export type ErrorType =
  | 'BAD_CREDENTIALS'
  | 'MISSING_SCOPES'
  | 'RATE_LIMITED'
  | 'UNKNOWN';
