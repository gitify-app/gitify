import { type AuthState, type SettingsState, Theme } from '../types';
import Constants from '../utils/constants';
import { mockedEnterpriseAccounts, mockedUser } from './mockedData';

export const mockAccounts: AuthState = {
  token: 'token-123-456',
  enterpriseAccounts: mockedEnterpriseAccounts,
  user: mockedUser,
};

export const mockSettings: SettingsState = {
  participating: false,
  playSound: true,
  showNotifications: true,
  showBots: true,
  showNotificationsCountInTray: false,
  openAtStartup: false,
  theme: Theme.SYSTEM,
  detailedNotifications: false,
  markAsDoneOnOpen: false,
  showAccountHostname: false,
  kbdShortcut: Constants.KBD_SHORTCUT_DEFAULT,
  kbdShortcutEnabled: false,
};
