import axios from 'axios';
import { apiRequest, apiRequestAuth } from './api-requests';

jest.mock('axios');

describe('apiRequest', () => {
  it('should make a request with the correct parameters', async () => {
    const url = 'https://example.com';
    const method = 'get';
    const data = { key: 'value' };

    await apiRequest(url, method, data);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
    });

    expect(axios.defaults.headers.common).toMatchSnapshot();
  });
});

describe('apiRequestAuth', () => {
  it('should make an authenticated request with the correct parameters', async () => {
    const url = 'https://example.com';
    const method = 'get';
    const token = 'yourAuthToken';
    const data = { key: 'value' };

    await apiRequestAuth(url, method, token, data);

    expect(axios).toHaveBeenCalledWith({
      method,
      url,
      data,
    });

    expect(axios.defaults.headers.common).toMatchSnapshot();
  });
});
