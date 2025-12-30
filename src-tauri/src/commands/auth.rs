use keyring::Entry;
use serde::{Deserialize, Serialize};

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

/// Response from GitHub OAuth token exchange
#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthTokenResponse {
    pub access_token: Option<String>,
    pub token_type: Option<String>,
    pub scope: Option<String>,
    pub error: Option<String>,
    pub error_description: Option<String>,
    pub error_uri: Option<String>,
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

/// Internal function to perform the OAuth token exchange
async fn do_exchange_oauth_code(
    hostname: &str,
    client_id: &str,
    client_secret: &str,
    code: &str,
) -> Result<String, String> {
    let url = format!("https://{}/login/oauth/access_token", hostname);

    // Build the request body
    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("code", code),
    ];

    // Create HTTP client
    let client = reqwest::Client::new();

    // Make the POST request to exchange the code for a token
    let response = client
        .post(&url)
        .header("Accept", "application/json")
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Failed to send OAuth request: {}", e))?;

    // Check if the request was successful
    if !response.status().is_success() {
        return Err(format!(
            "OAuth token exchange failed with status: {}",
            response.status()
        ));
    }

    // Parse the response
    let token_response: OAuthTokenResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OAuth response: {}", e))?;

    // Check for OAuth errors in the response body
    if let Some(error) = token_response.error {
        let description = token_response
            .error_description
            .unwrap_or_else(|| "Unknown error".to_string());
        return Err(format!("OAuth error: {} - {}", error, description));
    }

    // Extract the access token
    token_response
        .access_token
        .ok_or_else(|| "No access token in response".to_string())
}

/// Exchange OAuth authorization code for access token using user-provided credentials
///
/// This performs the OAuth token exchange server-side, keeping the client secret
/// secure in the Rust backend rather than exposing it in the frontend bundle.
///
/// # Arguments
/// * `hostname` - The GitHub hostname (e.g., "github.com" or enterprise server)
/// * `client_id` - The OAuth app client ID
/// * `client_secret` - The OAuth app client secret
/// * `code` - The authorization code from the OAuth callback
///
/// # Returns
/// The access token on success, or an error message on failure
#[tauri::command]
pub async fn exchange_oauth_code(
    hostname: String,
    client_id: String,
    client_secret: String,
    code: String,
) -> Result<String, String> {
    do_exchange_oauth_code(&hostname, &client_id, &client_secret, &code).await
}

/// Exchange OAuth authorization code for access token using the default GitHub App credentials
///
/// This is used for the "Login with GitHub" flow which uses Gitify's official
/// GitHub App credentials. The credentials are embedded at build time and
/// never exposed to the frontend.
///
/// # Arguments
/// * `code` - The authorization code from the OAuth callback
///
/// # Returns
/// The access token on success, or an error message on failure
#[tauri::command]
pub async fn exchange_github_app_code(code: String) -> Result<String, String> {
    // Get credentials from environment variables (set at build time)
    let client_id = option_env!("OAUTH_CLIENT_ID")
        .ok_or_else(|| "GitHub App client ID not configured".to_string())?;
    let client_secret = option_env!("OAUTH_CLIENT_SECRET")
        .ok_or_else(|| "GitHub App client secret not configured".to_string())?;

    do_exchange_oauth_code("github.com", client_id, client_secret, &code).await
}

/// Get the GitHub App client ID for the authorization URL
///
/// This returns only the client ID (which is public) so the frontend can
/// construct the authorization URL. The secret is never exposed.
#[tauri::command]
pub fn get_github_app_client_id() -> Result<String, String> {
    option_env!("OAUTH_CLIENT_ID")
        .map(|s| s.to_string())
        .ok_or_else(|| "GitHub App client ID not configured".to_string())
}
