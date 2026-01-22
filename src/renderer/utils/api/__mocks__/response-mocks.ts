import type { Link } from '../../../types';
import type { RawUser } from '../types';

import type {
  AuthorFieldsFragment,
  DiscussionDetailsFragment,
  DiscussionStateReason,
  IssueDetailsFragment,
  IssueState,
  IssueStateReason,
  PullRequestDetailsFragment,
  PullRequestState,
} from '../graphql/generated/graphql';

/**
 * Creates a mock raw user [REST API]
 */
export function mockRawUser(login: string): RawUser {
  return {
    login,
    id: 1,
    node_id: 'MDQ6VXNlcjE=',
    avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' as Link,
    gravatar_id: '',
    url: `https://api.github.com/users/${login}` as Link,
    html_url: `https://github.com/${login}` as Link,
    followers_url: `https://api.github.com/users/${login}/followers` as Link,
    following_url:
      `https://api.github.com/users/${login}/following{/other_user}` as Link,
    gists_url: `https://api.github.com/users/${login}/gists{/gist_id}` as Link,
    starred_url:
      `https://api.github.com/users/${login}/starred{/owner}{/repo}` as Link,
    subscriptions_url:
      `https://api.github.com/users/${login}/subscriptions` as Link,
    organizations_url: `https://api.github.com/users/${login}/orgs` as Link,
    repos_url: `https://api.github.com/users/${login}/repos` as Link,
    events_url:
      `https://api.github.com/users/${login}/events{/privacy}` as Link,
    received_events_url:
      `https://api.github.com/users/${login}/received_events` as Link,
    type: 'User',
    site_admin: false,
  } satisfies RawUser;
}

/**
 * Creates a mock author fragment [GraphQL API]
 */
export const mockAuthor = mockAuthorResponseNode('notification-author');
export const mockCommenter = mockAuthorResponseNode('notification-commenter');
export const mockReplier = mockAuthorResponseNode('notification-replier');

export function mockAuthorResponseNode(login: string): AuthorFieldsFragment {
  return {
    login: login,
    htmlUrl: `https://github.com/${login}` as Link,
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
    __typename: 'User',
  } satisfies AuthorFieldsFragment;
}

/**
 * Creates a mock discussion fragment [GraphQL API]
 */
export function mockDiscussionResponseNode(mocks: {
  stateReason?: DiscussionStateReason;
  isAnswered: boolean;
}): DiscussionDetailsFragment {
  return {
    __typename: 'Discussion',
    number: 123,
    title: 'This is a mock discussion',
    url: 'https://github.com/gitify-app/notifications-test/discussions/123' as Link,
    stateReason: mocks.stateReason,
    isAnswered: mocks.isAnswered,
    author: mockAuthor,
    comments: {
      nodes: [],
      totalCount: 0,
    },
    labels: null,
  } satisfies DiscussionDetailsFragment;
}

/**
 * Creates a mock issue fragment [GraphQL API]
 */
export function mockIssueResponseNode(mocks: {
  state: IssueState;
  stateReason?: IssueStateReason;
}): IssueDetailsFragment {
  return {
    __typename: 'Issue',
    number: 123,
    title: 'PR Title',
    state: mocks.state,
    stateReason: mocks.stateReason,
    url: 'https://github.com/gitify-app/notifications-test/issues/123',
    author: mockAuthor,
    labels: { nodes: [] },
    comments: { totalCount: 0, nodes: [] },
    milestone: null,
  } satisfies IssueDetailsFragment;
}

/**
 * Creates a mock pull request fragment [GraphQL API]
 */
export function mockPullRequestResponseNode(mocks: {
  state: PullRequestState;
  isDraft?: boolean;
  merged?: boolean;
  isInMergeQueue?: boolean;
}): PullRequestDetailsFragment {
  return {
    __typename: 'PullRequest',
    number: 123,
    title: 'Test PR',
    state: mocks.state,
    isDraft: mocks.isDraft ?? false,
    merged: mocks.merged ?? false,
    isInMergeQueue: mocks.isInMergeQueue ?? false,
    url: 'https://github.com/gitify-app/notifications-test/pulls/123',
    author: mockAuthor,
    labels: { nodes: [] },
    comments: {
      totalCount: 0,
      nodes: [],
    },
    reviews: {
      totalCount: 0,
      nodes: [],
    },
    milestone: null,
    closingIssuesReferences: {
      nodes: [],
    },
  } satisfies PullRequestDetailsFragment;
}
