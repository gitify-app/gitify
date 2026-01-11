import type { Link } from '../../../types';
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
import type { RawUser } from '../types';

/**
 * Creates a mock raw user [REST API]
 */
export function mockRawUser(login: string): RawUser {
  const mockUser: Partial<RawUser> = {
    login: login,
    html_url: `https://github.com/${login}` as Link,
    avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4' as Link,
    type: 'User',
  };

  return mockUser as RawUser;
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
  } as AuthorFieldsFragment;
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
  };
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
  };
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
  };
}
