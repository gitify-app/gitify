//! Auto-updater functionality for Gitify.
//!
//! This module handles checking for updates, downloading, and installing them.
//! It mirrors the functionality of the Electron version's updater.ts.
//!
//! # Events emitted to frontend
//! - `updater:checking` - Started checking for updates
//! - `updater:available` - Update is available (payload: version string)
//! - `updater:not-available` - No update available
//! - `updater:downloading` - Download in progress (payload: progress percentage)
//! - `updater:downloaded` - Update downloaded and ready to install
//! - `updater:error` - Error occurred (payload: error message)
//!
//! # Configuration
//! The updater requires proper signing configuration in tauri.conf.json for production.
//! See: https://v2.tauri.app/plugin/updater/

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, Runtime};
use tauri_plugin_updater::UpdaterExt;

/// Update check interval: 24 hours (same as Electron version)
#[cfg(not(debug_assertions))]
const UPDATE_CHECK_INTERVAL_SECS: u64 = 24 * 60 * 60;

/// Duration to display "no updates available" message: 60 seconds
const NO_UPDATE_DISPLAY_SECS: u64 = 60;

/// Downloaded update data including bytes and metadata
pub(crate) struct DownloadedUpdate {
    /// The downloaded update bytes
    pub(crate) bytes: Vec<u8>,
    /// The version of the downloaded update
    pub(crate) version: String,
    /// The current version before update
    pub(crate) current_version: String,
}

/// State for the updater
pub struct UpdaterState {
    /// Whether the updater has been started
    started: AtomicBool,
    /// Whether an update is available
    update_available: AtomicBool,
    /// Whether an update has been downloaded
    update_downloaded: AtomicBool,
    /// Whether we're currently checking for updates
    checking: AtomicBool,
    /// Cached downloaded update for installation
    downloaded_update: Mutex<Option<DownloadedUpdate>>,
}

impl UpdaterState {
    pub fn new() -> Self {
        Self {
            started: AtomicBool::new(false),
            update_available: AtomicBool::new(false),
            update_downloaded: AtomicBool::new(false),
            checking: AtomicBool::new(false),
            downloaded_update: Mutex::new(None),
        }
    }

    pub fn is_started(&self) -> bool {
        self.started.load(Ordering::SeqCst)
    }

    #[cfg(not(debug_assertions))]
    pub fn set_started(&self, value: bool) {
        self.started.store(value, Ordering::SeqCst);
    }

    pub fn is_update_available(&self) -> bool {
        self.update_available.load(Ordering::SeqCst)
    }

    pub fn set_update_available(&self, value: bool) {
        self.update_available.store(value, Ordering::SeqCst);
    }

    pub fn is_update_downloaded(&self) -> bool {
        self.update_downloaded.load(Ordering::SeqCst)
    }

    pub fn set_update_downloaded(&self, value: bool) {
        self.update_downloaded.store(value, Ordering::SeqCst);
    }

    pub fn is_checking(&self) -> bool {
        self.checking.load(Ordering::SeqCst)
    }

    pub fn set_checking(&self, value: bool) {
        self.checking.store(value, Ordering::SeqCst);
    }

    pub fn store_downloaded_update(&self, bytes: Vec<u8>, version: String, current_version: String) {
        let mut guard = self.downloaded_update.lock().unwrap_or_else(|e| e.into_inner());
        *guard = Some(DownloadedUpdate {
            bytes,
            version,
            current_version,
        });
    }

    pub fn take_downloaded_update(&self) -> Option<DownloadedUpdate> {
        let mut guard = self.downloaded_update.lock().unwrap_or_else(|e| e.into_inner());
        guard.take()
    }
}

impl Default for UpdaterState {
    fn default() -> Self {
        Self::new()
    }
}

/// Payload for update available event
#[derive(Clone, serde::Serialize)]
pub struct UpdateAvailablePayload {
    pub version: String,
    pub current_version: String,
    pub body: Option<String>,
}

/// Payload for download progress event
#[derive(Clone, serde::Serialize)]
pub struct DownloadProgressPayload {
    pub percent: f64,
    pub downloaded: u64,
    pub total: Option<u64>,
}

/// Start the auto-updater background tasks.
/// This should be called once during app setup.
pub fn start_updater<R: Runtime>(app: &AppHandle<R>) {
    let state = app.state::<UpdaterState>();

    // Only start once (idempotent)
    if state.is_started() {
        log::info!("Updater already started, skipping");
        return;
    }

    // Skip in development mode
    #[cfg(debug_assertions)]
    {
        log::info!("Skipping updater in development mode");
        return;
    }

    #[cfg(not(debug_assertions))]
    {
        log::info!("Starting auto-updater");
        state.set_started(true);

        // Perform initial check after a short delay to let the app fully initialize
        let app_handle = app.clone();
        tauri::async_runtime::spawn(async move {
            tokio::time::sleep(Duration::from_secs(5)).await;
            if let Err(e) = check_for_updates_internal(&app_handle, false).await {
                log::error!("Initial update check failed: {}", e);
            }
        });

        // Schedule periodic checks
        let app_handle = app.clone();
        tauri::async_runtime::spawn(async move {
            loop {
                tokio::time::sleep(Duration::from_secs(UPDATE_CHECK_INTERVAL_SECS)).await;
                log::info!("Running scheduled update check");
                if let Err(e) = check_for_updates_internal(&app_handle, false).await {
                    log::error!("Scheduled update check failed: {}", e);
                }
            }
        });
    }
}

/// Internal function to check for updates
async fn check_for_updates_internal<R: Runtime>(
    app: &AppHandle<R>,
    manual: bool,
) -> Result<(), String> {
    let state = app.state::<UpdaterState>();

    // Prevent concurrent checks
    if state.is_checking() {
        log::info!("Already checking for updates, skipping");
        return Ok(());
    }

    state.set_checking(true);

    // Emit checking event
    let _ = app.emit("updater:checking", ());

    // Update tray menu to show we're checking
    let _ = app.emit("updater:menu-state", "checking");

    match do_update_check(app, manual).await {
        Ok(_) => Ok(()),
        Err(e) => {
            log::error!("Update check error: {}", e);
            let _ = app.emit("updater:error", e.clone());

            // Reset state on error
            state.set_checking(false);
            state.set_update_available(false);
            state.set_update_downloaded(false);

            let _ = app.emit("updater:menu-state", "idle");
            Err(e)
        }
    }
}

/// Perform the actual update check
async fn do_update_check<R: Runtime>(app: &AppHandle<R>, manual: bool) -> Result<(), String> {
    let state = app.state::<UpdaterState>();

    // Get the updater
    let updater = app.updater().map_err(|e| format!("Failed to get updater: {}", e))?;

    // Check for updates
    let update = updater
        .check()
        .await
        .map_err(|e| format!("Failed to check for updates: {}", e))?;

    state.set_checking(false);

    match update {
        Some(update) => {
            log::info!("Update available: {}", update.version);

            state.set_update_available(true);

            // Emit update available event
            let payload = UpdateAvailablePayload {
                version: update.version.clone(),
                current_version: update.current_version.clone(),
                body: update.body.clone(),
            };
            let _ = app.emit("updater:available", payload);

            // Update tray menu
            let _ = app.emit("updater:menu-state", "available");

            // Update tooltip
            let _ = app.emit("updater:tooltip", format!("Update {} available", update.version));

            // Start downloading the update
            download_update(app, &update).await?;
        }
        None => {
            log::info!("No update available");

            state.set_update_available(false);
            state.set_update_downloaded(false);

            let _ = app.emit("updater:not-available", ());

            // Update tray menu
            let _ = app.emit("updater:menu-state", "no-update");

            // If this was a manual check, show "no updates" briefly then hide
            if manual {
                let app_handle = app.clone();
                tauri::async_runtime::spawn(async move {
                    // Use tokio sleep to avoid blocking the async runtime
                    tokio::time::sleep(Duration::from_secs(NO_UPDATE_DISPLAY_SECS)).await;
                    let _ = app_handle.emit("updater:menu-state", "idle");
                });
            } else {
                let _ = app.emit("updater:menu-state", "idle");
            }
        }
    }

    Ok(())
}

/// Download the update
async fn download_update<R: Runtime>(
    app: &AppHandle<R>,
    update: &tauri_plugin_updater::Update,
) -> Result<(), String> {
    log::info!("Downloading update {}", update.version);

    let state = app.state::<UpdaterState>();
    let app_for_progress = app.clone();
    let version = update.version.clone();
    let current_version = update.current_version.clone();

    // Download with progress reporting
    let bytes = update
        .download(
            move |downloaded, total| {
                let percent = total.map(|t| (downloaded as f64 / t as f64) * 100.0).unwrap_or(0.0);

                let payload = DownloadProgressPayload {
                    percent,
                    downloaded: downloaded as u64,
                    total,
                };

                let _ = app_for_progress.emit("updater:downloading", payload);

                // Update tooltip with progress
                let tooltip = format!("Downloading update: {:.1}%", percent);
                let _ = app_for_progress.emit("updater:tooltip", tooltip);
            },
            || {
                // Download finished callback
                log::info!("Download finished");
            },
        )
        .await
        .map_err(|e| format!("Failed to download update: {}", e))?;

    log::info!("Update downloaded ({} bytes), ready to install", bytes.len());

    // Store the bytes and version info for later installation
    // This avoids the race condition of re-checking for updates during install
    state.store_downloaded_update(bytes, version.clone(), current_version);
    state.set_update_downloaded(true);

    // Emit downloaded event
    let _ = app.emit("updater:downloaded", version.clone());

    // Update tray menu
    let _ = app.emit("updater:menu-state", "ready");

    // Update tooltip
    let _ = app.emit("updater:tooltip", "Update ready to install");

    // Show dialog to user asking if they want to restart
    let _ = app.emit("updater:show-restart-dialog", version);

    Ok(())
}

/// Command to manually check for updates
#[tauri::command]
pub async fn check_for_updates<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    log::info!("Manual update check requested");
    check_for_updates_internal(&app, true).await
}

/// Command to install a downloaded update and restart
#[tauri::command]
pub async fn install_update<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    log::info!("Installing update and restarting");

    let state = app.state::<UpdaterState>();

    if !state.is_update_downloaded() {
        return Err("No update has been downloaded".to_string());
    }

    // Get the stored downloaded update (includes bytes and version info)
    let downloaded = state.take_downloaded_update()
        .ok_or_else(|| "Downloaded update not found".to_string())?;

    log::info!(
        "Installing update {} (current: {})",
        downloaded.version,
        downloaded.current_version
    );

    // Get the updater to access the install method
    // We need to check again to get the Update object, but we use the stored bytes
    // to avoid race conditions where a newer version could be released between
    // download and install
    let updater = app.updater().map_err(|e| format!("Failed to get updater: {}", e))?;

    let update = updater
        .check()
        .await
        .map_err(|e| format!("Failed to get updater for install: {}", e))?
        .ok_or_else(|| "No update available for installation".to_string())?;

    // Verify the update version matches what we downloaded
    if update.version != downloaded.version {
        log::warn!(
            "Update version mismatch: downloaded {} but found {}. Proceeding with downloaded version.",
            downloaded.version,
            update.version
        );
    }

    // Install the update using the stored bytes (not re-downloading)
    update
        .install(&downloaded.bytes)
        .map_err(|e| format!("Failed to install update: {}", e))?;

    // The install() call will restart the app, but if it doesn't, restart manually
    app.restart();
}

/// Command to get current update status
#[tauri::command]
pub fn get_update_status<R: Runtime>(app: AppHandle<R>) -> UpdateStatus {
    let state = app.state::<UpdaterState>();

    UpdateStatus {
        checking: state.is_checking(),
        update_available: state.is_update_available(),
        update_downloaded: state.is_update_downloaded(),
    }
}

/// Current update status
#[derive(Clone, serde::Serialize)]
pub struct UpdateStatus {
    pub checking: bool,
    pub update_available: bool,
    pub update_downloaded: bool,
}
