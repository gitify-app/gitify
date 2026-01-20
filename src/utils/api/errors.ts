import { AxiosError } from 'axios';

import type { GitifyError } from '../../types';
import type { GitHubRESTError } from './types';

import { Errors } from '../errors';

export function determineFailureType(
  err: AxiosError<GitHubRESTError>,
): GitifyError {
  const code = err.code;

  if (code === AxiosError.ERR_NETWORK) {
    return Errors.NETWORK;
  }

  if (err.message?.includes('safeStorage')) {
    return Errors.BAD_CREDENTIALS;
  }

  if (code !== AxiosError.ERR_BAD_REQUEST) {
    return Errors.UNKNOWN;
  }

  const status = err.response?.status;
  const message = err.response?.data?.message;

  if (status === 401) {
    return Errors.BAD_CREDENTIALS;
  }

  if (status === 403 && message) {
    if (message.includes("Missing the 'notifications' scope")) {
      return Errors.MISSING_SCOPES;
    }

    if (
      message.includes('API rate limit exceeded') ||
      message.includes('You have exceeded a secondary rate limit')
    ) {
      return Errors.RATE_LIMITED;
    }
  }

  return Errors.UNKNOWN;
}
