import type { Hostname } from '../../../types';

import { getGiteaOrigin, parseGiteaOrigin } from './auth';

describe('Gitea origins', () => {
  it.each([
    ['gitea.example.com', 'https://gitea.example.com'],
    ['gitea.example.com:3000', 'https://gitea.example.com:3000'],
    ['https://gitea.example.com/', 'https://gitea.example.com'],
    ['http://git.internal', 'http://git.internal'],
    ['http://git.internal:3000', 'http://git.internal:3000'],
    ['http://localhost:3000/', 'http://localhost:3000'],
    ['http://192.168.1.2:3000', 'http://192.168.1.2:3000'],
    ['http://[::1]:3000', 'http://[::1]:3000'],
    ['HTTP://GIT.INTERNAL:80', 'http://git.internal'],
    ['https://git.internal:443', 'https://git.internal'],
  ])('resolves %s to %s', (input, origin) => {
    expect(getGiteaOrigin(input as Hostname)).toBe(origin);
  });

  it.each([
    '',
    ' ',
    ' http://git.internal',
    'http://git.internal ',
    'http://git.internal\n',
    'http://git.internal\r',
    'ftp://git.internal',
    'javascript:alert(1)',
    '//git.internal',
    'http://user:password@git.internal',
    'http://git.internal@evil.example',
    'http://git.internal/path',
    'http://git.internal/.',
    'http://git.internal//',
    'http://git.internal?query',
    'http://git.internal#fragment',
    'http://git.internal:',
    'http://git.internal:0',
    'http://git.internal:0000001',
    'http://git.internal:65536',
    'http://git.internal:abc',
    'http://git.internal:3000:4000',
    'http://-git.internal',
    'http://git..internal',
    'http://git_internal',
    'http://%67it.internal',
    'http://[invalid]:3000',
    'http://git.internal\\evil',
    'http://git.\ninternal',
  ])('rejects %j', (input) => {
    expect(parseGiteaOrigin(input as Hostname)).toBeNull();
    expect(() => getGiteaOrigin(input as Hostname)).toThrow(/invalid hostname/);
  });
});
