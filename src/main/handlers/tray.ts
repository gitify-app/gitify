import { app, nativeTheme } from 'electron';
import type { Menubar } from 'electron-menubar';

import {
  EVENTS,
  isTrayIconAppearance,
  type ITrayColorUpdate,
  type TrayIconAppearance,
} from '../../shared/events';
import { isLinux } from '../../shared/platform';

import { createBadgedTrayIcon } from '../badge';
import { onMainEvent } from '../events';
import { getIdleTrayIcon, TrayIcons } from '../icons';

export function registerTrayHandlers(mb: Menubar): void {
  let appearance: TrayIconAppearance = 'auto';
  let highlightUnread = true;
  let status: ITrayColorUpdate = { notificationsCount: 0, isOnline: true };
  // The renderer sends the count as a title only when the count setting is on.
  let title = '';

  const refresh = () => {
    if (mb.tray.isDestroyed()) {
      return;
    }
    const { notificationsCount, isOnline } = status;
    let icon = getIdleTrayIcon(appearance);
    if (!isOnline) {
      icon = TrayIcons.offline;
    } else if (notificationsCount < 0) {
      icon = TrayIcons.error;
    } else if (notificationsCount > 0 && highlightUnread) {
      icon = TrayIcons.active;
    }
    // Linux trays show no title text, so the count is drawn onto the icon.
    if (isLinux() && title !== '' && isOnline && notificationsCount > 0) {
      const badged = createBadgedTrayIcon(icon, notificationsCount);
      // An unreadable icon yields an empty image, which would blank the tray.
      if (!badged.isEmpty()) {
        mb.tray.setImage(badged);
        return;
      }
    }
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

  onMainEvent(EVENTS.UPDATE_ICON_TITLE, (_, value) => {
    title = value;
    if (isLinux()) {
      refresh();
    } else if (!mb.tray.isDestroyed()) {
      mb.tray.setTitle(value);
    }
  });

  nativeTheme.on('updated', refresh);
  app.once('will-quit', () => nativeTheme.removeListener('updated', refresh));
}
