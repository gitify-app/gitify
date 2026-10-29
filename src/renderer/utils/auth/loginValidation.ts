import type { ClientID, Forge, Hostname, Token } from '../../types';

import i18n from '../../i18n';
import { getAdapter } from '../forges/registry';
import { isValidHostname } from './utils';

/** Personal access token login form values. */
export interface PersonalAccessTokenFormData {
  token: Token;
  hostname: Hostname;
  username?: string;
}

/** Personal access token login form errors. */
export interface PersonalAccessTokenFormErrors {
  token?: string;
  hostname?: string;
  username?: string;
  invalidCredentialsForHost?: string;
  invalidCredentialsDetail?: string;
}

/** Custom OAuth app login form values. */
export interface CustomOAuthAppFormData {
  hostname: Hostname;
  clientId: ClientID;
}

/** Custom OAuth app login form errors. */
export interface CustomOAuthAppFormErrors {
  hostname?: string;
  clientId?: string;
  invalidCredentialsForHost?: string;
}

/**
 * Reduce a login failure to a single capped line for the error banner. Only
 * real errors carry a message worth showing, and the first line is enough: a
 * misbehaving server can echo the request or its response body back, and
 * that must not flood the banner.
 */
const ERROR_DETAIL_MAX_LENGTH = 150;

export function summarizeLoginError(err: unknown): string | undefined {
  if (!(err instanceof Error)) {
    return undefined;
  }

  const firstLine = err.message.split('\n')[0].replace(/\s+/g, ' ').trim();
  return firstLine ? firstLine.slice(0, ERROR_DETAIL_MAX_LENGTH) : undefined;
}

export const validatePersonalAccessTokenForm = (
  values: PersonalAccessTokenFormData,
  forge: Forge = 'github',
): PersonalAccessTokenFormErrors => {
  const errors: PersonalAccessTokenFormErrors = {};
  const adapter = getAdapter(forge);

  if (!values.hostname) {
    errors.hostname = i18n.t('login.pat.hostname_required', 'Hostname is required');
  } else if (!adapter.validateHostname(values.hostname)) {
    errors.hostname = i18n.t('login.pat.hostname_invalid', 'Hostname format is invalid');
  }

  if (forge === 'bitbucket' && !values.username) {
    errors.username = i18n.t('login.pat.atlassian_email_required', 'Atlassian email is required');
  }

  if (!values.token) {
    errors.token = i18n.t('login.pat.token_required', 'Token is required');
  } else if (!adapter.validateToken(values.token)) {
    errors.token = i18n.t('login.pat.token_invalid', 'Token format is invalid');
  }

  return errors;
};

export const validateCustomOAuthAppForm = (
  values: CustomOAuthAppFormData,
  forge: Forge = 'github',
): CustomOAuthAppFormErrors => {
  const errors: CustomOAuthAppFormErrors = {};
  const adapter = getAdapter(forge);

  if (!values.hostname) {
    errors.hostname = i18n.t('login.pat.hostname_required', 'Hostname is required');
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = i18n.t('login.pat.hostname_invalid', 'Hostname format is invalid');
  }

  if (!values.clientId) {
    errors.clientId = i18n.t('login.oauth.client_id_required', 'Client ID is required');
  } else if (!adapter.customOAuthApp?.validateClientId(values.clientId)) {
    errors.clientId = i18n.t('login.oauth.client_id_invalid', 'Client ID format is invalid');
  }

  return errors;
};
