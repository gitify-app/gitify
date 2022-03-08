import { EnterpriseAccount, AuthState } from '../types';
import { Notification, GraphQLSearch, DiscussionCommentEdge } from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';
import { openExternalLink } from '../utils/comms';
import { Constants } from './constants';

export function getEnterpriseAccountToken(
  hostname: string,
  accounts: EnterpriseAccount[]
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
  userId: number
) {
  const buffer = Buffer.from(
    `018:NotificationThread${notificationId}:${userId}`
  );
  return `notification_referrer_id=${buffer.toString('base64')}`;
}

export function generateGitHubWebUrl(
  url: string,
  notificationId: string,
  userId?: number,
  comment: string = ''
) {
  const { hostname } = new URL(url);
  const isEnterprise =
    hostname !== `api.${Constants.DEFAULT_AUTH_OPTIONS.hostname}`;

  let newUrl: string = isEnterprise
    ? url.replace(`${hostname}/api/v3/repos`, hostname)
    : url.replace('api.github.com/repos', 'github.com');

  if (newUrl.indexOf('/pulls/') !== -1) {
    newUrl = newUrl.replace('/pulls/', '/pull/');
  }

  if (newUrl.indexOf('/releases/') !== -1) {
    newUrl = newUrl.replace('/repos', '');
    newUrl = newUrl.substr(0, newUrl.lastIndexOf('/'));
  }

  if (userId) {
    const notificationReferrerId = generateNotificationReferrerId(
      notificationId,
      userId
    );

    return `${newUrl}?${notificationReferrerId}${comment}`;
  }

  return newUrl + comment;
}

const addHours = (date: string, hours: number) =>
  new Date(new Date(date).getTime() + hours * 36e5).toISOString();

const queryString = (repo: string, title: string, lastUpdated: string) =>
  `${title} in:title repo:${repo} updated:>${addHours(lastUpdated, -2)}`;

async function getDiscussionUrl(
  notification: Notification,
  token: string
): Promise<{ url: string, latestCommentId: string|number}> {
  const response: GraphQLSearch = await apiRequestAuth(`https://api.github.com/graphql`, 'POST', token, {
    query: `{
      search(query:"${queryString(
        notification.repository.full_name,
        notification.subject.title,
        notification.updated_at
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
    }`
  });
  let edges = response?.data?.data?.search?.edges?.filter(
      edge => edge.node.title === notification.subject.title
  ) || [];
  if (edges.length > 1)
    edges = edges.filter(
      edge => edge.node.viewerSubscription === 'SUBSCRIBED'
    );
    
  let comments = edges[0]?.node.comments.edges

  let latestCommentId: string|number;
  if (comments?.length) {
    latestCommentId = getLatestDiscussionCommentId(comments);
  }

  return {
    url: edges[0]?.node.url,
    latestCommentId
  }
}

export const getLatestDiscussionCommentId = (comments: DiscussionCommentEdge[]) => comments
      .flatMap(comment => comment.node.replies.edges)
      .concat([comments.at(-1)])
      .reduce((a, b) => a.node.createdAt > b.node.createdAt ? a : b)
      ?.node.databaseId;

export const getCommentId = (url: string) => /comments\/(?<id>\d+)/g.exec(url)?.groups?.id;

export async function openInBrowser(notification: Notification, accounts: AuthState) {
  if (notification.subject.url) {
    const latestCommentId = getCommentId(notification.subject.latest_comment_url);
    openExternalLink(
      generateGitHubWebUrl(
        notification.subject.url,
        notification.id,
        accounts.user?.id,
        latestCommentId ? '#issuecomment-' + latestCommentId : undefined
      )
    );
  } else if (notification.subject.type === 'Discussion') {
    getDiscussionUrl(notification, accounts.token).then(({ url, latestCommentId }) =>
      openExternalLink(
        generateGitHubWebUrl(
          url || `${notification.repository.url}/discussions`,
          notification.id,
          accounts.user?.id,
          latestCommentId ? '#discussioncomment-' + latestCommentId : undefined
        )
      )
    );
  }
}
