import { ipcRenderer, shell } from 'electron';

export function openExternalLink(url: string): void {
  if (!url.toLowerCase().startsWith('file:///')) {
    shell.openExternal(url);
  }
}

export async function getAppVersion(): Promise<string> {
  return await ipcRenderer.invoke('gitify:version');
}

export function quitApp(): void {
  ipcRenderer.send('gitify:quit');
}

export function showWindow(): void {
  ipcRenderer.send('gitify:window-show');
}

export function hideWindow(): void {
  ipcRenderer.send('gitify:window-hide');
}

export function setAutoLaunch(value: boolean): void {
  ipcRenderer.send('gitify:update-auto-launch', {
    openAtLogin: value,
    openAsHidden: value,
  });
}

export function updateTrayIcon(notificationsLength = 0): void {
  if (notificationsLength > 0) {
    ipcRenderer.send('gitify:icon-active');
  } else {
    ipcRenderer.send('gitify:icon-idle');
  }
}

export function updateTrayTitle(title = ''): void {
  ipcRenderer.send('gitify:update-title', title);
}
