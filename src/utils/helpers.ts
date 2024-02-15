import { EnterpriseAccount, AuthState } from '../types';
import {
  Notification,
  GraphQLSearch,
  DiscussionCommentEdge,
} from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import { openExternalLink } from '../utils/comms';
import { Constants } from './constants';
import { getWorkflowTypeFromTitle } from './github-api';

export function getEnterpriseAccountToken(
  hostname: string,
  accounts: EnterpriseAccount[],
): string {
  return accounts.find((obj) => obj.hostname === hostname).token;
}

export function generateGitHubAPIUrl(hostname) {
  const isEnterprise = hostname !== Constants.DEFAULT_AUTH_OPTIONS.hostname;
  return isEnterprise
    ? `https://${hostname}/api/v3/`
    : `https://api.${hostname}/`;
}

export function generateNotificationReferrerId(
  notificationId: string,
  userId: number,
) {
  const buffer = Buffer.from(
    `018:NotificationThread${notificationId}:${userId}`,
  );
  return buffer.toString('base64');
}

export function generateGitHubWebUrl(
  url: string,
  notificationId: string,
  userId?: number,
  comment: string = '',
) {
  const newURL = new URL(url);
  const hostname = newURL.hostname;
  let params = new URLSearchParams(newURL.search);

  const isEnterprise =
    hostname !== `api.${Constants.DEFAULT_AUTH_OPTIONS.hostname}`;

  if (isEnterprise) {
    newURL.href = newURL.href.replace(`${hostname}/api/v3/repos`, hostname);
  } else {
    newURL.href = newURL.href.replace('api.github.com/repos', 'github.com');
  }

  newURL.href = newURL.href.replace('/pulls/', '/pull/');

  if (userId) {
    const notificationReferrerId = generateNotificationReferrerId(
      notificationId,
      userId,
    );

    params.append('notification_referrer_id', notificationReferrerId);
    newURL.search = params.toString();
  }

  return newURL.href + comment;
}

const addHours = (date: string, hours: number) =>
  new Date(new Date(date).getTime() + hours * 36e5).toISOString();

const queryString = (repo: string, title: string, lastUpdated: string) =>
  `${title} in:title repo:${repo} updated:>${addHours(lastUpdated, -2)}`;

async function getReleaseTagWebUrl(notification: Notification, token: string) {
  const response = await apiRequestAuth(notification.subject.url, 'GET', token);

  return {
    url: response.data.html_url,
  };
}

async function getDiscussionUrl(
  notification: Notification,
  token: string,
): Promise<{ url: string; latestCommentId: string | number }> {
  const response: GraphQLSearch = await apiRequestAuth(
    `https://api.github.com/graphql`,
    'POST',
    token,
    {
      query: `{
      search(query:"${queryString(
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

  let comments = edges[0]?.node.comments.edges;

  let latestCommentId: string | number;
  if (comments?.length) {
    latestCommentId = getLatestDiscussionCommentId(comments);
  }

  return {
    url: edges[0]?.node.url,
    latestCommentId,
  };
}

export function inferWorkflowBranchFromTitle(
  notification: Notification,
): string {
  const title = notification.subject.title;

  const titleParts = title.split('for');

  if (titleParts[1]) {
    return titleParts[1].replace('branch', '').trim();
  }

  return null;
}

async function getCheckSuiteUrl(notification: Notification) {
  let titleParts = notification.subject.title.split('workflow run');
  const workflowName = titleParts[0].trim().replaceAll(' ', '+');

  titleParts = titleParts[1].split('for');
  const workflowBranch = titleParts[1].replace('branch', '').trim();

  const workflowStatus = getWorkflowTypeFromTitle(notification.subject.title);

  let url = `${notification.repository.html_url}/actions?query=workflow:"${workflowName}"`;

  if (workflowStatus) {
    url += `+is:${workflowStatus}`;
  }

  if (workflowBranch) {
    url += `+branch:${workflowBranch}`;
  }

  return url;
}

async function getWorkflowRunUrl(notification: Notification) {
  const workflowStatus = getWorkflowTypeFromTitle(notification.subject.title);

  let url = `${notification.repository.html_url}/actions`;

  if (workflowStatus) {
    url += `?query=${workflowStatus}`;

    return url;
  }
}

export const getLatestDiscussionCommentId = (
  comments: DiscussionCommentEdge[],
) =>
  comments
    .flatMap((comment) => comment.node.replies.edges)
    .concat([comments.at(-1)])
    .reduce((a, b) => (a.node.createdAt > b.node.createdAt ? a : b))?.node
    .databaseId;

export const getCommentId = (url: string) =>
  /comments\/(?<id>\d+)/g.exec(url)?.groups?.id;

export async function openInBrowser(
  notification: Notification,
  accounts: AuthState,
) {
  if (notification.subject.type === 'Release') {
    getReleaseTagWebUrl(notification, accounts.token).then(({ url }) =>
      openExternalLink(
        generateGitHubWebUrl(url, notification.id, accounts.user?.id),
      ),
    );
  } else if (notification.subject.type === 'Discussion') {
    getDiscussionUrl(notification, accounts.token).then(
      ({ url, latestCommentId }) =>
        openExternalLink(
          generateGitHubWebUrl(
            url || `${notification.repository.url}/discussions`,
            notification.id,
            accounts.user?.id,
            latestCommentId
              ? '#discussioncomment-' + latestCommentId
              : undefined,
          ),
        ),
    );
  } else if (notification.subject.type === 'CheckSuite') {
    getCheckSuiteUrl(notification).then((url) =>
      openExternalLink(
        generateGitHubWebUrl(url, notification.id, accounts.user?.id),
      ),
    );
  } else if (notification.subject.type === 'WorkflowRun') {
    getWorkflowRunUrl(notification).then((url) =>
      openExternalLink(
        generateGitHubWebUrl(url, notification.id, accounts.user?.id),
      ),
    );
  } else if (notification.subject.url) {
    const latestCommentId = getCommentId(
      notification.subject.latest_comment_url,
    );
    openExternalLink(
      generateGitHubWebUrl(
        notification.subject.url,
        notification.id,
        accounts.user?.id,
        latestCommentId ? '#issuecomment-' + latestCommentId : undefined,
      ),
    );
  } else {
    openExternalLink(
      generateGitHubWebUrl(
        notification.repository.html_url,
        notification.id,
        accounts.user?.id,
      ),
    );
  }
}
