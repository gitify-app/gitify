import { dialog, Notification, type MessageBoxOptions, shell } from 'electron';
import type { Menubar } from 'electron-menubar';
import { autoUpdater, type UpdateCheckResult, type UpdateDownloadedEvent } from 'electron-updater';

import { APPLICATION } from '../shared/constants';
import { logError, logInfo, toError } from '../shared/logger';
import { isMacOS } from '../shared/platform';

import type MenuBuilder from './menu';

/**
 * Updater class for handling application updates.
 *
 * Supports scheduled and manual updates for all platforms.
 *
 * Documentation: https://www.electron.build/auto-update
 *
 * NOTE: previously we tried update-electron-app (Squirrel-focused, no Linux + NSIS) before migrating to electron-updater for cross-platform support.
 */
export default class AppUpdater {
  private readonly menubar: Menubar;
  private readonly menuBuilder: MenuBuilder;
  private notificationsEnabled = true;
  private started = false;
  private enabled = false;
  private revision = 0;
  private downloaded = false;
  private installing = false;
  private periodicCheck?: NodeJS.Timeout;
  private checking = false;
  private download?: {
    promise: Promise<string[]>;
    token: UpdateCheckResult['cancellationToken'];
  };
  private noUpdateMessageTimeout?: NodeJS.Timeout;
  private lastPromptedVersion: string | null = null;

  /**
   * @param menubar - The menubar instance whose tray and window the updater reports status through.
   * @param menuBuilder - The menu builder whose update menu items track the update state.
   */
  constructor(menubar: Menubar, menuBuilder: MenuBuilder) {
    this.menubar = menubar;
    this.menuBuilder = menuBuilder;
    this.menuBuilder.setUpdateActions({
      check: () => this.performInitialCheck(),
      install: () => this.installUpdate(),
    });
    this.menubar.app.on('before-quit', (event) => {
      if (isMacOS() && this.enabled && this.downloaded && !this.installing) {
        event.preventDefault();
        this.installUpdate(false);
      }
    });
    autoUpdater.logger = null;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
  }

  /**
   * Enable or suppress update notifications without changing update checks,
   * downloads, or menubar state.
   */
  setNotificationsEnabled(enabled: boolean): void {
    this.notificationsEnabled = enabled;
  }

  async setAutomaticUpdatesEnabled(enabled: boolean): Promise<void> {
    if (this.enabled === enabled) {
      return;
    }
    this.enabled = enabled;
    this.revision++;
    autoUpdater.autoDownload = enabled;
    // Squirrel's native handoff cannot be revoked, so macOS waits until an allowed quit.
    autoUpdater.autoInstallOnAppQuit = enabled && !isMacOS();
    this.menuBuilder.setAutomaticUpdatesEnabled(enabled);

    if (!enabled) {
      clearInterval(this.periodicCheck);
      this.periodicCheck = undefined;
      this.download?.token?.cancel();
      this.resetState();
      return;
    }

    if (!this.menubar.app.isPackaged) {
      logInfo('app updater', 'Skipping updater since app is in development mode');
      return;
    }
    if (!this.started) {
      this.started = true;
      this.registerListeners();
    }
    this.schedulePeriodicChecks();
    await this.performInitialCheck();
  }

  /**
   * Attach all electron-updater event listeners and wire them to menu state setters.
   */
  private registerListeners() {
    autoUpdater.on('checking-for-update', () => {
      if (!this.enabled) {
        return;
      }
      logInfo('auto updater', 'Checking for update');
      this.menuBuilder.setCheckForUpdatesMenuEnabled(false);
      this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);

      // Clear any existing timeout when starting a new check
      this.clearNoUpdateTimeout();
    });

    autoUpdater.on('update-available', () => {
      if (!this.enabled) {
        return;
      }
      logInfo('auto updater', 'Update available');
      // Keep the prompt guard for this version: a routine check for the same
      // pending version must not re-prompt after the user chose Later. A
      // different version will not match `lastPromptedVersion` and prompts
      // normally. Only a cancelled download clears the guard.
      this.setTooltipWithStatus('A new update is available');
      this.menuBuilder.setUpdateAvailableMenuVisibility(true);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      if (!this.enabled) {
        return;
      }
      this.setTooltipWithStatus(`Downloading update: ${progressObj.percent.toFixed(2)}%`);
    });

    autoUpdater.on('update-downloaded', (event) => {
      if (!this.enabled) {
        return;
      }
      this.downloaded = true;
      logInfo('auto updater', 'Update downloaded');
      this.setTooltipWithStatus('A new update is ready to install');
      this.menuBuilder.setUpdateAvailableMenuVisibility(false);
      this.menuBuilder.setUpdateReadyForInstallMenuVisibility(true);
      // The guard in showUpdateReadyDialog also keeps a re-check of the same version quiet.
      if (this.notificationsEnabled && event.version !== this.lastPromptedVersion) {
        new Notification({
          title: 'A new update is ready to install',
          body: `${APPLICATION.NAME} ${event.version} has been downloaded and will be installed on exit.`,
        }).show();
        this.showUpdateReadyDialog(event);
      }
    });

    autoUpdater.on('update-not-available', () => {
      if (!this.enabled) {
        return;
      }
      logInfo('auto updater', 'Update not available');
      this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
      this.menuBuilder.setNoUpdateAvailableMenuVisibility(true);
      this.menuBuilder.setUpdateAvailableMenuVisibility(false);
      this.menuBuilder.setUpdateReadyForInstallMenuVisibility(false);

      // Auto-hide the "no updates available" message
      this.clearNoUpdateTimeout();
      this.noUpdateMessageTimeout = setTimeout(() => {
        this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
      }, APPLICATION.UPDATE_NOT_AVAILABLE_DISPLAY_MS);
    });

    autoUpdater.on('update-cancelled', () => {
      if (!this.enabled) {
        return;
      }
      logInfo('auto updater', 'Update cancelled');
      this.lastPromptedVersion = null;
      this.resetState();
    });

    autoUpdater.on('error', (err) => {
      // A failed check leaves the downloaded update installable; a failed install does not.
      if (this.installing) {
        this.installing = false;
        this.downloaded = false;
      }
      logError('auto updater', 'Error checking for update', err);
      this.resetState();
      if (this.enabled && this.downloaded) {
        this.menuBuilder.setUpdateReadyForInstallMenuVisibility(true);
      }
    });
  }

  /**
   * Run an immediate update check on application launch.
   */
  private async performInitialCheck() {
    try {
      logInfo('app updater', 'Checking for updates on application launch');
      await this.checkForUpdates();
    } catch (err) {
      logError('auto updater', 'Initial check failed', toError(err));
    }
  }

  /**
   * Schedule recurring update checks.
   */
  private schedulePeriodicChecks() {
    const runScheduledCheck = async () => {
      try {
        logInfo('app updater', 'Checking for updates on a periodic schedule');
        await this.checkForUpdates();
      } catch (e) {
        logError('auto updater', 'Scheduled check failed', toError(e));
      }
    };

    this.periodicCheck = setInterval(runScheduledCheck, APPLICATION.UPDATE_CHECK_INTERVAL_MS);
  }

  /**
   * Track downloads so disabling updates can cancel a check that finishes later.
   */
  private async checkForUpdates() {
    if (!this.enabled || this.checking || this.download) {
      return;
    }
    this.checking = true;
    try {
      const result = await autoUpdater.checkForUpdates();
      if (result?.downloadPromise) {
        const download = { promise: result.downloadPromise, token: result.cancellationToken };
        this.download = download;
        void download.promise
          .catch((error: unknown) => {
            if (!download.token?.cancelled) {
              logError('app updater', 'Update download failed', toError(error));
            }
          })
          .finally(() => {
            this.download = undefined;
            if (this.enabled && download.token?.cancelled) {
              void this.performInitialCheck();
            }
          });
      }
      if (!this.enabled) {
        result?.cancellationToken?.cancel();
      }
    } finally {
      this.checking = false;
    }
  }

  /**
   * Update the tray tooltip to show the application name alongside a status message.
   *
   * @param status - The status string appended below the application name.
   */
  private setTooltipWithStatus(status: string) {
    this.menubar.tray.setToolTip(`${APPLICATION.NAME}\n${status}`);
  }

  /**
   * Cancel the pending timeout that hides the "no update available" menu item, if any.
   */
  private clearNoUpdateTimeout() {
    if (this.noUpdateMessageTimeout) {
      clearTimeout(this.noUpdateMessageTimeout);
      this.noUpdateMessageTimeout = undefined;
    }
  }

  /**
   * Reset tray tooltip and all update-related menu items to their default state.
   * Leaves the periodic check schedule running so a cancelled or failed check
   * does not stop the app looking for later updates.
   */
  private resetState() {
    this.menubar.tray.setToolTip(APPLICATION.NAME);
    this.menuBuilder.setCheckForUpdatesMenuEnabled(true);
    this.menuBuilder.setNoUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateAvailableMenuVisibility(false);
    this.menuBuilder.setUpdateReadyForInstallMenuVisibility(false);

    // Clear any pending timeout
    this.clearNoUpdateTimeout();
  }

  /**
   * Install a downloaded update while automatic updates are on.
   *
   * @param relaunch - Whether to start Gitify again after installing; a plain quit does not.
   */
  private installUpdate(relaunch = true) {
    if (this.enabled && this.downloaded && !this.installing) {
      this.installing = true;
      autoUpdater.autoRunAppAfterInstall = relaunch;
      autoUpdater.quitAndInstall();
    }
  }

  /**
   * Show a dialog informing the user that an update is ready to install.
   * If the user chooses to restart, quitAndInstall is called immediately.
   * When the downloaded update carries release information, a Release notes
   * action opens the matching GitHub release page.
   *
   * @param event - The downloaded-update event with the release identity.
   */
  private showUpdateReadyDialog(event: UpdateDownloadedEvent) {
    if (event.version === this.lastPromptedVersion) {
      return;
    }

    const hasReleaseInfo = Boolean(event.releaseNotes) || Boolean(event.version);
    const release = event.releaseName ?? event.version;
    const buttons = ['Restart', 'Later', ...(hasReleaseInfo ? ['Release notes'] : [])];

    this.lastPromptedVersion = event.version;

    const dialogOpts: MessageBoxOptions = {
      type: 'info',
      buttons,
      cancelId: 1,
      title: 'Application Update',
      message: `${APPLICATION.NAME} ${release} has been downloaded`,
      detail: 'Restart to apply the update. You can also restart later from the tray menu.',
    };

    const revision = this.revision;
    dialog
      .showMessageBox(dialogOpts)
      .then((returnValue) => {
        if (returnValue.response === 0 && this.enabled && revision === this.revision) {
          this.installUpdate();
        } else if (returnValue.response === 2 && hasReleaseInfo && event.version) {
          this.openReleaseNotes(event.version);
        }
      })
      .catch((err) => {
        logError('app updater', 'Failed to show update ready dialog', toError(err));
      });
  }

  /**
   * Open the GitHub release page for a downloaded version.
   *
   * @param version - The downloaded version, with or without a leading `v`.
   */
  private openReleaseNotes(version: string) {
    const normalizedVersion = version.replace(/^v/, '');
    const url = `${APPLICATION.GITHUB_BASE_URL}/${APPLICATION.REPO_SLUG}/releases/tag/v${normalizedVersion}`;

    shell.openExternal(url).catch((err) => {
      logError('app updater', 'Failed to open release notes', toError(err));
    });
  }
}
