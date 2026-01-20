import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import { Constants } from '../constants';

import type { Chevron, GitifyNotification, Hostname, Link } from '../types';
import type { PlatformType } from './auth/types';

import { getHtmlUrl } from './api/client';
import { rendererLogError } from './logger';
import { createNotificationHandler } from './notifications/handlers';

export function getPlatformFromHostname(hostname: string): PlatformType {
  return hostname.endsWith(Constants.OAUTH_DEVICE_FLOW.hostname)
    ? 'GitHub Cloud'
    : 'GitHub Enterprise Server';
}

export function isEnterpriseServerHost(hostname: Hostname): boolean {
  return !hostname.endsWith(Constants.OAUTH_DEVICE_FLOW.hostname);
}

export function generateNotificationReferrerId(
  notification: GitifyNotification,
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
  notification: GitifyNotification,
): Promise<Link> {
  const handler = createNotificationHandler(notification);
  const url = new URL(handler.defaultUrl(notification));

  if (notification.subject.htmlUrl) {
    url.href = notification.subject.htmlUrl;
  } else {
    try {
      if (notification.subject.latestCommentUrl) {
        url.href = await getHtmlUrl(
          notification.subject.latestCommentUrl,
          notification.account.token,
        );
      } else if (notification.subject.url) {
        url.href = await getHtmlUrl(
          notification.subject.url,
          notification.account.token,
        );
      }
    } catch (err) {
      rendererLogError(
        'generateGitHubWebUrl',
        'Failed to resolve specific notification html url for',
        err,
        notification,
      );
    }
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
