import axios from 'axios';
import type { Link, Token } from '../../types';
import { apiRequest, apiRequestAuth } from './request';

jest.mock('axios');

const url = 'https://example.com' as Link;
const method = 'get';

describe('utils/api/request.ts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make a request with the correct parameters', async () => {
    const data = { key: 'value' };

    await apiRequest(url, method, data);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
    });

    expect(axios.defaults.headers.common).toMatchSnapshot();
  });

  it('should make a request with the correct parameters and default data', async () => {
    const data = {};
    await apiRequest(url, method);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
    });

    expect(axios.defaults.headers.common).toMatchSnapshot();
  });
});

describe('apiRequestAuth', () => {
  const token = 'yourAuthToken' as Token;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make an authenticated request with the correct parameters', async () => {
    const data = { key: 'value' };

    await apiRequestAuth(url, method, token, data);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
    });

    expect(axios.defaults.headers.common).toMatchSnapshot();
  });

  it('should make an authenticated request with the correct parameters and default data', async () => {
    const data = {};

    await apiRequestAuth(url, method, token);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
    });

    expect(axios.defaults.headers.common).toMatchSnapshot();
  });
});
