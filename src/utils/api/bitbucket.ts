import type { AxiosPromise } from 'axios';
import type { Account, Link } from '../../types';
import type { Notification, UserDetails } from '../../typesGitHub';
import { apiRequestBitbucket } from './request';
/**
 * List all notifications for the current user, sorted by most recently updated.
 *
 * Endpoint documentation: https://docs.github.com/en/rest/activity/notifications#list-notifications-for-the-authenticated-user
 */
// TODO - Correct types
export function listBitbucketWork(
  account: Account,
): AxiosPromise<Notification[]> {
  const url = `${account.hostname}/overview-view-state?fields=pullRequests.reviewing.id,pullRequests.reviewing.title,pullRequest.reviewing.state,pullRequests.reviewing.author,pullRequests.reviewing.created_on,pullRequests.reviewing.updated_on,pullRequests.reviewing.links,pullRequests.reviewing.task_count,pullRequests.reviewing.comment_count,pullRequests.reviewing.destination.repository.*`;

  return apiRequestBitbucket(
    url.toString() as Link,
    'GET',
    account.user.login,
    account.token,
  );
}

/**
 * Get the authenticated user
 *
 * Endpoint documentation: https://docs.github.com/en/rest/users/users#get-the-authenticated-user
 */
export function getBitbucketUser(account: Account): AxiosPromise<UserDetails> {
  const url = 'https://api.bitbucket.org/2.0/user';

  return apiRequestBitbucket(
    url.toString() as Link,
    'GET',
    account.user.login,
    account.token,
  );
}
