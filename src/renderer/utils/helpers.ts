import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';

import { logError, logWarn } from '../../shared/logger';
import type { Chevron, Hostname, Link } from '../types';
import type { Notification, UserType } from '../typesGitHub';
import { getHtmlUrl, getLatestDiscussion } from './api/client';
import type { PlatformType } from './auth/types';
import { Constants } from './constants';
import {
  getCheckSuiteAttributes,
  getLatestDiscussionComment,
  getWorkflowRunAttributes,
} from './subject';

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
  const buffer = Buffer.from(
    `018:NotificationThread${notification.id}:${notification.account.user.id}`,
  );
  return buffer.toString('base64');
}

export function getCheckSuiteUrl(notification: Notification): Link {
  const filters = [];

  const checkSuiteAttributes = getCheckSuiteAttributes(notification);

  if (checkSuiteAttributes?.workflowName) {
    filters.push(
      `workflow:"${checkSuiteAttributes.workflowName.replaceAll(' ', '+')}"`,
    );
  }

  if (checkSuiteAttributes?.status) {
    filters.push(`is:${checkSuiteAttributes.status}`);
  }

  if (checkSuiteAttributes?.branchName) {
    filters.push(`branch:${checkSuiteAttributes.branchName}`);
  }

  return actionsURL(notification.repository.html_url, filters);
}

export function getWorkflowRunUrl(notification: Notification): Link {
  const filters = [];

  const workflowRunAttributes = getWorkflowRunAttributes(notification);

  if (workflowRunAttributes?.status) {
    filters.push(`is:${workflowRunAttributes.status}`);
  }

  return actionsURL(notification.repository.html_url, filters);
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
  return url.toString().replace(/%2B/g, '+') as Link;
}

async function getDiscussionUrl(notification: Notification): Promise<Link> {
  const url = new URL(notification.repository.html_url);
  url.pathname += '/discussions';

  const discussion = await getLatestDiscussion(notification);

  if (discussion) {
    url.href = discussion.url;

    const latestComment = getLatestDiscussionComment(discussion.comments.nodes);

    if (latestComment) {
      url.hash = `#discussioncomment-${latestComment.databaseId}`;
    }
  }

  return url.toString() as Link;
}

export async function generateGitHubWebUrl(
  notification: Notification,
): Promise<Link> {
  const url = new URL(notification.repository.html_url);

  // FIXME see #1583
  // Upstream GitHub API has started returning subject urls for Discussion notification types,
  // however these URLs are broken.  Temporarily downgrading to use discussion lookup process.
  if (notification.subject.type === 'Discussion') {
    notification.subject.url = null;
    notification.subject.latest_comment_url = null;
  }

  try {
    if (notification.subject.latest_comment_url) {
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
      // Perform any specific notification type handling (only required for a few special notification scenarios)
      switch (notification.subject.type) {
        case 'CheckSuite':
          url.href = getCheckSuiteUrl(notification);
          break;
        case 'Discussion':
          url.href = await getDiscussionUrl(notification);
          break;
        case 'RepositoryInvitation':
          url.pathname += '/invitations';
          break;
        case 'RepositoryDependabotAlertsThread':
          url.pathname += '/security/dependabot';
          break;
        case 'WorkflowRun':
          url.href = getWorkflowRunUrl(notification);
          break;
        default:
          break;
      }
    }
  } catch (err) {
    logError(
      'generateGitHubWebUrl',
      'Failed to resolve specific notification html url for',
      err,
      notification,
    );

    logWarn(
      'generateGitHubWebUrl',
      `Falling back to repository root url: ${notification.repository.full_name}`,
    );
  }

  url.searchParams.set(
    'notification_referrer_id',
    generateNotificationReferrerId(notification),
  );

  return url.toString() as Link;
}

export function formatForDisplay(text: string[]): string {
  if (!text) {
    return '';
  }

  return text
    .join(' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase character followed by an uppercase character
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\w+/g, (word) => {
      // Convert to proper case (capitalize first letter of each word)
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
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

export function isNonHumanUser(type: UserType): boolean {
  return type === 'Bot' || type === 'Organization' || type === 'Mannequin';
}
