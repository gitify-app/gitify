import type { AuthState } from '../types';
import type {
  Discussion,
  DiscussionComment,
  Notification,
} from '../typesGitHub';
import { openExternalLink } from '../utils/comms';
import { getHtmlUrl, searchDiscussions } from './api/client';
import { Constants } from './constants';
import { getCheckSuiteAttributes, getWorkflowRunAttributes } from './subject';

export function isGitHubLoggedIn(accounts: AuthState): boolean {
  return accounts.token != null;
}

export function getTokenForHost(hostname: string, accounts: AuthState): string {
  const isEnterprise = isEnterpriseHost(hostname);

  if (isEnterprise) {
    return accounts.enterpriseAccounts.find((obj) => obj.hostname === hostname)
      .token;
  }

  return accounts.token;
}

export function isEnterpriseHost(hostname: string): boolean {
  return !hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname);
}

export function getGitHubAPIBaseUrl(hostname: string): string {
  const isEnterprise = isEnterpriseHost(hostname);
  return isEnterprise
    ? `https://${hostname}/api/v3`
    : Constants.GITHUB_API_BASE_URL;
}

export function addNotificationReferrerIdToUrl(
  url: string,
  notificationId: string,
  userId: number,
): string {
  const parsedUrl = new URL(url);

  parsedUrl.searchParams.set(
    'notification_referrer_id',
    generateNotificationReferrerId(notificationId, userId),
  );

  return parsedUrl.href;
}

export function generateNotificationReferrerId(
  notificationId: string,
  userId: number,
): string {
  const buffer = Buffer.from(
    `018:NotificationThread${notificationId}:${userId}`,
  );
  return buffer.toString('base64');
}

export function getCheckSuiteUrl(notification: Notification): string {
  let url = `${notification.repository.html_url}/actions`;
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

  if (filters.length > 0) {
    url += `?query=${filters.join('+')}`;
  }

  return url;
}

export function getWorkflowRunUrl(notification: Notification): string {
  let url = `${notification.repository.html_url}/actions`;
  const filters = [];

  const workflowRunAttributes = getWorkflowRunAttributes(notification);

  if (workflowRunAttributes?.status) {
    filters.push(`is:${workflowRunAttributes.status}`);
  }

  if (filters.length > 0) {
    url += `?query=${filters.join('+')}`;
  }

  return url;
}

async function getDiscussionUrl(
  notification: Notification,
  token: string,
): Promise<string> {
  let url = `${notification.repository.html_url}/discussions`;

  const discussion = await fetchDiscussion(notification, token);

  if (discussion) {
    url = discussion.url;

    const comments = discussion.comments.nodes;

    const latestCommentId = getLatestDiscussionComment(comments)?.databaseId;

    if (latestCommentId) {
      url += `#discussioncomment-${latestCommentId}`;
    }
  }

  return url;
}

export async function fetchDiscussion(
  notification: Notification,
  token: string,
): Promise<Discussion | null> {
  try {
    const response = await searchDiscussions(notification, token);

    let discussions =
      response.data?.data.search.nodes.filter(
        (discussion) => discussion.title === notification.subject.title,
      ) || [];

    if (discussions.length > 1)
      discussions = discussions.filter(
        (discussion) => discussion.viewerSubscription === 'SUBSCRIBED',
      );

    return discussions[0];
  } catch (err) {}
}

export function getLatestDiscussionComment(
  comments: DiscussionComment[],
): DiscussionComment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  return comments
    .flatMap((comment) => comment.replies.nodes)
    .concat([comments[comments.length - 1]])
    .reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
}

export async function generateGitHubWebUrl(
  notification: Notification,
  accounts: AuthState,
): Promise<string> {
  let url = notification.repository.html_url;
  const token = getTokenForHost(notification.hostname, accounts);

  if (notification.subject.latest_comment_url) {
    url = await getHtmlUrl(notification.subject.latest_comment_url, token);
  } else if (notification.subject.url) {
    url = await getHtmlUrl(notification.subject.url, token);
  } else {
    // Perform any specific notification type handling (only required for a few special notification scenarios)
    switch (notification.subject.type) {
      case 'CheckSuite':
        url = getCheckSuiteUrl(notification);
        break;
      case 'Discussion':
        url = await getDiscussionUrl(notification, token);
        break;
      case 'RepositoryInvitation':
        url = `${notification.repository.html_url}/invitations`;
        break;
      case 'WorkflowRun':
        url = getWorkflowRunUrl(notification);
        break;
      default:
        break;
    }
  }

  url = addNotificationReferrerIdToUrl(url, notification.id, accounts.user?.id);

  return url;
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

export async function openInBrowser(
  notification: Notification,
  accounts: AuthState,
) {
  const url = await generateGitHubWebUrl(notification, accounts);

  openExternalLink(url);
}
