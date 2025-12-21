import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import { Constants } from '../constants';
import type { Chevron, Hostname, Link } from '../types';
import type { Notification } from '../typesGitHub';
import { getHtmlUrl } from './api/client';
import type { PlatformType } from './auth/types';
import { rendererLogError } from './logger';
import { createNotificationHandler } from './notifications/handlers';

export function getPlatformFromHostname(hostname: string): PlatformType {
  return hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname)
    ? 'GitHub Cloud'
    : 'GitHub Enterprise Server';
}

export function isEnterpriseServerHost(hostname: Hostname): boolean {
  return !hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname);
}

export function generateNotificationReferrerId(
  notification: Notification,
): string {
  const raw = `018:NotificationThread${notification.id}:${notification.account.user.id}`;
  return btoa(raw);
}

/**
 * Construct a GitHub Actions URL for a repository with optional filters.
 */
export function actionsURL(repositoryURL: string, filters: string[]): Link {
  const url = new URL(repositoryURL);
  url.pathname += '/actions';

  if (filters.length > 0) {
    url.searchParams.append('query', filters.join('+'));
  }

  // Note: the GitHub Actions UI cannot handle encoded '+' characters.
  return url.toString().replaceAll('%2B', '+') as Link;
}

export async function generateGitHubWebUrl(
  notification: Notification,
): Promise<Link> {
  const url = new URL(notification.repository.html_url);

  try {
    if (notification.subject.htmlUrl) {
      url.href = notification.subject.htmlUrl;
    } else if (notification.subject.latest_comment_url) {
      url.href = await getHtmlUrl(
        notification.subject.latest_comment_url,
        notification.account.token,
      );
    } else if (notification.subject.url) {
      url.href = await getHtmlUrl(
        notification.subject.url,
        notification.account.token,
      );
    } else {
      const handler = createNotificationHandler(notification);
      handler.defaultUrl(notification);
    }
  } catch (err) {
    rendererLogError(
      'generateGitHubWebUrl',
      'Failed to resolve specific notification html url for',
      err,
      notification,
    );
  }

  url.searchParams.set(
    'notification_referrer_id',
    generateNotificationReferrerId(notification),
  );

  return url.toString() as Link;
}

export function getChevronDetails(
  hasNotifications: boolean,
  isVisible: boolean,
  type: 'account' | 'repository',
): Chevron {
  if (!hasNotifications) {
    return {
      icon: ChevronLeftIcon,
      label: `No notifications for ${type}`,
    };
  }

  if (isVisible) {
    return {
      icon: ChevronDownIcon,
      label: `Hide ${type} notifications`,
    };
  }

  return {
    icon: ChevronRightIcon,
    label: `Show ${type} notifications`,
  };
}
