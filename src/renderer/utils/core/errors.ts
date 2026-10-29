import { PersonIcon } from '@primer/octicons-react';

import { Constants } from '../../constants';

import type { AccountNotifications, ErrorType, GitifyError } from '../../types';

import i18n from '../../i18n';

/**
 * Builds the `GitifyError` for an `ErrorType` at call time so the copy is
 * always translated in the active language. Never store the result in a
 * module-scope object — that would snapshot the language at import time.
 */
export function getErrorDetails(errorType: ErrorType): GitifyError {
  switch (errorType) {
    case 'ACTION_FORBIDDEN':
      return {
        type: errorType,
        title: i18n.t('errors.action_forbidden.title', 'Action Forbidden'),
        descriptions: [
          i18n.t(
            'errors.action_forbidden.description',
            'GitHub rejected this request for this account via Gitify.',
          ),
        ],
        emojis: Constants.EMOJIS.ERRORS.ACTION_FORBIDDEN,
      };
    case 'BAD_CREDENTIALS':
      return {
        type: errorType,
        title: i18n.t('errors.bad_credentials.title', 'Bad Credentials'),
        descriptions: [
          i18n.t(
            'errors.bad_credentials.description',
            'Your credentials are either invalid or expired.',
          ),
        ],
        emojis: Constants.EMOJIS.ERRORS.BAD_CREDENTIALS,
        actions: [
          {
            label: i18n.t('errors.manage_accounts', 'Manage Accounts'),
            route: '/accounts',
            variant: 'danger',
            icon: PersonIcon,
          },
        ],
      };
    case 'MISSING_SCOPES':
      return {
        type: errorType,
        title: i18n.t('errors.missing_scopes.title', 'Missing Scopes'),
        descriptions: [
          i18n.t(
            'errors.missing_scopes.description',
            'Your credentials are missing a required API scope.',
          ),
        ],
        emojis: Constants.EMOJIS.ERRORS.MISSING_SCOPES,
        actions: [
          {
            label: i18n.t('errors.manage_accounts', 'Manage Accounts'),
            route: '/accounts',
            variant: 'danger',
            icon: PersonIcon,
          },
        ],
      };
    case 'NETWORK':
      return {
        type: errorType,
        title: i18n.t('errors.network.title', 'Network Error'),
        descriptions: [
          i18n.t(
            'errors.network.description1',
            'Unable to connect to one or more of your GitHub environments.',
          ),
          i18n.t(
            'errors.network.description2',
            'Please check your network connection, including whether you require a VPN, and try again.',
          ),
        ],
        emojis: Constants.EMOJIS.ERRORS.NETWORK,
      };
    case 'OFFLINE':
      return {
        type: errorType,
        title: i18n.t('errors.offline.title', 'Network Offline'),
        descriptions: [
          i18n.t('errors.offline.description1', 'Your device is offline.'),
          i18n.t('errors.offline.description2', 'Please check your network connection.'),
        ],
        emojis: Constants.EMOJIS.ERRORS.OFFLINE,
      };
    case 'RATE_LIMITED':
      return {
        type: errorType,
        title: i18n.t('errors.rate_limited.title', 'Rate Limited'),
        descriptions: [
          i18n.t('errors.rate_limited.description', 'Please wait a while before trying again.'),
        ],
        emojis: Constants.EMOJIS.ERRORS.RATE_LIMITED,
      };
    case 'UNKNOWN':
    default:
      return {
        type: 'UNKNOWN' as ErrorType,
        title: i18n.t('errors.unknown.title', 'Oops! Something went wrong'),
        descriptions: [i18n.t('errors.unknown.description', 'Please try again later.')],
        emojis: Constants.EMOJIS.ERRORS.UNKNOWN,
      };
  }
}

/**
 * Compares an error against an `ErrorType` without relying on object identity.
 * Errors produced by `getErrorDetails` carry their `type`; hand-built errors
 * (e.g. in tests) without one never match.
 */
export function isErrorType(error: GitifyError | null | undefined, errorType: ErrorType): boolean {
  return error?.type === errorType;
}

/**
 * Check if all accounts have errors
 */
export function doesAllAccountsHaveErrors(accountNotifications: AccountNotifications[]) {
  return (
    accountNotifications.length > 0 &&
    accountNotifications.every((account) => account.error !== null)
  );
}

/**
 * Check if all account errors are the same
 */
export function areAllAccountErrorsSame(accountNotifications: AccountNotifications[]) {
  if (accountNotifications.length === 0) {
    return true;
  }

  const firstError = accountNotifications[0].error;
  return accountNotifications.every((account) => account.error?.type === firstError?.type);
}
