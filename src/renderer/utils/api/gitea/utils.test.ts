import type { Hostname } from '../../../types';

import { getGiteaApiBaseUrl } from './utils';

describe('renderer/utils/api/gitea/utils.ts', () => {
  it('getGiteaApiBaseUrl builds https api v1 base', () => {
    const url = getGiteaApiBaseUrl('gitea.example.com' as Hostname);
    expect(url.toString()).toBe('https://gitea.example.com/api/v1/');
  });
});
