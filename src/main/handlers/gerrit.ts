import { net } from 'electron';

import type { IGerritRequest, IGerritResponse } from '../../shared/events';
import { EVENTS } from '../../shared/events';

import { handleMainEvent } from '../events';

/**
 * Only Gerrit's authenticated REST API (`https://<host>/a/...`) with HTTP
 * Basic credentials is proxied, so this cannot become a general-purpose fetch.
 * The renderer validates the host against the signed-in account.
 */
export function assertGerritRequest(request: IGerritRequest): URL {
  const url = new URL(request.url);
  if (url.protocol !== 'https:' || !url.pathname.startsWith('/a/')) {
    throw new Error('Refusing non-Gerrit API request.');
  }
  if (request.method !== 'GET' && request.method !== 'POST') {
    throw new Error('Refusing unsupported Gerrit request method.');
  }
  if (!request.authorization.startsWith('Basic ')) {
    throw new Error('Refusing Gerrit request without Basic credentials.');
  }
  return url;
}

export async function gerritRequest(request: IGerritRequest): Promise<IGerritResponse> {
  const url = assertGerritRequest(request);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: request.authorization,
  };
  if (request.body !== undefined) {
    headers['Content-Type'] = 'application/json; charset=UTF-8';
  }

  const response = await net.fetch(url.toString(), {
    method: request.method,
    headers,
    body: request.body,
    // Never replay credentials to wherever a redirect points.
    redirect: 'error',
  });

  return {
    status: response.status,
    statusText: response.statusText,
    body: await response.text(),
  };
}

export function registerGerritHandlers(): void {
  handleMainEvent(EVENTS.GERRIT_REQUEST, (_, request) => gerritRequest(request));
}
