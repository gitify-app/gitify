import { GraphqlResponseError } from '@octokit/graphql';
import { RequestError } from '@octokit/request-error';

import { EVENTS } from '../../../shared/events';

import { Errors } from '../errors';
import * as rendererLogger from '../logger';
import { determineFailureType, handleGraphQLResponseError } from './errors';

describe('renderer/utils/api/errors.ts', () => {
  describe('determineFailureType', () => {
    describe('generic errors', () => {
      it('bad credentials - safe storage decryption error', () => {
        const mockError = new Error(
          `Error invoking remote method '${EVENTS.SAFE_STORAGE_DECRYPT}': Error: Error while decrypting the ciphertext provided to safeStorage.decryptString. Ciphertext does not appear to be encrypted.`,
        );
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.BAD_CREDENTIALS);
      });

      it('unknown error - generic error', () => {
        const mockError = new Error('Something went wrong');
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.UNKNOWN);
      });
    });

    describe('REST API errors (RequestError)', () => {
      it('bad credentials - 401 status', () => {
        const mockError = new RequestError('Bad credentials', 401, {
          request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
          },
        });
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.BAD_CREDENTIALS);
      });

      it('missing scopes - 403 with scope message', () => {
        const mockError = new RequestError(
          "Missing the 'notifications' scope",
          403,
          {
            request: {
              method: 'GET',
              url: 'https://api.github.com',
              headers: {},
            },
          },
        );
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.MISSING_SCOPES);
      });

      it('rate limited - primary rate limit', () => {
        const mockError = new RequestError('API rate limit exceeded', 403, {
          request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
          },
        });
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.RATE_LIMITED);
      });

      it('rate limited - secondary rate limit', () => {
        const mockError = new RequestError(
          'You have exceeded a secondary rate limit',
          403,
          {
            request: {
              method: 'GET',
              url: 'https://api.github.com',
              headers: {},
            },
          },
        );
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.RATE_LIMITED);
      });

      it('network error - no status', () => {
        const mockError = new RequestError('Network error', 0, {
          request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
          },
        });
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.NETWORK);
      });

      it('unknown error - unhandled 403', () => {
        const mockError = new RequestError('Forbidden', 403, {
          request: {
            method: 'GET',
            url: 'https://api.github.com',
            headers: {},
          },
        });
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.UNKNOWN);
      });
    });

    describe('GraphQL API errors (GraphqlResponseError)', () => {
      it('bad credentials', () => {
        const mockError = createGraphQLResponseError('Bad credentials');
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.BAD_CREDENTIALS);
      });

      it('rate limited - primary rate limit', () => {
        const mockError = createGraphQLResponseError('API rate limit exceeded');
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.RATE_LIMITED);
      });

      it('rate limited - secondary rate limit', () => {
        const mockError = createGraphQLResponseError(
          'You have exceeded a secondary rate limit',
        );
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.RATE_LIMITED);
      });

      it('unknown error', () => {
        const mockError = createGraphQLResponseError('Something went wrong');
        const result = determineFailureType(mockError);
        expect(result).toBe(Errors.UNKNOWN);
      });
    });
  });

  describe('handleGraphQLResponseError', () => {
    it('throws and logs when GraphQL errors are present', () => {
      const rendererLogErrorSpy = jest
        .spyOn(rendererLogger, 'rendererLogError')
        .mockImplementation();

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
          errors: [
            { message: 'Error 1' },
            { message: 'Error 2' },
          ] as unknown as GraphqlResponseError<unknown>['errors'],
        },
      );

      expect(() => handleGraphQLResponseError('test-context', payload)).toThrow(
        'GraphQL request returned errors: Error 1; Error 2',
      );
    });
  });
});

function createGraphQLResponseError(
  message: string,
): GraphqlResponseError<unknown> {
  return new GraphqlResponseError(
    {
      method: 'POST',
      url: 'https://api.github.com/graphql',
      headers: {},
    },
    {},
    {
      data: {},
      errors: [{ message }] as GraphqlResponseError<unknown>['errors'],
    },
  );
}
