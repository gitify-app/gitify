mod commands;

use commands::{tray::TrayConfig, updater::UpdaterState};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, Emitter, Manager};

/// Debounce state for tray icon clicks
struct ClickDebounce {
    last_click: Mutex<Option<Instant>>,
}

/// Setup system tray with menu and event handlers
fn setup_tray(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // Build Developer submenu
    let developer_menu = SubmenuBuilder::new(app, "Developer")
        .text("reload", "Reload")
        .text("devtools", "Toggle DevTools")
        .text("screenshot", "Take Screenshot")
        .text("logs", "View Application Logs")
        .separator()
        .text("repository", "Visit Repository")
        .text("reset", "Reset Gitify")
        .build()?;

    // Build update menu items (some hidden by default)
    let check_updates_item = MenuItemBuilder::with_id("check-updates", "Check for Updates")
        .build(app)?;

    let checking_updates_item = MenuItemBuilder::with_id("checking-updates", "Checking for Updates...")
        .enabled(false)
        .build(app)?;

    let update_available_item = MenuItemBuilder::with_id("update-available", "Update Available")
        .enabled(false)
        .build(app)?;

    let no_update_item = MenuItemBuilder::with_id("no-update", "No Updates Available")
        .enabled(false)
        .build(app)?;

    let restart_to_update_item = MenuItemBuilder::with_id("restart-to-update", "Restart to Update")
        .build(app)?;

    // Build main tray menu
    let menu = MenuBuilder::new(app)
        .item(&check_updates_item)
        .item(&checking_updates_item)
        .item(&update_available_item)
        .item(&no_update_item)
        .item(&restart_to_update_item)
        .separator()
        .item(&developer_menu)
        .separator()
        .text("website", "Visit Website")
        .text("quit", "Quit Gitify")
        .build()?;

    // Create tray icon with menu
    // Load the idle tray icon
    let resource_dir = app.path().resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    // Use 32x32 icons (correct size for macOS retina menubar)
    let icon_path = resource_dir.join("icons/tray/idle.png");

    let img = image::open(&icon_path)
        .map_err(|e| format!("Failed to open tray icon at {:?}: {}", icon_path, e))?;
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();
    let tray_icon = tauri::image::Image::new_owned(rgba.into_raw(), width, height);

    let _tray = TrayIconBuilder::with_id("main")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .icon(tray_icon)
        .tooltip("Gitify")
        .icon_as_template(true) // Use template mode on macOS
        .on_menu_event(move |app, event| {
            match event.id().as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "website" => {
                    if let Err(e) = tauri_plugin_opener::open_url(
                        "https://www.gitify.io/",
                        None::<&str>,
                    ) {
                        log::error!("Failed to open website: {}", e);
                    }
                }
                "repository" => {
                    if let Err(e) = tauri_plugin_opener::open_url(
                        "https://github.com/gitify-app/gitify",
                        None::<&str>,
                    ) {
                        log::error!("Failed to open repository: {}", e);
                    }
                }
                "check-updates" => {
                    // Trigger update check via command
                    let app_handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        if let Err(e) = commands::updater::check_for_updates(app_handle).await {
                            log::error!("Failed to check for updates: {}", e);
                        }
                    });
                }
                "restart-to-update" => {
                    // Install update and restart
                    let app_handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        if let Err(e) = commands::updater::install_update(app_handle).await {
                            log::error!("Failed to install update: {}", e);
                        }
                    });
                }
                "reload" => {
                    // Reload the webview
                    if let Some(window) = app.get_webview_window("main") {
                        if let Err(e) = window.eval("window.location.reload()") {
                            log::error!("Failed to reload window: {}", e);
                        }
                    }
                }
                "devtools" => {
                    // Toggle DevTools
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_devtools_open() {
                            window.close_devtools();
                        } else {
                            window.open_devtools();
                        }
                    }
                }
                "screenshot" => {
                    // Emit event to frontend to take screenshot
                    if let Err(e) = app.emit("take-screenshot", ()) {
                        log::error!("Failed to emit take-screenshot event: {}", e);
                    }
                }
                "logs" => {
                    // Emit event to frontend to open logs
                    if let Err(e) = app.emit("view-logs", ()) {
                        log::error!("Failed to emit view-logs event: {}", e);
                    }
                }
                "reset" => {
                    // Emit event to frontend to reset app
                    if let Err(e) = app.emit("reset-app", ()) {
                        log::error!("Failed to emit reset-app event: {}", e);
                    }
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            let app = tray.app_handle();

            match event {
                TrayIconEvent::Click {
                    button,
                    button_state,
                    ..
                } => {
                    if button == MouseButton::Left && button_state == MouseButtonState::Up {
                        // Debounce clicks - ignore if less than 200ms since last click
                        let debounce = app.state::<ClickDebounce>();
                        let should_process = {
                            let mut last = debounce.last_click.lock().unwrap_or_else(|e| e.into_inner());
                            let now = Instant::now();

                            let should_process = match *last {
                                Some(last_time) => now.duration_since(last_time) > Duration::from_millis(200),
                                None => true,
                            };

                            if should_process {
                                *last = Some(now);
                            }

                            should_process
                        };

                        if !should_process {
                            log::debug!("Click ignored (debounce)");
                            return;
                        }

                        // Left-click: Toggle window visibility
                        if let Some(window) = app.get_webview_window("main") {
                            let is_visible = window.is_visible().unwrap_or(false);
                            log::debug!("Window visible: {}", is_visible);

                            if is_visible {
                                log::debug!("Hiding window");
                                if let Err(e) = window.hide() {
                                    log::error!("Failed to hide window: {}", e);
                                }
                            } else {
                                log::debug!("Showing window");

                                // Position window - use absolute positioning for reliability
                                use tauri::PhysicalPosition;

                                // Always position at top-right, regardless of platform
                                // Default to a safe position if we can't get screen info
                                let (x, y) = {
                                    #[cfg(target_os = "macos")]
                                    {
                                        // Try to get screen dimensions, fallback to reasonable defaults
                                        if let Ok(Some(monitor)) = window.current_monitor() {
                                            let size = monitor.size();
                                            let window_size = window.outer_size().unwrap_or(tauri::PhysicalSize::new(500, 600));

                                            let pos_x = (size.width as i32 - window_size.width as i32 - 20).max(0);
                                            let pos_y = 40; // Below menubar

                                            log::debug!("Screen size: {}x{}, Window size: {}x{}", size.width, size.height, window_size.width, window_size.height);
                                            log::debug!("Positioning window at x={}, y={}", pos_x, pos_y);
                                            (pos_x, pos_y)
                                        } else {
                                            log::debug!("Could not get monitor, using default position");
                                            (1200, 40) // Fallback position
                                        }
                                    }
                                    #[cfg(not(target_os = "macos"))]
                                    {
                                        (1200, 40) // Default for other platforms
                                    }
                                };

                                if let Err(e) = window.set_position(PhysicalPosition::new(x, y)) {
                                    log::error!("Failed to set window position: {}", e);
                                }

                                // Show window
                                log::debug!("Calling show()");
                                if let Err(e) = window.show() {
                                    log::error!("Error showing window: {}", e);
                                }

                                log::debug!("Calling set_focus()");
                                if let Err(e) = window.set_focus() {
                                    log::error!("Failed to set window focus: {}", e);
                                }

                                if window.is_minimized().unwrap_or(false) {
                                    log::debug!("Unminimizing window");
                                    if let Err(e) = window.unminimize() {
                                        log::error!("Failed to unminimize window: {}", e);
                                    }
                                }

                                log::debug!("Window should be visible now");
                            }
                        }
                    }
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Initialize plugins
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        // Updater plugin - requires proper signing configuration for production
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            // When a second instance is detected, focus the existing window
            if let Some(window) = app.get_webview_window("main") {
                if let Err(e) = window.show() {
                    log::error!("Failed to show window on second instance: {}", e);
                }
                if let Err(e) = window.set_focus() {
                    log::error!("Failed to focus window on second instance: {}", e);
                }
                if let Err(e) = window.unminimize() {
                    log::error!("Failed to unminimize window on second instance: {}", e);
                }
            }

            // Check if any arg is a deep link (OAuth callback)
            for arg in &args {
                if arg.starts_with("gitify://oauth") || arg.starts_with("gitify://callback") {
                    log::debug!("OAuth callback from args: {}", arg);
                    if let Err(e) = app.emit("auth-callback", arg.clone()) {
                        log::error!("Failed to emit auth-callback from args: {}", e);
                    }
                    return;
                }
            }

            // Emit event with args for other cases
            if !args.is_empty() {
                if let Err(e) = app.emit("second-instance", args) {
                    log::error!("Failed to emit second-instance event: {}", e);
                }
            }
        }))
        // Initialize state
        .manage(TrayConfig::new())
        .manage(UpdaterState::new())
        .manage(ClickDebounce {
            last_click: Mutex::new(None),
        })
        // Register all commands
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            commands::auth::encrypt_token,
            commands::auth::decrypt_token,
            commands::auth::delete_token,
            commands::auth::handle_auth_callback,
            commands::auth::exchange_oauth_code,
            commands::auth::exchange_github_app_code,
            commands::auth::get_github_app_client_id,
            // App commands
            commands::app::show_window,
            commands::app::hide_window,
            commands::app::toggle_window,
            commands::app::quit_app,
            commands::app::get_app_version,
            commands::app::center_window,
            commands::app::set_window_size,
            commands::app::set_always_on_top,
            // Tray commands
            commands::tray::update_tray_icon,
            commands::tray::update_tray_title,
            commands::tray::set_alternate_idle_icon,
            commands::tray::set_unread_active_icon,
            commands::tray::set_tray_tooltip,
            // System commands
            commands::system::open_external_link,
            commands::system::get_notification_sound_path,
            commands::system::get_twemoji_directory,
            commands::system::check_notification_support,
            commands::system::get_platform,
            commands::system::get_app_data_dir,
            commands::system::get_app_log_dir,
            // Migration commands
            commands::migration::get_electron_storage_path,
            commands::migration::electron_data_exists,
            commands::migration::migrate_electron_data,
            commands::migration::is_migration_complete,
            commands::migration::mark_migration_complete,
            // Updater commands
            commands::updater::check_for_updates,
            commands::updater::install_update,
            commands::updater::get_update_status,
            // First-run commands
            commands::first_run::is_first_run,
            commands::first_run::mark_first_run_complete,
            commands::first_run::is_in_applications_folder,
            commands::first_run::is_dev_mode,
            commands::first_run::get_current_exe_path,
            commands::first_run::move_to_applications_folder,
            commands::first_run::prompt_move_to_applications,
            commands::first_run::handle_first_run,
        ])
        .setup(|app| {
            // Hide dock icon on macOS (menubar-only app)
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Setup system tray
            setup_tray(app)?;

            // Configure window appearance for rounded corners
            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("main") {
                use objc2_app_kit::{NSColor, NSWindow, NSWindowStyleMask};

                // SAFETY: We verify the pointer is non-null before dereferencing.
                // The ns_window() method returns a valid NSWindow pointer when the
                // window exists (which we've verified via get_webview_window).
                unsafe {
                    let ns_window_ptr = window.ns_window();
                    if let Ok(ptr) = ns_window_ptr {
                        let ns_window = ptr as *mut NSWindow;
                        if !ns_window.is_null() {
                            // Make window background transparent
                            (*ns_window).setOpaque(false);
                            (*ns_window).setBackgroundColor(Some(&NSColor::clearColor()));

                            // Set style mask to support rounded corners
                            let mut style_mask = (*ns_window).styleMask();
                            style_mask |= NSWindowStyleMask::FullSizeContentView;
                            style_mask |= NSWindowStyleMask::UnifiedTitleAndToolbar;
                            (*ns_window).setStyleMask(style_mask);

                            // Make titlebar transparent
                            (*ns_window).setTitlebarAppearsTransparent(true);

                            // Set corner radius on content view layer
                            if let Some(content_view) = (*ns_window).contentView() {
                                content_view.setWantsLayer(true);
                                if let Some(layer) = content_view.layer() {
                                    layer.setCornerRadius(12.0);
                                    layer.setMasksToBounds(true);
                                }
                            }

                            // Enable shadow
                            (*ns_window).setHasShadow(true);
                        }
                    }
                }
            }

            // Setup window event listeners
            // Hide window when it loses focus (menubar dropdown behavior)
            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        // Only hide if window is actually visible
                        if window_clone.is_visible().unwrap_or(false) {
                            if let Err(e) = window_clone.hide() {
                                log::error!("Failed to hide window on focus loss: {}", e);
                            }
                        }
                    }
                });
            }

            // Handle deep link registration for OAuth callbacks
            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;

                // Register the gitify:// protocol (required for Linux and Windows)
                // On macOS, the protocol is registered via Info.plist automatically
                #[cfg(any(target_os = "linux", target_os = "windows"))]
                {
                    if let Err(e) = app.deep_link().register("gitify") {
                        log::error!("Failed to register deep link protocol: {}", e);
                    }
                }

                // Check for startup deep links (app launched via deep link)
                if let Ok(Some(urls)) = app.deep_link().get_current() {
                    log::debug!("Startup deep links: {:?}", urls);
                    let app_handle = app.handle().clone();
                    for url in urls {
                        let url_str = url.to_string();
                        if url_str.starts_with("gitify://oauth") || url_str.starts_with("gitify://callback") {
                            log::debug!("Startup OAuth callback: {}", url_str);
                            // Delay emit slightly to ensure frontend is ready
                            let handle = app_handle.clone();
                            let url_clone = url_str.clone();
                            std::thread::spawn(move || {
                                std::thread::sleep(std::time::Duration::from_millis(500));
                                if let Err(e) = handle.emit("auth-callback", url_clone) {
                                    log::error!("Failed to emit startup auth-callback: {}", e);
                                }
                            });
                        }
                    }
                }

                // Clone app handle for the closure
                let app_handle = app.handle().clone();

                // Listen for deep link events (OAuth callbacks)
                app.deep_link().on_open_url(move |event| {
                    let urls = event.urls();
                    log::debug!("Deep link received: {:?}", urls);

                    for url in urls {
                        let url_str = url.to_string();
                        // Check if this is an OAuth callback
                        if url_str.starts_with("gitify://oauth") || url_str.starts_with("gitify://callback") {
                            log::debug!("OAuth callback detected: {}", url_str);
                            // Emit auth-callback event to frontend
                            if let Err(e) = app_handle.emit("auth-callback", url_str.clone()) {
                                log::error!("Failed to emit auth-callback event: {}", e);
                            }

                            // Show and focus the window
                            if let Some(window) = app_handle.get_webview_window("main") {
                                if let Err(e) = window.show() {
                                    log::error!("Failed to show window on deep link: {}", e);
                                }
                                if let Err(e) = window.set_focus() {
                                    log::error!("Failed to focus window on deep link: {}", e);
                                }
                            }
                        }
                    }
                });
            }

            // Start the auto-updater
            commands::updater::start_updater(app.handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
