import type { Forge, Hostname, Token } from '../../types';
import type { LoginOAuthWebOptions } from './types';

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

/** OAuth app login form values — mirrors LoginOAuthWebOptions so it passes straight through. */
export type OAuthAppFormData = LoginOAuthWebOptions;

/** OAuth app login form errors. */
export interface OAuthAppFormErrors {
  hostname?: string;
  clientId?: string;
  clientSecret?: string;
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
    errors.hostname = 'Hostname is required';
  } else if (!adapter.validateHostname(values.hostname)) {
    errors.hostname = 'Hostname format is invalid';
  }

  if (forge === 'bitbucket' && !values.username) {
    errors.username = 'Atlassian email is required';
  }

  if (!values.token) {
    errors.token = 'Token is required';
  } else if (!adapter.validateToken(values.token)) {
    errors.token = 'Token format is invalid';
  }

  return errors;
};

export const validateOAuthAppForm = (
  values: OAuthAppFormData,
  forge: Forge = 'github',
): OAuthAppFormErrors => {
  const errors: OAuthAppFormErrors = {};
  const adapter = getAdapter(forge);

  if (!values.hostname) {
    errors.hostname = 'Hostname is required';
  } else if (!isValidHostname(values.hostname)) {
    errors.hostname = 'Hostname format is invalid';
  }

  if (!values.clientId) {
    errors.clientId = 'Client ID is required';
  } else if (!adapter.oauthWebApp?.validateClientId(values.clientId)) {
    errors.clientId = 'Client ID format is invalid';
  }

  if (!values.clientSecret) {
    errors.clientSecret = 'Client Secret is required';
  } else if (!adapter.validateToken(values.clientSecret as unknown as Token)) {
    errors.clientSecret = 'Client Secret format is invalid';
  }

  return errors;
};
