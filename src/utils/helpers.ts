import { EnterpriseAccount } from '../types';
import { Notification } from '../typesGithub';
import { apiRequestAuth } from '../utils/api-requests';

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
  userId?: number
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

    return `${newUrl}?${notificationReferrerId}`;
  }

  return newUrl;
}

const addHours = (date: string, hours: number) =>
  new Date(new Date(date).getTime() + hours * 36e5).toISOString();

const queryString = (repo: string, title: string, lastUpdated: string) =>
  `${title} in:title repo:${repo} -updated:<${addHours(lastUpdated, -2)}`;

export async function getDiscussionUrl(
  notification: Notification,
  token: string
): Promise<string> {
  const response = await apiRequestAuth(`https://api.github.com/graphql`, 'POST', token, {
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
                  }
              }
          }
      }
    }`,
  });
  let edges = response?.data?.data?.search?.edges?.filter(
      edge => edge.node.title === notification.subject.title
  ) || [];
  if (edges.length > 1)
    edges = edges.filter(
      edge => edge.node.viewerSubscription === 'SUBSCRIBED'
    );
  return edges[0]?.node.url;
}
