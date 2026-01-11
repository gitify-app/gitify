use keyring::Entry;
use serde::{Deserialize, Serialize};
use url::Url;

const SERVICE_NAME: &str = "io.gitify.app";

/// Allowed GitHub hostnames for OAuth.
/// Includes GitHub.com and common GitHub Enterprise patterns.
const ALLOWED_GITHUB_HOSTNAMES: &[&str] = &["github.com", "api.github.com"];

/// Helper for managing token encryption via the OS keyring.
struct TokenStore;

impl TokenStore {
    fn get_entry(identifier: &str) -> Result<Entry, String> {
        Entry::new(SERVICE_NAME, identifier)
            .map_err(|e| format!("Failed to create keyring entry: {}", e))
    }
}

/// Validate that a hostname is safe for OAuth requests.
///
/// This validates that:
/// 1. The hostname can be parsed as part of a valid HTTPS URL
/// 2. The hostname doesn't contain unsafe characters (null bytes, CRLF)
/// 3. The hostname matches expected patterns (github.com or enterprise servers)
fn validate_oauth_hostname(hostname: &str) -> Result<(), String> {
    // Check for null bytes and CRLF injection
    if hostname.contains('\0') || hostname.contains('\r') || hostname.contains('\n') {
        return Err("Invalid hostname: contains control characters".to_string());
    }

    // Try to parse as a URL to validate the hostname format
    let test_url = format!("https://{}/login/oauth/access_token", hostname);
    let parsed = Url::parse(&test_url).map_err(|e| format!("Invalid hostname format: {}", e))?;

    // Verify the parsed hostname matches what we expect
    let parsed_host = parsed
        .host_str()
        .ok_or_else(|| "Invalid hostname: no host in parsed URL".to_string())?;

    if parsed_host != hostname {
        return Err("Invalid hostname: parsed hostname doesn't match input".to_string());
    }

    // Verify the path wasn't manipulated
    if parsed.path() != "/login/oauth/access_token" {
        return Err("Invalid hostname: path injection detected".to_string());
    }

    // For security, we accept:
    // 1. github.com (the standard GitHub)
    // 2. Any hostname ending with a valid TLD (for GitHub Enterprise)
    // We don't restrict to specific domains to support self-hosted GHE instances
    if !ALLOWED_GITHUB_HOSTNAMES.contains(&hostname) {
        // For enterprise servers, ensure it looks like a valid domain
        // Must have at least one dot and valid characters
        if !hostname.contains('.') {
            return Err("Invalid hostname: must be a fully qualified domain".to_string());
        }

        // Check for valid domain characters only (alphanumeric, hyphens, dots)
        if !hostname
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '.')
        {
            return Err("Invalid hostname: contains invalid characters".to_string());
        }

        // Hostname segments must not start or end with hyphens
        for segment in hostname.split('.') {
            if segment.is_empty() || segment.starts_with('-') || segment.ends_with('-') {
                return Err("Invalid hostname: invalid domain segment".to_string());
            }
        }
    }

    Ok(())
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
    // Validate hostname using comprehensive security checks
    validate_oauth_hostname(hostname)?;

    let url = format!("https://{}/login/oauth/access_token", hostname);

    // Build the request body
    let params = [
        ("client_id", client_id),
        ("client_secret", client_secret),
        ("code", code),
    ];

    // Create HTTP client with timeout to prevent hanging connections
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

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
