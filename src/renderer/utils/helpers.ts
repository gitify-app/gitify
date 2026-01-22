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

export interface ParsedCodePart {
  id: string;
  type: 'text' | 'code';
  content: string;
}

export function getPlatformFromHostname(hostname: string): PlatformType {
  return hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname)
    ? 'GitHub Cloud'
    : 'GitHub Enterprise Server';
}

export function isEnterpriseServerHost(hostname: Hostname): boolean {
  return !hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname);
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
        const response = await getHtmlUrl(
          notification.subject.latestCommentUrl,
          notification.account.token,
        );

        url.href = response.html_url;
      } else if (notification.subject.url) {
        const response = await getHtmlUrl(
          notification.subject.url,
          notification.account.token,
        );

        url.href = response.html_url;
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

/**
 * Parse inline code blocks (text wrapped in backticks) from a string.
 * Returns an array of parts where each part is either plain text or code.
 *
 * @param text - The text to parse
 * @returns Array of parts with type and content
 */
export function parseInlineCode(text: string): ParsedCodePart[] {
  const regex = /`(?<code>[^`]+)`|(?<text>[^`]+)/g;
  const matches = Array.from(text.matchAll(regex));

  if (matches.length === 0) {
    return [{ id: '0', type: 'text', content: text }];
  }

  return matches.map((match, index) => ({
    id: String(index),
    type: match.groups?.code ? 'code' : 'text',
    content: match.groups?.code ?? match.groups?.text ?? '',
  }));
}
