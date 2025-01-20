import { APPLICATION } from './constants';

export function namespacedEvent(event: string) {
  return `${APPLICATION.EVENT_PREFIX}${event}`;
}
