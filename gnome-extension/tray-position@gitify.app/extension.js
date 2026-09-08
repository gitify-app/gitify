import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const MARGIN = 8;

const REAPPLY_DELAYS_MS = [0, 60, 180, 400];

export default class GitifyWindowPlacementExtension extends Extension {
  enable() {
    this._timeouts = new Set();
    this._mapId = global.window_manager.connect('map', (_wm, actor) =>
      this._onWindowMapped(actor.meta_window),
    );
  }

  disable() {
    global.window_manager.disconnect(this._mapId);
    this._mapId = null;

    for (const id of this._timeouts) {
      GLib.Source.remove(id);
    }
    this._timeouts = null;
  }

  _onWindowMapped(window) {
    if (!isGitifyWindow(window)) {
      return;
    }

    for (const delay of REAPPLY_DELAYS_MS) {
      const id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
        this._timeouts.delete(id);
        this._place(window);
        return GLib.SOURCE_REMOVE;
      });
      this._timeouts.add(id);
    }
  }

  _place(window) {
    const workArea = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    const frame = window.get_frame_rect();
    const maxX = workArea.x + workArea.width - frame.width - MARGIN;
    const icon = trayIconRect();

    const x =
      icon === null
        ? maxX
        : clamp(Math.round(icon.get_center().x - frame.width / 2), workArea.x + MARGIN, maxX);

    window.move_frame(false, x, workArea.y + MARGIN);
  }
}

function isGitifyWindow(window) {
  const wmClass = window?.get_wm_class()?.toLowerCase() ?? '';

  return wmClass.includes('gitify') || (wmClass === 'electron' && window.get_title() === 'Gitify');
}

function trayIconRect() {
  const indicator = Object.values(Main.panel.statusArea).find(
    (item) => item?._indicator?.id?.toLowerCase() === 'gitify',
  );
  const actor = indicator?.container ?? indicator;

  return actor?.visible ? actor.get_transformed_extents() : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
