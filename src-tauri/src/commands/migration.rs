use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct ElectronSettings {
    pub accounts: Option<serde_json::Value>,
    pub settings: Option<serde_json::Value>,
    pub notifications: Option<serde_json::Value>,
}

/// Get Electron user data directory path
#[tauri::command]
pub fn get_electron_storage_path() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or_else(|| "Failed to get home directory".to_string())?;

    // Electron userData paths by platform
    let electron_path = if cfg!(target_os = "macos") {
        home_dir.join("Library/Application Support/Gitify")
    } else if cfg!(target_os = "windows") {
        home_dir.join("AppData/Roaming/Gitify")
    } else {
        // Linux
        home_dir.join(".config/Gitify")
    };

    electron_path
        .to_str()
        .ok_or_else(|| "Invalid path".to_string())
        .map(|s| s.to_string())
}

/// Check if Electron data exists
#[tauri::command]
pub fn electron_data_exists() -> Result<bool, String> {
    let electron_path = get_electron_storage_path()?;
    Ok(PathBuf::from(electron_path).exists())
}

/// Migrate data from Electron version
#[tauri::command]
pub async fn migrate_electron_data(app: AppHandle) -> Result<ElectronSettings, String> {
    let electron_path = get_electron_storage_path()?;
    let electron_dir = PathBuf::from(&electron_path);

    if !electron_dir.exists() {
        return Err("Electron data directory not found".to_string());
    }

    // Try to read localStorage-like data
    // Electron typically stores data in a file like "Local Storage/leveldb"
    // For simplicity, we'll look for JSON files or specific patterns

    let mut settings = ElectronSettings {
        accounts: None,
        settings: None,
        notifications: None,
    };

    // Try to read common Electron storage patterns
    // Note: This is a simplified version - actual implementation may need
    // to parse Electron's leveldb or chromium storage format

    // Look for JSON files in the directory
    if let Ok(entries) = fs::read_dir(&electron_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("json") {
                if let Ok(content) = fs::read_to_string(&path) {
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                        // Try to identify what type of data this is
                        let filename = path.file_name().and_then(|s| s.to_str()).unwrap_or("");

                        if filename.contains("account") {
                            settings.accounts = Some(json);
                        } else if filename.contains("setting") {
                            settings.settings = Some(json);
                        } else if filename.contains("notification") {
                            settings.notifications = Some(json);
                        }
                    }
                }
            }
        }
    }

    // If no JSON files found, try to read from localStorage
    // In Electron, localStorage is typically stored in:
    // - macOS: ~/Library/Application Support/Gitify/Local Storage/leveldb
    // - Windows: AppData/Roaming/Gitify/Local Storage/leveldb
    // - Linux: ~/.config/Gitify/Local Storage/leveldb

    let local_storage_path = electron_dir.join("Local Storage");
    if local_storage_path.exists() {
        // For now, we'll emit a warning that manual migration may be needed
        // Full implementation would require leveldb parsing
        eprintln!("Found Local Storage directory - manual migration may be needed");
    }

    // Store migration completion flag
    

    let tauri_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    fs::create_dir_all(&tauri_data_dir)
        .map_err(|e| format!("Failed to create data directory: {}", e))?;

    let migration_flag = tauri_data_dir.join(".migration_complete");
    fs::write(&migration_flag, "true")
        .map_err(|e| format!("Failed to write migration flag: {}", e))?;

    Ok(settings)
}

/// Check if migration has been completed
#[tauri::command]
pub fn is_migration_complete(app: AppHandle) -> Result<bool, String> {
    

    let tauri_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let migration_flag = tauri_data_dir.join(".migration_complete");
    Ok(migration_flag.exists())
}

/// Mark migration as complete (for manual migration)
#[tauri::command]
pub fn mark_migration_complete(app: AppHandle) -> Result<(), String> {
    

    let tauri_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    fs::create_dir_all(&tauri_data_dir)
        .map_err(|e| format!("Failed to create data directory: {}", e))?;

    let migration_flag = tauri_data_dir.join(".migration_complete");
    fs::write(&migration_flag, "true")
        .map_err(|e| format!("Failed to write migration flag: {}", e))?;

    Ok(())
}
