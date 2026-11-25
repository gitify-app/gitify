import { GraphqlResponseError } from '@octokit/graphql';
import { RequestError } from '@octokit/request-error';

import { EVENTS } from '../../../shared/events';

import { getErrorDetails } from '../core/errors';
import * as rendererLogger from '../core/logger';
import { determineFailureType, handleGraphQLResponseError } from './errors';

describe('renderer/utils/api/errors.ts', () => {
  describe('determineFailureType', () => {
    describe('generic errors', () => {
      it('bad credentials - safe storage decryption error', () => {
        const mockError = new Error(
          `Error invoking remote method '${EVENTS.SAFE_STORAGE_DECRYPT}': Error: Error while decrypting the ciphertext provided to safeStorage.decryptString. Ciphertext does not appear to be encrypted.`,
        );
        const result = determineFailureType(mockError);
        expect(result).toEqual(getErrorDetails('BAD_CREDENTIALS'));
      });

      it('unknown error - generic error', () => {
        const mockError = new Error('Something went wrong');
        const result = determineFailureType(mockError);
        expect(result).toEqual(getErrorDetails('UNKNOWN'));
      });
    });

    describe('REST API errors (RequestError)', () => {
      it.each([
        ['bad credentials - 401 status', 'Bad credentials', 401, 'BAD_CREDENTIALS'],
        [
          'missing scopes - 403 with scope message',
          "Missing the 'notifications' scope",
          403,
          'MISSING_SCOPES',
        ],
        ['rate limited - primary rate limit', 'API rate limit exceeded', 403, 'RATE_LIMITED'],
        [
          'rate limited - secondary rate limit',
          'You have exceeded a secondary rate limit',
          403,
          'RATE_LIMITED',
        ],
        [
          'action forbidden - unmatched 403',
          'As an Enterprise Managed User, you cannot access this content',
          403,
          'ACTION_FORBIDDEN',
        ],
        ['network error - no status', 'Network error', 500, 'NETWORK'],
        ['unknown error - unhandled 418', 'Forbidden', 418, 'UNKNOWN'],
      ] as const)('%s', (_name, message, status, errorType) => {
        const mockError = new RequestError(message, status, {
          request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
          },
        });

        expect(determineFailureType(mockError)).toEqual(getErrorDetails(errorType));
      });
    });

    describe('GraphQL API errors (GraphqlResponseError)', () => {
      it.each([
        ['bad credentials', 'Bad credentials', 'BAD_CREDENTIALS'],
        ['rate limited - primary rate limit', 'API rate limit exceeded', 'RATE_LIMITED'],
        [
          'rate limited - secondary rate limit',
          'You have exceeded a secondary rate limit',
          'RATE_LIMITED',
        ],
        ['unknown error', 'Something went wrong', 'UNKNOWN'],
      ] as const)('%s', (_name, message, errorType) => {
        expect(determineFailureType(createGraphQLResponseError(message))).toEqual(
          getErrorDetails(errorType),
        );
      });
    });
  });

  describe('handleGraphQLResponseError', () => {
    it('throws and logs when GraphQL errors are present', () => {
      const rendererLogErrorSpy = vi
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation(vi.fn());

      const payload = createGraphQLResponseError('Something went wrong');

      expect(() => handleGraphQLResponseError('test-context', payload)).toThrow(
        'GraphQL request returned errors: Something went wrong',
      );

      expect(rendererLogErrorSpy).toHaveBeenCalledWith(
        'test-context',
        'GraphQL errors present in response',
        expect.any(Error),
      );
    });

    it('throws with multiple error messages joined', () => {
      const payload = new GraphqlResponseError(
        {
          method: 'POST',
          url: 'https://api.github.com/graphql',
          headers: {},
        },
        {},
        {
          data: {},
          errors: [{ message: 'Error 1' }, { message: 'Error 2' }] as unknown as NonNullable<
            GraphqlResponseError<unknown>['errors']
          >,
        },
      );

      expect(() => handleGraphQLResponseError('test-context', payload)).toThrow(
        'GraphQL request returned errors: Error 1; Error 2',
      );
    });
  });
});

function createGraphQLResponseError(message: string): GraphqlResponseError<unknown> {
  return new GraphqlResponseError(
    {
      method: 'POST',
      url: 'https://api.github.com/graphql',
      headers: {},
    },
    {},
    {
      data: {},
      errors: [{ message }] as unknown as NonNullable<GraphqlResponseError<unknown>['errors']>,
    },
  );
}
