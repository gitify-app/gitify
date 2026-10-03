import type { components } from '@octokit/openapi-types';
import type { Endpoints } from '@octokit/types';

export type APIClientType = 'rest' | 'graphql';

export type GetAuthenticatedUserResponse = Endpoints['GET /user']['response']['data'];

export type ListNotificationsForAuthenticatedUserResponse =
  Endpoints['GET /notifications']['response']['data'];

export type IgnoreNotificationThreadSubscriptionResponse =
  Endpoints['PUT /notifications/threads/{thread_id}/subscription']['response']['data'];

export type GetCommitResponse =
  Endpoints['GET /repos/{owner}/{repo}/commits/{ref}']['response']['data'];

export type GetCommitCommentResponse =
  Endpoints['GET /repos/{owner}/{repo}/comments/{comment_id}']['response']['data'];

export type GetReleaseResponse =
  Endpoints['GET /repos/{owner}/{repo}/releases/{release_id}']['response']['data'];

export type RawGitHubNotification = Endpoints['GET /notifications']['response']['data'][number];

export type RawUser = components['schemas']['simple-user'];
