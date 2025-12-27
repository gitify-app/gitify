use keyring::Entry;

const SERVICE_NAME: &str = "io.gitify.app";

// Store for managing token encryption
pub struct TokenStore;

impl TokenStore {
    pub fn new() -> Self {
        Self
    }

    fn get_entry(identifier: &str) -> Result<Entry, String> {
        Entry::new(SERVICE_NAME, identifier)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))
    }
}

/// Encrypt and store a token in the OS keyring
/// identifier: unique key for this token (e.g., "hostname_username")
#[tauri::command]
pub async fn encrypt_token(token: String, identifier: String) -> Result<(), String> {
    let entry = TokenStore::get_entry(&identifier)?;
    entry
        .set_password(&token)
        .map_err(|e| format!("Failed to store token: {}", e))?;
    Ok(())
}

/// Decrypt and retrieve a token from the OS keyring
/// identifier: unique key for this token (e.g., "hostname_username")
#[tauri::command]
pub async fn decrypt_token(identifier: String) -> Result<String, String> {
    let entry = TokenStore::get_entry(&identifier)?;
    entry
        .get_password()
        .map_err(|e| format!("Failed to retrieve token: {}", e))
}

/// Delete stored token from keyring
/// identifier: unique key for this token (e.g., "hostname_username")
#[tauri::command]
pub async fn delete_token(identifier: String) -> Result<(), String> {
    let entry = TokenStore::get_entry(&identifier)?;
    entry
        .delete_password()
        .map_err(|e| format!("Failed to delete token: {}", e))?;
    Ok(())
}

/// Handle OAuth callback URL
#[tauri::command]
pub async fn handle_auth_callback(url: String, app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Emitter;
    // Emit event to frontend with the callback URL
    app.emit("auth-callback", url)
        .map_err(|e| format!("Failed to emit auth callback: {}", e))?;
    Ok(())
}
