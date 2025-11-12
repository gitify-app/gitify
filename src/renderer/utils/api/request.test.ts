import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Link, Token } from '../../types';
import { apiRequest, apiRequestAuth } from './request';

vi.mock('axios', () => ({
  default: vi.fn(),
}));

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
      headers: {
        Accept: 'application/json',
        'Cache-Control': '',
        'Content-Type': 'application/json',
      },
    });
  });

  it('should make a request with the correct parameters and default data', async () => {
    const data = {};
    await apiRequest(url, method);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
      headers: {
        Accept: 'application/json',
        'Cache-Control': '',
        'Content-Type': 'application/json',
      },
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
      headers: {
        Accept: 'application/json',
        Authorization: 'token decrypted',
        'Cache-Control': '',
        'Content-Type': 'application/json',
      },
    });
  });

  it('should make an authenticated request with the correct parameters and default data', async () => {
    const data = {};

    await apiRequestAuth(url, method, token);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
      headers: {
        Accept: 'application/json',
        Authorization: 'token decrypted',
        'Cache-Control': '',
        'Content-Type': 'application/json',
      },
    });
  });
});
