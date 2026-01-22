import type { components } from '@octokit/openapi-types';
import type { Endpoints } from '@octokit/types';

import type { Link } from '../../types';

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

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

export type RawGitHubNotification =
  Endpoints['GET /notifications']['response']['data'][number];

export type RawUser = components['schemas']['simple-user'];

/**
 * Minimal response for endpoints where we're only interested in the `html_url`.
 *
 * Used when following a notification thread's subject URL or latest comment URL.
 */
export type GitHubHtmlUrlResponse = {
  html_url: string;
};

/**
 * These API endpoints don't return a response body:
 *  - HEAD /notifications
 *  - Endpoints['PATCH /notifications/threads/{thread_id}']['response']['data']
 *  - Endpoints['DELETE /notifications/threads/{thread_id}']['response']['data']
 */
// biome-ignore lint/suspicious/noConfusingVoidType: This endpoint has no response body
export type HeadNotificationsResponse = void;

// biome-ignore lint/suspicious/noConfusingVoidType: This endpoint has no response body
export type MarkNotificationThreadAsReadResponse = void;

// biome-ignore lint/suspicious/noConfusingVoidType: This endpoint has no response body
export type MarkNotificationThreadAsDoneResponse = void;
