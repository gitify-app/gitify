import type { GraphqlResponseError } from '@octokit/graphql';
import { RequestError } from 'octokit';

import type { GitifyError } from '../../types';

import { Errors } from '../errors';
import { rendererLogError } from '../logger';

/**
 * Determine the failure type based on an error (Octokit RequestError or unknown).
 *
 * @param err The error
 * @returns The Gitify error type
 */
export function determineFailureType(err: RequestError): GitifyError {
  // Handle Octokit RequestError
  if (err instanceof RequestError) {
    const status = err.status;
    const message = err.message || '';

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

    // Network-like errors for RequestError
    if (status === 0 || status === undefined) {
      return Errors.NETWORK;
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
) {
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
