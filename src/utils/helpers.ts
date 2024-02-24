import { EnterpriseAccount, AuthState } from '../types';
import {
  Notification,
  GraphQLSearch,
  DiscussionCommentEdge,
} from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import { openExternalLink } from '../utils/comms';
import { Constants } from './constants';
import { inferCheckSuiteStatus } from './github-api';

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
  const response = await apiRequestAuth(url, 'GET', token);

  return response.data.html_url;
}

async function getDiscussionUrl(
  notification: Notification,
  token: string,
): Promise<string> {
  let url = `${notification.repository.html_url}/discussions`;

  const response: GraphQLSearch = await apiRequestAuth(
    `https://api.github.com/graphql`,
    'POST',
    token,
    {
      query: `{
      search(query:"${formatSearchQueryString(
        notification.repository.full_name,
        notification.subject.title,
        notification.updated_at,
      )}", type: DISCUSSION, first: 10) {
          edges {
              node {
                  ... on Discussion {
                      viewerSubscription
                      title
                      url
                      comments(last: 100) {
                        edges {
                          node {
                            databaseId
                            createdAt
                            replies(last: 1) {
                              edges {
                                node {
                                  databaseId
                                  createdAt
                                }
                              }
                            }
                          }
                        }
                      }
                  }
              }
          }
      }
    }`,
    },
  );
  let edges =
    response?.data?.data?.search?.edges?.filter(
      (edge) => edge.node.title === notification.subject.title,
    ) || [];
  if (edges.length > 1)
    edges = edges.filter(
      (edge) => edge.node.viewerSubscription === 'SUBSCRIBED',
    );

  if (edges[0]) {
    url = edges[0].node.url;

    let comments = edges[0]?.node.comments.edges;

    let latestCommentId: string | number;
    if (comments?.length) {
      latestCommentId = getLatestDiscussionCommentId(comments);
      url += `#discussioncomment-${latestCommentId}`;
    }
  }

  return url;
}

export const getLatestDiscussionCommentId = (
  comments: DiscussionCommentEdge[],
) =>
  comments
    .flatMap((comment) => comment.node.replies.edges)
    .concat([comments.at(-1)])
    .reduce((a, b) => (a.node.createdAt > b.node.createdAt ? a : b))?.node
    .databaseId;

export function getCheckSuiteUrl(notification: Notification) {
  let url = `${notification.repository.html_url}/actions`;
  let filters = [];

  const regexPattern =
    /^(?<workflowName>.*?) workflow run(, Attempt #(?<attemptNumber>\d+))? (?<workflowStatus>.*?) for (?<branchName>.*?) branch$/;
  const matches = regexPattern.exec(notification.subject.title);

  if (matches) {
    const { groups } = matches;

    if (groups.workflowName) {
      filters.push(`workflow:"${groups.workflowName.replaceAll(' ', '+')}"`);
    }

    if (groups.workflowStatus) {
      const workflowStatus = inferCheckSuiteStatus(notification.subject.title);

      if (workflowStatus) {
        filters.push(`is:${workflowStatus}`);
      }
    }

    if (groups.branchName) {
      filters.push(`branch:${groups.branchName}`);
    }
  }

  if (filters.length > 0) {
    url += `?query=${filters.join('+')}`;
  }

  return url;
}

export function getWorkflowRunUrl(notification: Notification) {
  const workflowStatus = inferCheckSuiteStatus(notification.subject.title);

  let url = `${notification.repository.html_url}/actions`;

  if (workflowStatus) {
    url += `?query=is:${workflowStatus}`;
  }

  return url;
}

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
