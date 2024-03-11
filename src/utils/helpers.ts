import { EnterpriseAccount, AuthState } from '../types';
import {
  Notification,
  GraphQLSearch,
  DiscussionCommentNode,
  DiscussionSearchResultNode,
  PullRequest,
  Issue,
  IssueComments,
} from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import { openExternalLink } from '../utils/comms';
import { Constants } from './constants';
import { getWorkflowRunAttributes, getCheckSuiteAttributes } from './state';

export function getEnterpriseAccountToken(
  hostname: string,
  accounts: EnterpriseAccount[],
): string {
  return accounts.find((obj) => obj.hostname === hostname).token;
}

export function isEnterpriseHost(hostname: string): boolean {
  return !hostname.endsWith(Constants.DEFAULT_AUTH_OPTIONS.hostname);
}

export function generateGitHubAPIUrl(hostname) {
  const isEnterprise = isEnterpriseHost(hostname);
  return isEnterprise
    ? `https://${hostname}/api/v3/`
    : `https://api.${hostname}/`;
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

export function addHours(date: string, hours: number): string {
  return new Date(new Date(date).getTime() + hours * 36e5).toISOString();
}

export function formatSearchQueryString(
  repo: string,
  title: string,
  lastUpdated: string,
): string {
  return `${title} in:title repo:${repo} updated:>${addHours(lastUpdated, -2)}`;
}

export async function getHtmlUrl(url: string, token: string): Promise<string> {
  const response: Issue | IssueComments | PullRequest = (
    await apiRequestAuth(url, 'GET', token)
  ).data;

  return response.html_url;
}

export function getCheckSuiteUrl(notification: Notification) {
  let url = `${notification.repository.html_url}/actions`;
  let filters = [];

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

export function getWorkflowRunUrl(notification: Notification) {
  let url = `${notification.repository.html_url}/actions`;
  let filters = [];

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

  const response: GraphQLSearch<DiscussionSearchResultNode> =
    await apiRequestAuth(`https://api.github.com/graphql`, 'POST', token, {
      query: `{
        search(query:"${formatSearchQueryString(
          notification.repository.full_name,
          notification.subject.title,
          notification.updated_at,
        )}", type: DISCUSSION, first: 10) {
          nodes {
            ... on Discussion {
              viewerSubscription
              title
              url
              comments(last: 100) {
                nodes {
                  databaseId
                  createdAt
                  replies(last: 1) {
                    nodes {
                      databaseId
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      }`,
    });

  let discussions =
    response?.data?.data?.search?.nodes?.filter(
      (discussion) => discussion.title === notification.subject.title,
    ) || [];

  if (discussions.length > 1)
    discussions = discussions.filter(
      (discussion) => discussion.viewerSubscription === 'SUBSCRIBED',
    );

  if (discussions[0]) {
    const discussion = discussions[0];
    url = discussion.url;

    let comments = discussion.comments.nodes;

    let latestCommentId: string | number;
    if (comments?.length) {
      latestCommentId = getLatestDiscussionCommentId(comments);
      url += `#discussioncomment-${latestCommentId}`;
    }
  }

  return url;
}

export const getLatestDiscussionCommentId = (
  comments: DiscussionCommentNode[],
) =>
  comments
    .flatMap((comment) => comment.replies.nodes)
    .concat([comments.at(-1)])
    .reduce((a, b) => (a.createdAt > b.createdAt ? a : b))?.databaseId;

export async function generateGitHubWebUrl(
  notification: Notification,
  accounts: AuthState,
): Promise<string> {
  let url: string;

  if (notification.subject.latest_comment_url) {
    url = await getHtmlUrl(
      notification.subject.latest_comment_url,
      accounts.token,
    );
  } else if (notification.subject.url) {
    url = await getHtmlUrl(notification.subject.url, accounts.token);
  } else {
    // Perform any specific notification type handling (only required for a few special notification scenarios)
    switch (notification.subject.type) {
      case 'CheckSuite':
        url = getCheckSuiteUrl(notification);
        break;
      case 'Discussion':
        url = await getDiscussionUrl(notification, accounts.token);
        break;
      case 'RepositoryInvitation':
        url = `${notification.repository.html_url}/invitations`;
        break;
      case 'WorkflowRun':
        url = getWorkflowRunUrl(notification);
        break;
      default:
        url = notification.repository.html_url;
        break;
    }
  }

  url = addNotificationReferrerIdToUrl(url, notification.id, accounts.user?.id);

  return url;
}

export async function openInBrowser(
  notification: Notification,
  accounts: AuthState,
) {
  const url = await generateGitHubWebUrl(notification, accounts);

  openExternalLink(url);
}
