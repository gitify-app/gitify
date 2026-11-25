import type { AuthMethod } from '../auth/types';

import i18n from '../../i18n';

/**
 * Translates a forge login method label for display. Brand/product-named
 * labels (e.g. `'GitHub'`) are returned unchanged — they act as identifiers
 * and read the same in any language.
 */
export function translateLoginMethodLabel(label: string): string {
  switch (label) {
    case 'Atlassian API Token':
      return i18n.t('forge.method.atlassian_api_token', 'Atlassian API Token');
    case 'GitHub CLI':
      return i18n.t('forge.method.github_cli', 'GitHub CLI');
    case 'Managed by the GitHub CLI':
      return i18n.t('forge.method.managed_by_cli', 'Managed by the GitHub CLI');
    case 'Custom OAuth App':
      return i18n.t('forge.method.custom_oauth_app', 'Custom OAuth App');
    case 'Personal Access Token':
      return i18n.t('forge.method.personal_access_token', 'Personal Access Token');
    default:
      return label;
  }
}

/**
 * Short visible label for a login method in compact layouts. The full name
 * remains the accessible name, so abbreviations never replace it for screen
 * readers or tooltips.
 */
export function compactLoginMethodLabel(label: string): string {
  switch (label) {
    case 'Personal Access Token':
      return 'PAT';
    case 'GitHub CLI':
      return 'CLI';
    default:
      return translateLoginMethodLabel(label);
  }
}

/**
 * Translates a forge tagline for display. Unknown/undefined taglines pass
 * through unchanged.
 */
export function translateForgeTagline(tagline: string | undefined): string | undefined {
  switch (tagline) {
    case 'GitHub Cloud & GitHub Enterprise Server':
      return i18n.t('forge.tagline.github', 'GitHub Cloud & GitHub Enterprise Server');
    case 'GitLab.com & Self-Managed':
      return i18n.t('forge.tagline.gitlab', 'GitLab.com & Self-Managed');
    case 'Gitea, Forgejo & Codeberg':
      return i18n.t('forge.tagline.gitea', 'Gitea, Forgejo & Codeberg');
    case 'Bitbucket Cloud':
      return i18n.t('forge.tagline.bitbucket', 'Bitbucket Cloud');
    default:
      return tagline;
  }
}

/**
 * Translates an auth method value for display in the accounts list. The raw
 * value remains the storage/identifier form (`AuthMethod`); only the rendered
 * copy is localized.
 */
export function translateAuthMethod(method: AuthMethod): string {
  switch (method) {
    case 'Gitify OAuth App':
      return i18n.t('auth.method.gitify_oauth_app', 'Gitify OAuth App');
    case 'Custom OAuth App':
      return i18n.t('auth.method.custom_oauth_app', 'Custom OAuth App');
    case 'GitHub CLI':
      return i18n.t('auth.method.github_cli', 'GitHub CLI');
    case 'Personal Access Token':
      return i18n.t('auth.method.personal_access_token', 'Personal Access Token');
    default:
      return method;
  }
}
