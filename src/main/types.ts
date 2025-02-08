export interface GitifyAPI {
  openExternalLink: (url: string) => void;
  getAppVersion: () => Promise<string>;
  encryptValue: (value: string) => Promise<string>;
  decryptValue: (value: string) => Promise<string>;
  quitApp: () => void;
  showWindow: () => void;
  hideWindow: () => void;
  setAutoLaunch: (value: boolean) => void;
  setAlternateIdleIcon: (value: boolean) => void;
  setKeyboardShortcut: (keyboardShortcut: boolean) => void;
  updateTrayIcon: (notificationsLength?: number) => void;
  updateTrayTitle: (title?: string) => void;
}
