import { Notification, User } from './typesGithub';

export interface AuthState {
  token?: string;
  enterpriseAccounts: EnterpriseAccount[];
  user: User | null;
}

export interface SettingsState {
  participating: boolean;
  playSound: boolean;
  showNotifications: boolean;
  markOnClick: boolean;
  openAtStartup: boolean;
  appearance: Appearance;
}

export enum Appearance {
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
