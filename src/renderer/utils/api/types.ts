import type { Endpoints } from '@octokit/types';

import type { Link } from '../../types';

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

export type ListNotificationsForAuthenticatedUserResponse =
  Endpoints['GET /notifications']['response'];

export type MarkNotificationThreadAsReadResponse =
  Endpoints['PATCH /notifications/threads/{thread_id}']['response'];

export type MarkNotificationThreadAsDoneResponse =
  Endpoints['DELETE /notifications/threads/{thread_id}']['response'];

export type IgnoreNotificationThreadSubscriptionResponse =
  Endpoints['PUT /notifications/threads/{thread_id}/subscription']['response'];

export type GetCommitResponse =
  Endpoints['GET /repos/{owner}/{repo}/commits/{ref}']['response'];

export type GetCommitCommentResponse =
  Endpoints['GET /repos/{owner}/{repo}/comments/{comment_id}']['response'];

export type GetReleaseResponse =
  Endpoints['GET /repos/{owner}/{repo}/releases/{release_id}']['response'];
