import type { Endpoints } from '@octokit/types';

import type { Link } from '../../types';

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

export type ListNotificationsForAuthenticatedUserResponse =
  Endpoints['GET /notifications']['response']['data'];

export type MarkNotificationThreadAsReadResponse =
  Endpoints['PATCH /notifications/threads/{thread_id}']['response']['data'];

export type MarkNotificationThreadAsDoneResponse =
  Endpoints['DELETE /notifications/threads/{thread_id}']['response']['data'];

export type IgnoreNotificationThreadSubscriptionResponse =
  Endpoints['PUT /notifications/threads/{thread_id}/subscription']['response']['data'];

export type GetCommitResponse =
  Endpoints['GET /repos/{owner}/{repo}/commits/{ref}']['response']['data'];

export type GetCommitCommentResponse =
  Endpoints['GET /repos/{owner}/{repo}/comments/{comment_id}']['response']['data'];

export type GetReleaseResponse =
  Endpoints['GET /repos/{owner}/{repo}/releases/{release_id}']['response']['data'];

export type RawGitHubNotification =
  Endpoints['GET /notifications']['response']['data'][number];

// FIXME - replace this if possible
export type RawUser = Endpoints['GET /users/{username}']['response']['data'];
