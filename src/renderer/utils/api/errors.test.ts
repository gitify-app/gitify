import { AxiosError, type AxiosResponse } from 'axios';

import type { Link } from '../../types';
import type { GitHubRESTError } from '../../typesGitHub';
import { Errors } from '../errors';
import { determineFailureType } from './errors';

describe('renderer/utils/api/errors.ts', () => {
  it('network error', async () => {
    const mockError: Partial<AxiosError<GitHubRESTError>> = {
      code: AxiosError.ERR_NETWORK,
    };

    const result = determineFailureType(
      mockError as AxiosError<GitHubRESTError>,
    );

    expect(result).toBe(Errors.NETWORK);
  });

  describe('bad request errors', () => {
    it('bad credentials', async () => {
      const mockError: Partial<AxiosError<GitHubRESTError>> = {
        code: AxiosError.ERR_BAD_REQUEST,
        status: 401,
        response: createMockResponse(401, 'Bad credentials'),
      };

      const result = determineFailureType(
        mockError as AxiosError<GitHubRESTError>,
      );

      expect(result).toBe(Errors.BAD_CREDENTIALS);
    });

    it('missing scopes', async () => {
      const mockError: Partial<AxiosError<GitHubRESTError>> = {
        code: AxiosError.ERR_BAD_REQUEST,
        status: 403,
        response: createMockResponse(403, "Missing the 'notifications' scope"),
      };

      const result = determineFailureType(
        mockError as AxiosError<GitHubRESTError>,
      );

      expect(result).toBe(Errors.MISSING_SCOPES);
    });

    it('rate limited - primary', async () => {
      const mockError: Partial<AxiosError<GitHubRESTError>> = {
        code: AxiosError.ERR_BAD_REQUEST,
        status: 403,
        response: createMockResponse(403, 'API rate limit exceeded'),
      };

      const result = determineFailureType(
        mockError as AxiosError<GitHubRESTError>,
      );

      expect(result).toBe(Errors.RATE_LIMITED);
    });

    it('rate limited - secondary', async () => {
      const mockError: Partial<AxiosError<GitHubRESTError>> = {
        code: AxiosError.ERR_BAD_REQUEST,
        status: 403,
        response: createMockResponse(
          403,
          'You have exceeded a secondary rate limit',
        ),
      };

      const result = determineFailureType(
        mockError as AxiosError<GitHubRESTError>,
      );

      expect(result).toBe(Errors.RATE_LIMITED);
    });

    it('unhandled bad request error', async () => {
      const mockError: Partial<AxiosError<GitHubRESTError>> = {
        code: AxiosError.ERR_BAD_REQUEST,
        status: 400,
        response: createMockResponse(403, 'Oops! Something went wrong.'),
      };

      const result = determineFailureType(
        mockError as AxiosError<GitHubRESTError>,
      );

      expect(result).toBe(Errors.UNKNOWN);
    });
  });

  it('unknown error', async () => {
    const mockError: Partial<AxiosError<GitHubRESTError>> = {
      code: 'anything',
    };

    const result = determineFailureType(
      mockError as AxiosError<GitHubRESTError>,
    );

    expect(result).toBe(Errors.UNKNOWN);
  });
});

function createMockResponse(
  status: number,
  message: string,
): AxiosResponse<GitHubRESTError> {
  return {
    data: {
      message,
      documentation_url: 'https://some-url.com' as Link,
    },
    status,
    statusText: 'Some status text',
    headers: {},
    config: {
      headers: undefined,
    },
  };
}
