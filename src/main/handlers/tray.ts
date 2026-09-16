import { app, nativeTheme } from 'electron';
import type { Menubar } from 'electron-menubar';

import {
  EVENTS,
  isTrayIconAppearance,
  type ITrayColorUpdate,
  type TrayIconAppearance,
} from '../../shared/events';

import { onMainEvent } from '../events';
import { getIdleTrayIcon, TrayIcons } from '../icons';

export function registerTrayHandlers(mb: Menubar): void {
  let appearance: TrayIconAppearance = 'auto';
  let highlightUnread = true;
  let status: ITrayColorUpdate = { notificationsCount: 0, isOnline: true };

  const refresh = () => {
    if (mb.tray.isDestroyed()) {
      return;
    }
    const { notificationsCount, isOnline } = status;
    const icon = !isOnline
      ? TrayIcons.offline
      : notificationsCount < 0
        ? TrayIcons.error
        : notificationsCount > 0 && highlightUnread
          ? TrayIcons.active
          : getIdleTrayIcon(appearance);
    mb.tray.setImage(icon);
  };

  onMainEvent(EVENTS.SET_TRAY_ICON_APPEARANCE, (_, value) => {
    if (isTrayIconAppearance(value)) {
      appearance = value;
      refresh();
    }
  });
  onMainEvent(EVENTS.USE_UNREAD_ACTIVE_ICON, (_, value) => {
    highlightUnread = value;
    refresh();
  });
  onMainEvent(EVENTS.UPDATE_ICON_COLOR, (_, value) => {
    status = value;
    refresh();
  });
  onMainEvent(EVENTS.UPDATE_ICON_TITLE, (_, title) => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setTitle(title);
    }
  });

  nativeTheme.on('updated', refresh);
  app.once('will-quit', () => nativeTheme.removeListener('updated', refresh));
}
