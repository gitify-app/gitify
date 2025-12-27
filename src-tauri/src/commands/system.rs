use tauri::{AppHandle, Manager};

/// Open external URL in default browser
#[tauri::command]
pub async fn open_external_link(url: String) -> Result<(), String> {
    tauri_plugin_opener::open_url(&url, None::<&str>)
        .map_err(|e| format!("Failed to open URL: {}", e))?;
    Ok(())
}

/// Get notification sound path
#[tauri::command]
pub fn get_notification_sound_path(app: AppHandle) -> Result<String, String> {
    

    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let sound_path = resource_path.join("assets/sounds/notification.mp3");

    sound_path
        .to_str()
        .ok_or_else(|| "Invalid sound path".to_string())
        .map(|s| s.to_string())
}

/// Get Twemoji directory path
/// Returns the path where twemoji SVG files are stored (without /svg subdirectory)
#[tauri::command]
pub fn get_twemoji_directory(app: AppHandle) -> Result<String, String> {
    let resource_path = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    // Return the twemoji directory path (SVGs are directly in this directory, not in /svg subdirectory)
    let twemoji_path = resource_path.join("assets/twemoji");

    twemoji_path
        .to_str()
        .ok_or_else(|| "Invalid twemoji path".to_string())
        .map(|s| s.to_string())
}

/// Check if native notifications are supported
/// Note: We use the Web Notification API from the frontend since Tauri's
/// notification plugin doesn't support click handlers on desktop platforms.
/// This command is kept for future use if Tauri adds click support.
#[tauri::command]
pub fn check_notification_support(app: AppHandle) -> Result<bool, String> {
    use tauri_plugin_notification::NotificationExt;

    // Check if the notification plugin is available and can show notifications
    let builder = app.notification().builder();
    // If we can create a builder, notifications are supported
    drop(builder);
    Ok(true)
}

/// Get platform information
#[tauri::command]
pub fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

/// Get app data directory
#[tauri::command]
pub fn get_app_data_dir(app: AppHandle) -> Result<String, String> {
    

    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    app_data
        .to_str()
        .ok_or_else(|| "Invalid app data path".to_string())
        .map(|s| s.to_string())
}

/// Get app log directory
#[tauri::command]
pub fn get_app_log_dir(app: AppHandle) -> Result<String, String> {
    

    let log_dir = app
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get log directory: {}", e))?;

    log_dir
        .to_str()
        .ok_or_else(|| "Invalid log path".to_string())
        .map(|s| s.to_string())
}
