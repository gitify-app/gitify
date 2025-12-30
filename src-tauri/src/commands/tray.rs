use std::sync::Mutex;
use tauri::{AppHandle, Manager};
use tauri::image::Image;

/// Tray icon state
#[derive(Debug, Clone)]
pub enum TrayState {
    Idle,
    Active,
    Error,
    Update,
    Offline,
}

/// Tray configuration state
pub struct TrayConfig {
    pub use_alternate_idle: Mutex<bool>,
    pub use_unread_active: Mutex<bool>,
    pub current_state: Mutex<TrayState>,
}

impl TrayConfig {
    pub fn new() -> Self {
        Self {
            use_alternate_idle: Mutex::new(false),
            use_unread_active: Mutex::new(false),
            current_state: Mutex::new(TrayState::Idle),
        }
    }
}

/// Update tray icon based on state
#[tauri::command]
pub async fn update_tray_icon(
    state: String,
    app: AppHandle,
    config: tauri::State<'_, TrayConfig>,
) -> Result<(), String> {
    let tray_state = match state.as_str() {
        "idle" => TrayState::Idle,
        "active" => TrayState::Active,
        "error" => TrayState::Error,
        "update" => TrayState::Update,
        "offline" => TrayState::Offline,
        _ => TrayState::Idle,
    };

    // Store current state
    let mut current = config.current_state.lock().map_err(|e| e.to_string())?;
    *current = tray_state.clone();
    drop(current);

    // Determine which icon to use
    let use_alternate_idle = *config
        .use_alternate_idle
        .lock()
        .map_err(|e| e.to_string())?;
    let use_unread_active = *config.use_unread_active.lock().map_err(|e| e.to_string())?;

    // Use 32x32 icons (correct size for macOS retina menubar)
    let icon_name = match tray_state {
        TrayState::Idle => {
            if use_alternate_idle {
                "idle-alternate.png"
            } else {
                "idle.png"
            }
        }
        TrayState::Active => {
            // If use_unread_active is false, show idle icon instead (matches Electron behavior)
            if use_unread_active {
                "active.png"
            } else if use_alternate_idle {
                "idle-alternate.png"
            } else {
                "idle.png"
            }
        }
        TrayState::Error => "error.png",
        TrayState::Update => "update.png",
        TrayState::Offline => "offline.png",
    };

    // Get icon path
    

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let icon_path = resource_dir.join(format!("icons/tray/{}", icon_name));

    // Update tray icon
    if let Some(tray) = app.tray_by_id("main") {
        // Load and decode PNG image
        let img = image::open(&icon_path)
            .map_err(|e| format!("Failed to open tray icon file at {:?}: {}", icon_path, e))?;

        let rgba = img.to_rgba8();
        let (width, height) = rgba.dimensions();
        let rgba_bytes = rgba.into_raw();

        let icon = Image::new_owned(rgba_bytes, width, height);

        tray.set_icon(Some(icon))
            .map_err(|e| format!("Failed to set tray icon: {}", e))?;

        // Mark icon as template for macOS (auto-adapts to menubar theme)
        // Only idle.png is a template (adapts black/white based on menubar theme)
        // idle-alternate.png is always white, not a template
        // active/error/update keep their colors, not templates
        #[cfg(target_os = "macos")]
        {
            let is_template = icon_name == "idle.png";
            tray.set_icon_as_template(is_template)
                .map_err(|e| format!("Failed to set icon template mode: {}", e))?;
        }
    } else {
        return Err("Tray not found".to_string());
    }

    Ok(())
}

/// Update tray title (macOS notification count)
#[tauri::command]
pub async fn update_tray_title(title: String, app: AppHandle) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        // On macOS, set the tray title to show notification count
        #[cfg(target_os = "macos")]
        {
            tray.set_title(Some(&title))
                .map_err(|e| format!("Failed to set tray title: {}", e))?;
        }

        // On other platforms, update the tooltip instead
        #[cfg(not(target_os = "macos"))]
        {
            let tooltip = if title.is_empty() {
                "Gitify".to_string()
            } else {
                format!("Gitify - {}", title)
            };
            tray.set_tooltip(Some(&tooltip))
                .map_err(|e| format!("Failed to set tray tooltip: {}", e))?;
        }

        Ok(())
    } else {
        Err("Tray not found".to_string())
    }
}

/// Set whether to use alternate idle icon
#[tauri::command]
pub async fn set_alternate_idle_icon(
    enabled: bool,
    app: AppHandle,
    config: tauri::State<'_, TrayConfig>,
) -> Result<(), String> {
    {
        let mut use_alternate = config
            .use_alternate_idle
            .lock()
            .map_err(|e| e.to_string())?;
        *use_alternate = enabled;
    }

    // Update icon if currently in idle state
    let should_update = {
        let current_state = config.current_state.lock().map_err(|e| e.to_string())?;
        matches!(*current_state, TrayState::Idle)
    };

    if should_update {
        update_tray_icon("idle".to_string(), app, config).await?;
    }

    Ok(())
}

/// Set whether to use unread active icon
#[tauri::command]
pub async fn set_unread_active_icon(
    enabled: bool,
    app: AppHandle,
    config: tauri::State<'_, TrayConfig>,
) -> Result<(), String> {
    {
        let mut use_unread = config.use_unread_active.lock().map_err(|e| e.to_string())?;
        *use_unread = enabled;
    }

    // Update icon if currently in active state
    let should_update = {
        let current_state = config.current_state.lock().map_err(|e| e.to_string())?;
        matches!(*current_state, TrayState::Active)
    };

    if should_update {
        update_tray_icon("active".to_string(), app, config).await?;
    }

    Ok(())
}

/// Set tray tooltip
#[tauri::command]
pub async fn set_tray_tooltip(tooltip: String, app: AppHandle) -> Result<(), String> {
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_tooltip(Some(&tooltip))
            .map_err(|e| format!("Failed to set tray tooltip: {}", e))?;
        Ok(())
    } else {
        Err("Tray not found".to_string())
    }
}
