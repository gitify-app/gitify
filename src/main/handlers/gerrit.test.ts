import { net } from 'electron';

import type { IGerritRequest } from '../../shared/events';

import { gerritRequest } from './gerrit';

vi.mock('electron', () => ({
  ipcMain: { handle: vi.fn() },
  net: { fetch: vi.fn() },
}));

const request: IGerritRequest = {
  url: 'https://gerrit.example.com/a/changes/proj~1/attention/self/delete',
  method: 'POST',
  authorization: 'Basic abc',
  body: '{"reason":"x"}',
};

describe('main/handlers/gerrit.ts', () => {
  beforeEach(() => {
    vi.mocked(net.fetch).mockReset();
  });

  it('sends the request with Basic auth, JSON body and no redirects', async () => {
    vi.mocked(net.fetch).mockResolvedValueOnce(
      new Response(")]}'\n{}", { status: 200, statusText: 'OK' }),
    );

    const result = await gerritRequest(request);

    expect(result).toEqual({ status: 200, statusText: 'OK', body: ")]}'\n{}" });
    expect(net.fetch).toHaveBeenCalledWith(request.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Basic abc',
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: request.body,
      redirect: 'error',
    });
  });

  it.each([
    ['plain http', { url: 'http://gerrit.example.com/a/changes/' }],
    ['a path outside the /a/ API', { url: 'https://example.com/anything' }],
    ['an unsupported method', { method: 'DELETE' as IGerritRequest['method'] }],
    ['non-Basic credentials', { authorization: 'Bearer abc' }],
  ])('refuses %s without sending it', async (_, override) => {
    await expect(gerritRequest({ ...request, ...override })).rejects.toThrow(/Refusing/);
    expect(net.fetch).not.toHaveBeenCalled();
  });
});
