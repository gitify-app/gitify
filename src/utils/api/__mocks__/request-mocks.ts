export const mockNoAuthHeaders = {
  Accept: 'application/json',
  'Cache-Control': '',
  'Content-Type': 'application/json',
};

export const mockAuthHeaders = {
  Accept: 'application/json',
  Authorization: 'token decrypted',
  'Cache-Control': '',
  'Content-Type': 'application/json',
};

export const mockNonCachedAuthHeaders = {
  Accept: 'application/json',
  Authorization: 'token decrypted',
  'Cache-Control': 'no-cache',
  'Content-Type': 'application/json',
};
