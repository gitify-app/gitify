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

async function getDiscussionUrl(
  notification: Notification,
  token: string,
): Promise<string> {
  const url = new URL(notification.repository.html_url);
  url.pathname += '/discussions';

  const discussion = await fetchDiscussion(notification, token);

  if (discussion) {
    url.href = discussion.url;

    const latestComment = getLatestDiscussionComment(discussion.comments.nodes);

    if (latestComment) {
      url.hash = `#discussioncomment-${latestComment.databaseId}`;
    }
  }

  return url.toString();
}

export async function fetchDiscussion(
  notification: Notification,
  token: string,
): Promise<Discussion | null> {
  try {
    const response = await searchDiscussions(notification, token);

    const discussions = response.data?.data.search.nodes.filter(
      (discussion) =>
        discussion.title === notification.subject.title &&
        discussion.viewerSubscription === 'SUBSCRIBED',
    );

    return discussions[0] ?? null;
  } catch (err) {}
}

export function getLatestDiscussionComment(
  comments: DiscussionComment[],
): DiscussionComment | null {
  console.log('ADAM - comments: ', JSON.stringify(comments));
  if (!comments || comments.length === 0) {
    return null;
  }

  // Return latest reply if available
  if (comments[0].replies.nodes.length === 1) {
    return comments[0].replies.nodes[0];
  }

  // Return latest comment if no replies
  return comments[0];
}

export async function generateGitHubWebUrl(
  notification: Notification,
  accounts: AuthState,
): Promise<string> {
  const url = new URL(notification.repository.html_url);
  const token = getTokenForHost(notification.hostname, accounts);

  if (notification.subject.latest_comment_url) {
    url.href = await getHtmlUrl(notification.subject.latest_comment_url, token);
  } else if (notification.subject.url) {
    url.href = await getHtmlUrl(notification.subject.url, token);
  } else {
    // Perform any specific notification type handling (only required for a few special notification scenarios)
    switch (notification.subject.type) {
      case 'CheckSuite':
        url.href = getCheckSuiteUrl(notification);
        break;
      case 'Discussion':
        url.href = await getDiscussionUrl(notification, token);
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
    generateNotificationReferrerId(notification.id, accounts.user?.id),
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

export async function openInBrowser(
  notification: Notification,
  accounts: AuthState,
) {
  const url = await generateGitHubWebUrl(notification, accounts);

  openExternalLink(url);
}
