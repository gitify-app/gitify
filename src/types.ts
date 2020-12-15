export interface AuthState {
  token?: string;
  enterpriseAccounts: EnterpriseAccount[];
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

export interface AuthResponse {
  hostname: string;
  code: string;
}
export interface AuthTokenResponse {
  hostname: string;
  token: string;
}
