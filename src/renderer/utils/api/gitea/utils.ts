import type { Hostname } from '../../../types';

/**
 * Base URL for Gitea HTTP API v1 (`/api/v1/`).
 */
export function getGiteaApiBaseUrl(hostname: Hostname): URL {
  return new URL(`https://${hostname}/api/v1/`);
}
