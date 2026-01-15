import { AxiosError } from 'axios';
import type { ExecutionResult } from 'graphql';

import type { GitifyError } from '../../types';
import { Errors } from '../errors';
import { rendererLogError } from '../logger';
import type { GitHubRESTError } from './types';

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

  const status = err.response.status;
  const message = err.response.data.message;

  if (status === 401) {
    return Errors.BAD_CREDENTIALS;
  }

  if (status === 403) {
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

/**
 * Assert that a GraphQL response does not contain errors.
 * Logs and throws if `errors` array is present and non-empty.
 */
export function assertNoGraphQLErrors(
  context: string,
  payload: ExecutionResult<unknown>,
) {
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const err = new Error('GraphQL request returned errors');
    rendererLogError(context, 'GraphQL errors present in response', err);
    throw err;
  }
}
