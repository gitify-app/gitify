import { net } from 'electron';
import type { Menubar } from 'menubar';

import { EVENTS } from '../../shared/events';

import { onMainEvent } from '../events';
import { TrayIcons } from '../icons';

let shouldUseAlternateIdleIcon = false;
let shouldUseUnreadActiveIcon = true;

function setIdleIcon(mb: Menubar): void {
  if (shouldUseAlternateIdleIcon) {
    mb.tray.setImage(TrayIcons.idleAlternate);
  } else {
    mb.tray.setImage(TrayIcons.idle);
  }
}

function setActiveIcon(mb: Menubar): void {
  if (shouldUseUnreadActiveIcon) {
    mb.tray.setImage(TrayIcons.active);
  } else {
    setIdleIcon(mb);
  }
}

function setErrorIcon(mb: Menubar): void {
  mb.tray.setImage(TrayIcons.error);
}

function setOfflineIcon(mb: Menubar): void {
  mb.tray.setImage(TrayIcons.offline);
}

/**
 * Register IPC handlers for tray icon visual state.
 *
 * @param mb - The menubar instance whose tray is controlled.
 */
export function registerTrayHandlers(mb: Menubar): void {
  /**
   * Toggle the alternate idle tray icon variant.
   */
  onMainEvent(
    EVENTS.USE_ALTERNATE_IDLE_ICON,
    (_, useAlternateIdleIcon: boolean) => {
      shouldUseAlternateIdleIcon = useAlternateIdleIcon;
    },
  );

  /**
   * Toggle whether unread notifications show an active (coloured) tray icon.
   */
  onMainEvent(
    EVENTS.USE_UNREAD_ACTIVE_ICON,
    (_, useUnreadActiveIcon: boolean) => {
      shouldUseUnreadActiveIcon = useUnreadActiveIcon;
    },
  );

  /**
   * Update the tray icon based on the current notification count.
   */
  onMainEvent(EVENTS.UPDATE_ICON_COLOR, (_, notificationsCount: number) => {
    if (!mb.tray.isDestroyed()) {
      if (!net.isOnline()) {
        setOfflineIcon(mb);
        return;
      }

      if (notificationsCount < 0) {
        setErrorIcon(mb);
        return;
      }

      if (notificationsCount > 0) {
        setActiveIcon(mb);
        return;
      }

      setIdleIcon(mb);
    }
  });

  /**
   * Update the tray icon title (notification count label on macOS).
   */
  onMainEvent(EVENTS.UPDATE_ICON_TITLE, (_, title: string) => {
    if (!mb.tray.isDestroyed()) {
      mb.tray.setTitle(title);
    }
  });
}
