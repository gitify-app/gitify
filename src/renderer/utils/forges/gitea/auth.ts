import type { Hostname } from '../../../types';

export function parseGiteaOrigin(hostname: Hostname): URL | null {
  if (
    typeof hostname !== 'string' ||
    hostname.trim() !== hostname ||
    !/^(?:https?:\/\/)?(?:[a-z0-9.-]+|\[[a-f0-9:.]+\])(?::\d{1,5})?\/?$/i.test(hostname)
  ) {
    return null;
  }

  try {
    const url = new URL(/^https?:\/\//i.test(hostname) ? hostname : `https://${hostname}`);
    const validHost =
      url.hostname.startsWith('[') ||
      url.hostname
        .split('.')
        .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
    return validHost && url.port !== '0' ? url : null;
  } catch {
    return null;
  }
}

export function getGiteaOrigin(hostname: Hostname): string {
  const url = parseGiteaOrigin(hostname);
  if (!url) {
    throw new Error('Refusing to build a Gitea URL for invalid hostname.');
  }
  return url.origin;
}

export function isValidGiteaHostname(hostname: Hostname): boolean {
  return parseGiteaOrigin(hostname) !== null;
}
