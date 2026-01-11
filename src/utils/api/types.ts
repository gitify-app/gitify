import type { components } from '@octokit/openapi-types';

import type { Link } from '../../types';

export interface GitHubRESTError {
  message: string;
  documentation_url: Link;
}

export type NotificationThreadSubscription =
  components['schemas']['thread-subscription'];

export type RawCommit = components['schemas']['commit'];

export type RawCommitComment = components['schemas']['commit-comment'];

export type RawGitHubNotification = components['schemas']['thread'];

export type RawRelease = components['schemas']['release'];

export type RawUser = components['schemas']['simple-user'];
