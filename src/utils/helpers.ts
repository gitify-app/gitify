import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Account, AuthState } from '../types';
import type { Notification } from '../typesGitHub';
import { openExternalLink } from '../utils/comms';
import { getHtmlUrl, getLatestDiscussion } from './api/client';
import type { PlatformType } from './auth/types';
import { Constants } from './constants';
import {
  getCheckSuiteAttributes,
  getLatestDiscussionComment,
  getWorkflowRunAttributes,
} from './subject';

export function isPersonalAccessTokenLoggedIn(auth: AuthState): boolean {
  return auth.accounts.some(
    (account) => account.method === 'Personal Access Token',
  );
}

export function isOAuthAppLoggedIn(auth: AuthState): boolean {
  return auth.accounts.some((account) => account.method === 'OAuth App');
}

export function getAccountForHost(hostname: string, auth: AuthState): Account {
  return auth.accounts.find((account) => hostname.endsWith(account.hostname));
}

export function getPlatformFromHostname(hostname: string): PlatformType {
  return hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname)
    ? 'GitHub Cloud'
    : 'GitHub Enterprise Server';
}

export function isEnterpriseHost(hostname: string): boolean {
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

export function getCheckSuiteUrl(notification: Notification): string {
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

export function getWorkflowRunUrl(notification: Notification): string {
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
export function actionsURL(repositoryURL: string, filters: string[]): string {
  const url = new URL(repositoryURL);
  url.pathname += '/actions';

  if (filters.length > 0) {
    url.searchParams.append('query', filters.join('+'));
  }

  // Note: the GitHub Actions UI cannot handle encoded '+' characters.
  return url.toString().replace(/%2B/g, '+');
}

async function getDiscussionUrl(notification: Notification): Promise<string> {
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

  return url.toString();
}

export async function generateGitHubWebUrl(
  notification: Notification,
): Promise<string> {
  const url = new URL(notification.repository.html_url);

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
      case 'WorkflowRun':
        url.href = getWorkflowRunUrl(notification);
        break;
      default:
        break;
    }
  }

  url.searchParams.set(
    'notification_referrer_id',
    generateNotificationReferrerId(notification),
  );

  return url.toString();
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

export function formatNotificationUpdatedAt(
  notification: Notification,
): string {
  const date = notification.last_read_at ?? notification.updated_at;

  try {
    return formatDistanceToNow(parseISO(date), {
      addSuffix: true,
    });
  } catch (e) {}

  return '';
}

export async function openInBrowser(notification: Notification) {
  const url = await generateGitHubWebUrl(notification);

  openExternalLink(url);
}
