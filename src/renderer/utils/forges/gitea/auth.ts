import { isValidHostname } from '../../auth/utils';

export function isValidGiteaHostname(hostname: string): boolean {
  const match = /^([^:\s]+)(?::([0-9]{1,5}))?$/.exec(hostname);
  if (!match || match[0] !== hostname || !isValidHostname(match[1])) {
    return false;
  }

  const port = match[2];
  return port === undefined || (Number(port) >= 1 && Number(port) <= 65535);
}
