import { GraphqlResponseError } from '@octokit/graphql';
import { RequestError } from '@octokit/request-error';

import { EVENTS } from '../../../shared/events';

import type { GitifyError } from '../../types';

import { getErrorDetails } from '../core/errors';
import { rendererLogError } from '../core/logger';

/**
 * Determine the failure type based on an error.
 * Handles Octokit RequestError (REST), GraphqlResponseError (GraphQL), and generic Error.
 *
 * @param err The error (RequestError, GraphqlResponseError, or generic Error)
 * @returns The Gitify error type
 */
export function determineFailureType(
  err: Error | RequestError | GraphqlResponseError<unknown>,
): GitifyError {
  const message = err.message || '';

  // Check for safe storage decryption failures first (happens before API call)
  if (message.includes(EVENTS.SAFE_STORAGE_DECRYPT)) {
    return getErrorDetails('BAD_CREDENTIALS');
  }

  // Handle Octokit REST RequestError
  if (err instanceof RequestError) {
    const status = err.status;

    switch (status) {
      case 401:
        return getErrorDetails('BAD_CREDENTIALS');
      case 403:
        if (message.includes("Missing the 'notifications' scope")) {
          return getErrorDetails('MISSING_SCOPES');
        }

        if (
          message.includes('API rate limit exceeded') ||
          message.includes('You have exceeded a secondary rate limit')
        ) {
          return getErrorDetails('RATE_LIMITED');
        }

        return getErrorDetails('ACTION_FORBIDDEN');
      case 500:
        return getErrorDetails('NETWORK');
      default:
        break;
    }
  }

  // Handle Octokit GraphQL GraphqlResponseError
  if (err instanceof GraphqlResponseError) {
    const errorMessages = err.errors?.map((e) => e.message).join('; ') || message;

    if (errorMessages.includes('Bad credentials')) {
      return getErrorDetails('BAD_CREDENTIALS');
    }

    if (
      errorMessages.includes('API rate limit exceeded') ||
      errorMessages.includes('You have exceeded a secondary rate limit')
    ) {
      return getErrorDetails('RATE_LIMITED');
    }
  }

  return getErrorDetails('UNKNOWN');
}

/**
 * Log a GraphQL response error and throw.
 *
 * The caller must pass a GraphQL error payload with a non-empty `errors` array;
 * this function does not guard against a missing array.
 *
 * @param context - The context of the GraphQL request.
 * @param payload - The GraphQL error response.
 * @throws An `Error` containing the joined GraphQL error messages.
 */
export function handleGraphQLResponseError<TResult>(
  context: string,
  payload: GraphqlResponseError<TResult>,
): never {
  const errorMessages = payload.errors!.map((graphQLError) => graphQLError.message).join('; ');

  const err = new Error(
    errorMessages
      ? `GraphQL request returned errors: ${errorMessages}`
      : 'GraphQL request returned errors',
  );

  rendererLogError(context, 'GraphQL errors present in response', err);

  throw err;
}
