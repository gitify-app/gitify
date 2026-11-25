/** GitHub logins are up to 39 characters, including the `_shortcode` on managed accounts. */
const LOGIN_PATTERN = /^[a-z0-9][a-z0-9_-]{0,38}$/i;

export function isValidGitHubCliLogin(login: unknown): login is string {
  return typeof login === 'string' && LOGIN_PATTERN.test(login);
}
