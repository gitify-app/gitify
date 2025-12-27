import axios from 'axios';

import type { Link, Token } from '../../types';
import {
  mockAuthHeaders,
  mockNoAuthHeaders,
  mockNonCachedAuthHeaders,
} from './__mocks__/request-mocks';
import {
  apiRequest,
  apiRequestAuth,
  getHeaders,
  shouldRequestWithNoCache,
} from './request';

vi.mock('axios');

const url = 'https://example.com' as Link;
const method = 'get';

describe('renderer/utils/api/request.ts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should make a request with the correct parameters', async () => {
    const data = { key: 'value' };

    await apiRequest(url, method, data);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
      headers: mockNoAuthHeaders,
    });
  });

  it('should make a request with the correct parameters and default data', async () => {
    const data = {};
    await apiRequest(url, method);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
      headers: mockNoAuthHeaders,
    });
  });
});

describe('apiRequestAuth', () => {
  const token = 'yourAuthToken' as Token;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should make an authenticated request with the correct parameters', async () => {
    const data = { key: 'value' };

    await apiRequestAuth(url, method, token, data);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
      headers: mockAuthHeaders,
    });
  });

  it('should make an authenticated request with the correct parameters and default data', async () => {
    const data = {};

    await apiRequestAuth(url, method, token);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
      headers: mockAuthHeaders,
    });
  });

  it('shouldRequestWithNoCache', () => {
    expect(
      shouldRequestWithNoCache('https://example.com/api/v3/notifications'),
    ).toBe(true);

    expect(
      shouldRequestWithNoCache('https://example.com/login/oauth/access_token'),
    ).toBe(true);

    expect(shouldRequestWithNoCache('https://example.com/notifications')).toBe(
      true,
    );

    expect(
      shouldRequestWithNoCache('https://example.com/some/other/endpoint'),
    ).toBe(false);
  });

  it('should get headers correctly', async () => {
    expect(await getHeaders(url)).toEqual(mockNoAuthHeaders);

    expect(await getHeaders(url, token)).toEqual(mockAuthHeaders);

    expect(
      await getHeaders(
        'https://example.com/api/v3/notifications' as Link,
        token,
      ),
    ).toEqual(mockNonCachedAuthHeaders);
  });
});
