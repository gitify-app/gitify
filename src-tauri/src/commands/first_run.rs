//! First-run experience for Gitify.
//!
//! On macOS, this module handles prompting users to move the app to the
//! Applications folder on first run, providing a better user experience.

use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Validate that an app name contains only safe characters for AppleScript.
///
/// This prevents injection attacks through maliciously crafted app bundle names.
/// Only allows alphanumeric characters, spaces, hyphens, underscores, and periods.
#[cfg(target_os = "macos")]
fn is_safe_app_name(name: &str) -> bool {
    !name.is_empty()
        && name
            .chars()
            .all(|c| c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' || c == '.')
}

/// The folder name used to store first-run state.
const FIRST_RUN_FOLDER: &str = "gitify-first-run";

/// Get the path to the first-run marker file.
fn get_first_run_marker_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    Ok(app_data_dir.join("FirstRun").join(FIRST_RUN_FOLDER))
}

/// Check if this is the first run of the application.
///
/// Returns `true` if the first-run marker file does not exist, indicating
/// this is the first time the app has been launched.
#[tauri::command]
pub fn is_first_run(app: AppHandle) -> Result<bool, String> {
    let marker_path = get_first_run_marker_path(&app)?;
    Ok(!marker_path.exists())
}

/// Mark the first run as complete by creating the marker file.
///
/// This should be called after the first-run experience has been handled,
/// regardless of whether the user chose to move the app or not.
#[tauri::command]
pub fn mark_first_run_complete(app: AppHandle) -> Result<(), String> {
    let marker_path = get_first_run_marker_path(&app)?;

    // Create the parent directory if it doesn't exist
    if let Some(parent) = marker_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create first-run directory: {}", e))?;
    }

    // Write an empty marker file
    fs::write(&marker_path, "")
        .map_err(|e| format!("Failed to write first-run marker: {}", e))?;

    log::info!("First run marked as complete");
    Ok(())
}

/// Check if the app is running from the Applications folder (macOS only).
///
/// On non-macOS platforms, this always returns `true` (no action needed).
#[tauri::command]
pub fn is_in_applications_folder() -> bool {
    #[cfg(target_os = "macos")]
    {
        if let Ok(exe_path) = std::env::current_exe() {
            let path_str = exe_path.to_string_lossy();

            // Check if running from /Applications or ~/Applications
            if path_str.contains("/Applications/") {
                return true;
            }

            // Check user's Applications folder
            if let Some(home) = dirs::home_dir() {
                let user_apps = home.join("Applications");
                if path_str.starts_with(&user_apps.to_string_lossy().to_string()) {
                    return true;
                }
            }

            // Also return true if running in dev mode (from target/debug or similar)
            if path_str.contains("/target/debug/")
                || path_str.contains("/target/release/")
                || path_str.contains(".app/Contents/MacOS/") && path_str.contains("/gitify-tauri/")
            {
                log::debug!("Running in development mode, skipping Applications check");
                return true;
            }

            return false;
        }
        true // Default to true if we can't determine the path
    }

    #[cfg(not(target_os = "macos"))]
    {
        true // Not applicable on other platforms
    }
}

/// Check if the app is running in development mode.
///
/// Returns `true` if the app is running from a development build location.
#[tauri::command]
pub fn is_dev_mode() -> bool {
    // Check if running from a development path
    if let Ok(exe_path) = std::env::current_exe() {
        let path_str = exe_path.to_string_lossy();

        // Common development paths
        if path_str.contains("/target/debug/")
            || path_str.contains("/target/release/")
            || path_str.contains("\\target\\debug\\")
            || path_str.contains("\\target\\release\\")
        {
            return true;
        }
    }

    // Also check the TAURI_DEBUG environment variable
    if std::env::var("TAURI_DEBUG").is_ok() {
        return true;
    }

    // Check if the debug_assertions cfg is set (only true in debug builds)
    cfg!(debug_assertions)
}

/// Check if the app is running in development mode (sync version for internal use).
#[cfg(target_os = "macos")]
fn is_dev_mode_internal() -> bool {
    // Check if running from a development path
    if let Ok(exe_path) = std::env::current_exe() {
        let path_str = exe_path.to_string_lossy();

        // Common development paths
        if path_str.contains("/target/debug/")
            || path_str.contains("/target/release/")
            || path_str.contains("\\target\\debug\\")
            || path_str.contains("\\target\\release\\")
        {
            return true;
        }
    }

    // Also check the TAURI_DEBUG environment variable
    if std::env::var("TAURI_DEBUG").is_ok() {
        return true;
    }

    // Check if the debug_assertions cfg is set (only true in debug builds)
    cfg!(debug_assertions)
}

/// Get the current executable path.
#[tauri::command]
pub fn get_current_exe_path() -> Result<String, String> {
    std::env::current_exe()
        .map_err(|e| format!("Failed to get current executable path: {}", e))?
        .to_str()
        .ok_or_else(|| "Invalid executable path".to_string())
        .map(|s| s.to_string())
}

/// Attempt to move the app bundle to the Applications folder (macOS only).
///
/// This uses AppleScript to invoke Finder's move operation, which properly
/// handles permissions and creates the necessary dialogs.
///
/// # Returns
/// - `Ok(true)` if the move was successful
/// - `Ok(false)` if the move was cancelled or not applicable
/// - `Err(...)` if an error occurred
#[tauri::command]
pub async fn move_to_applications_folder() -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        // Get the current executable path to find the app bundle
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get executable path: {}", e))?;

        // Navigate up to find the .app bundle
        // Path is typically: /path/to/App.app/Contents/MacOS/executable
        let app_bundle = exe_path
            .parent() // Contents/MacOS
            .and_then(|p| p.parent()) // Contents
            .and_then(|p| p.parent()) // App.app
            .ok_or_else(|| "Could not find app bundle path".to_string())?;

        let app_name = app_bundle
            .file_name()
            .and_then(|s| s.to_str())
            .ok_or_else(|| "Could not get app name".to_string())?;

        // Verify it's actually an app bundle
        if !app_name.ends_with(".app") {
            return Err("Not running from an app bundle".to_string());
        }

        let source_path = app_bundle.to_string_lossy();
        let dest_path = format!("/Applications/{}", app_name);

        // Validate app name to prevent AppleScript injection attacks
        if !is_safe_app_name(app_name) {
            return Err("Invalid app name: contains unsafe characters".to_string());
        }

        // Check if destination already exists
        if PathBuf::from(&dest_path).exists() {
            // Use AppleScript to ask user if they want to replace
            let script = format!(
                r#"
                set appExists to true
                try
                    tell application "Finder"
                        set existingApp to POSIX file "{dest_path}" as alias
                        display dialog "An older version of {app_name} exists in Applications. Replace it?" buttons {{"Cancel", "Replace"}} default button "Replace" with icon caution
                        if button returned of result is "Replace" then
                            delete existingApp
                        else
                            return "cancelled"
                        end if
                    end tell
                on error
                    return "cancelled"
                end try
                "#,
                dest_path = dest_path,
                app_name = app_name
            );

            let output = Command::new("osascript")
                .arg("-e")
                .arg(&script)
                .output()
                .map_err(|e| format!("Failed to run AppleScript: {}", e))?;

            let result = String::from_utf8_lossy(&output.stdout);
            if result.trim() == "cancelled" {
                return Ok(false);
            }
        }

        // Use AppleScript to move the app via Finder (handles permissions properly)
        let move_script = format!(
            r#"
            try
                tell application "Finder"
                    set sourceApp to POSIX file "{source}" as alias
                    set destFolder to POSIX file "/Applications" as alias
                    move sourceApp to destFolder with replacing
                end tell
                return "success"
            on error errMsg
                return "error: " & errMsg
            end try
            "#,
            source = source_path
        );

        let output = Command::new("osascript")
            .arg("-e")
            .arg(&move_script)
            .output()
            .map_err(|e| format!("Failed to run move script: {}", e))?;

        let result = String::from_utf8_lossy(&output.stdout);

        if result.trim() == "success" {
            log::info!("Successfully moved app to Applications folder");

            // Launch the new app and quit this instance
            let launch_script = format!(
                r#"
                delay 1
                tell application "{}"
                    activate
                end tell
                "#,
                app_name.trim_end_matches(".app")
            );

            // Run launch in background and don't wait
            let _ = Command::new("osascript")
                .arg("-e")
                .arg(&launch_script)
                .spawn();

            Ok(true)
        } else if result.contains("error:") {
            Err(format!("Failed to move app: {}", result))
        } else {
            Ok(false)
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        // Not applicable on other platforms
        Ok(false)
    }
}

/// Show the first-run dialog asking user to move to Applications folder.
///
/// This is a convenience command that can be called from the frontend to show
/// a native dialog asking the user if they want to move the app.
///
/// # Returns
/// - `Ok(true)` if the user chose to move and the move was successful
/// - `Ok(false)` if the user declined or cancelled
/// - `Err(...)` if an error occurred
#[tauri::command]
pub async fn prompt_move_to_applications(app: AppHandle) -> Result<bool, String> {
    #[cfg(target_os = "macos")]
    use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

    // Only relevant on macOS
    #[cfg(not(target_os = "macos"))]
    {
        mark_first_run_complete(app)?;
        return Ok(false);
    }

    #[cfg(target_os = "macos")]
    {
        // Skip in dev mode
        if is_dev_mode_internal() {
            log::debug!("Skipping first-run dialog in development mode");
            mark_first_run_complete(app)?;
            return Ok(false);
        }

        // Skip if already in Applications
        if is_in_applications_folder() {
            log::debug!("App is already in Applications folder");
            mark_first_run_complete(app)?;
            return Ok(false);
        }

        // Show dialog asking user if they want to move
        let confirmed = app
            .dialog()
            .message("Would you like to move Gitify to the Applications folder?\n\nThis will ensure updates work correctly and the app appears in Spotlight.")
            .title("Move to Applications Folder?")
            .kind(MessageDialogKind::Info)
            .buttons(MessageDialogButtons::OkCancelCustom(
                "Move to Applications".to_string(),
                "Not Now".to_string(),
            ))
            .blocking_show();

        // Mark first run complete regardless of user choice
        // Clone app handle before consuming it so we can use it for exit
        let app_for_exit = app.clone();
        mark_first_run_complete(app)?;

        if confirmed {
            match move_to_applications_folder().await {
                Ok(true) => {
                    // App was moved, we should quit this instance
                    // The new instance will be launched by the move function
                    // Use Tauri's exit method for proper cleanup instead of std::process::exit
                    app_for_exit.exit(0);
                    Ok(true) // This line won't be reached but satisfies the return type
                }
                Ok(false) => Ok(false),
                Err(e) => {
                    log::error!("Failed to move app to Applications: {}", e);
                    Err(e)
                }
            }
        } else {
            log::info!("User declined to move app to Applications folder");
            Ok(false)
        }
    }
}

/// Handle the complete first-run experience.
///
/// This is the main entry point that should be called on app startup.
/// It checks if this is the first run and handles the move-to-Applications
/// prompt on macOS.
///
/// # Returns
/// - `Ok(true)` if this was the first run and it was handled
/// - `Ok(false)` if this was not the first run
/// - `Err(...)` if an error occurred
#[tauri::command]
pub async fn handle_first_run(app: AppHandle) -> Result<bool, String> {
    // Check if this is the first run
    let first_run = is_first_run(app.clone())?;

    if !first_run {
        log::debug!("Not first run, skipping first-run experience");
        return Ok(false);
    }

    log::info!("First run detected, initiating first-run experience");

    // Prompt to move to Applications folder (macOS only)
    prompt_move_to_applications(app).await?;

    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_dev_mode_in_debug() {
        // In debug builds, this should return true
        #[cfg(debug_assertions)]
        assert!(is_dev_mode());
    }

    #[test]
    fn test_is_in_applications_folder() {
        // This test just ensures the function doesn't panic
        let _result = is_in_applications_folder();
    }

    #[test]
    fn test_get_current_exe_path() {
        // This should succeed in test environment
        let result = get_current_exe_path();
        assert!(result.is_ok());
    }
}
