import { GraphqlResponseError } from '@octokit/graphql';
import { RequestError } from '@octokit/request-error';

import { EVENTS } from '../../../shared/events';

import type { GitifyError } from '../../types';

import { Errors } from '../errors';
import { rendererLogError } from '../logger';

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
    return Errors.BAD_CREDENTIALS;
  }

  // Handle Octokit REST RequestError
  if (err instanceof RequestError) {
    const status = err.status;

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

    // Network-like errors for RequestError (no status or status 0)
    if (status === 0 || status === undefined) {
      return Errors.NETWORK;
    }
  }

  // Handle Octokit GraphQL GraphqlResponseError
  if (err instanceof GraphqlResponseError) {
    const errorMessages =
      err.errors?.map((e) => e.message).join('; ') || message;

    if (errorMessages.includes('Bad credentials')) {
      return Errors.BAD_CREDENTIALS;
    }

    if (
      errorMessages.includes('API rate limit exceeded') ||
      errorMessages.includes('You have exceeded a secondary rate limit')
    ) {
      return Errors.RATE_LIMITED;
    }
  }

  return Errors.UNKNOWN;
}

/**
 * Handle GraphQL response errors.
 * Logs and throws if `errors` array is present and non-empty.
 *
 * @param context The context of the GraphQL request
 * @param payload The GraphQL response payload
 */
export function handleGraphQLResponseError<TResult>(
  context: string,
  payload: GraphqlResponseError<TResult>,
): never {
  const errorMessages = payload.errors
    .map((graphQLError) => graphQLError.message)
    .join('; ');

  const err = new Error(
    errorMessages
      ? `GraphQL request returned errors: ${errorMessages}`
      : 'GraphQL request returned errors',
  );

  rendererLogError(context, 'GraphQL errors present in response', err);

  throw err;
}
