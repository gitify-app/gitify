import { mockGitHubCliAccount } from '../../../__mocks__/account-mocks';

import * as comms from '../../system/comms';
import { forgetGitHubCliToken } from './cli';
import { createOctokitClientUncached } from './octokit';

describe('GitHub CLI credential lifecycle', () => {
  const hostname = mockGitHubCliAccount.hostname;

  beforeEach(() => {
    forgetGitHubCliToken(hostname);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    forgetGitHubCliToken(hostname);
  });

  function mockGitHub(rejectedToken?: string) {
    const requests: { url: string; authorization: string }[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, options: { headers: Record<string, string> }) => {
        const authorization = options.headers.authorization;
        requests.push({ url, authorization });
        const rejected = authorization === `token ${rejectedToken}`;
        return new Response(
          JSON.stringify(
            rejected
              ? { message: 'Bad credentials' }
              : url.endsWith('/user')
                ? {
                    id:
                      authorization === 'token different-user'
                        ? 'different-user'
                        : mockGitHubCliAccount.user?.id,
                  }
                : [],
          ),
          {
            status: rejected ? 401 : 200,
            headers: { 'content-type': 'application/json' },
          },
        );
      }),
    );
    return requests;
  }

  it('uses a newly selected valid credential on the next notification request', async () => {
    const read = vi.spyOn(comms, 'readGitHubCliToken').mockResolvedValue({ token: 'original' });
    const requests = mockGitHub();
    const client = await createOctokitClientUncached(mockGitHubCliAccount, 'rest');

    await client.request('GET /notifications');
    read.mockResolvedValue({ token: 'replacement' });
    await client.request('GET /notifications');

    expect(
      requests
        .filter((request) => request.url.endsWith('/notifications'))
        .map((request) => request.authorization),
    ).toEqual(['token original', 'token replacement']);
    expect(read).toHaveBeenCalledTimes(2);
  });

  it('stops requesting notifications when the CLI logs out', async () => {
    const read = vi.spyOn(comms, 'readGitHubCliToken').mockResolvedValue({ token: 'original' });
    const requests = mockGitHub();
    const client = await createOctokitClientUncached(mockGitHubCliAccount, 'rest');
    await client.request('GET /notifications');
    const count = requests.length;
    read.mockResolvedValue({ error: 'GH_NOT_AUTHENTICATED' });

    await expect(client.request('GET /notifications')).rejects.toThrow('GitHub CLI has no token');
    expect(requests).toHaveLength(count);
  });

  it.each([
    ['rest', 'GET /notifications'],
    ['rest', 'PATCH /notifications/threads/123'],
    ['graphql', 'POST /graphql'],
  ] as const)(
    'rejects a changed user before %s %s after a successful request',
    async (type, route) => {
      const read = vi.spyOn(comms, 'readGitHubCliToken').mockResolvedValue({ token: 'original' });
      const requests = mockGitHub();
      const client = await createOctokitClientUncached(mockGitHubCliAccount, type);
      await client.request(type === 'rest' ? 'GET /notifications' : 'POST /graphql');
      read.mockResolvedValue({ token: 'different-user' });

      await expect(client.request(route)).rejects.toThrow(
        'GitHub CLI is signed in as a different user',
      );

      expect(requests.filter((request) => !request.url.endsWith('/user'))).toHaveLength(1);
    },
  );

  it('recovers concurrent REST and GraphQL requests after a 401', async () => {
    const read = vi
      .spyOn(comms, 'readGitHubCliToken')
      .mockResolvedValueOnce({ token: 'expired' })
      .mockResolvedValue({ token: 'replacement' });
    const requests = mockGitHub('expired');
    const [rest, graphql] = await Promise.all([
      createOctokitClientUncached(mockGitHubCliAccount, 'rest'),
      createOctokitClientUncached(mockGitHubCliAccount, 'graphql'),
    ]);

    await Promise.all([rest.request('GET /notifications'), graphql.request('POST /graphql')]);

    expect(read).toHaveBeenCalled();
    expect(
      requests
        .filter((request) => !request.url.endsWith('/user'))
        .map((request) => request.authorization),
    ).toEqual(['token replacement', 'token replacement']);
  });
});
