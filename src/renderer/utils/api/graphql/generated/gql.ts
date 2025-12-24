/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment AuthorFields on Actor {\n  login\n  html_url: url\n  avatar_url: avatarUrl\n  type: __typename\n}\n\nfragment MilestoneFields on Milestone {\n  state\n  title\n}": typeof types.AuthorFieldsFragmentDoc,
    "query FetchDiscussionByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $lastReplies: Int, $firstLabels: Int, $includeIsAnswered: Boolean!) {\n  repository(owner: $owner, name: $name) {\n    discussion(number: $number) {\n      ...DiscussionDetails\n    }\n  }\n}\n\nfragment DiscussionDetails on Discussion {\n  __typename\n  number\n  title\n  stateReason\n  isAnswered @include(if: $includeIsAnswered)\n  url\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      ...DiscussionCommentFields\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n}\n\nfragment CommentFields on DiscussionComment {\n  databaseId\n  createdAt\n  author {\n    ...AuthorFields\n  }\n  url\n}\n\nfragment DiscussionCommentFields on DiscussionComment {\n  ...CommentFields\n  replies(last: $lastReplies) {\n    totalCount\n    nodes {\n      ...CommentFields\n    }\n  }\n}": typeof types.FetchDiscussionByNumberDocument,
    "query FetchIssueByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $firstLabels: Int) {\n  repository(owner: $owner, name: $name) {\n    issue(number: $number) {\n      ...IssueDetails\n    }\n  }\n}\n\nfragment IssueDetails on Issue {\n  __typename\n  number\n  title\n  url\n  state\n  stateReason\n  milestone {\n    ...MilestoneFields\n  }\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      url\n      author {\n        ...AuthorFields\n      }\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n}": typeof types.FetchIssueByNumberDocument,
    "query FetchPullRequestByNumber($owner: String!, $name: String!, $number: Int!, $firstLabels: Int, $lastComments: Int, $lastReviews: Int, $firstClosingIssues: Int) {\n  repository(owner: $owner, name: $name) {\n    pullRequest(number: $number) {\n      ...PullRequestDetails\n    }\n  }\n}\n\nfragment PullRequestDetails on PullRequest {\n  __typename\n  number\n  title\n  url\n  state\n  merged\n  isDraft\n  isInMergeQueue\n  milestone {\n    ...MilestoneFields\n  }\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      url\n      author {\n        ...AuthorFields\n      }\n    }\n  }\n  reviews(last: $lastReviews) {\n    totalCount\n    nodes {\n      ...PullRequestReviewFields\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n  closingIssuesReferences(first: $firstClosingIssues) {\n    nodes {\n      number\n    }\n  }\n}\n\nfragment PullRequestReviewFields on PullRequestReview {\n  state\n  author {\n    login\n  }\n}": typeof types.FetchPullRequestByNumberDocument,
    "query FetchAuthenticatedUserDetails {\n  viewer {\n    id\n    name\n    login\n    avatarUrl\n  }\n}": typeof types.FetchAuthenticatedUserDetailsDocument,
};
const documents: Documents = {
    "fragment AuthorFields on Actor {\n  login\n  html_url: url\n  avatar_url: avatarUrl\n  type: __typename\n}\n\nfragment MilestoneFields on Milestone {\n  state\n  title\n}": types.AuthorFieldsFragmentDoc,
    "query FetchDiscussionByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $lastReplies: Int, $firstLabels: Int, $includeIsAnswered: Boolean!) {\n  repository(owner: $owner, name: $name) {\n    discussion(number: $number) {\n      ...DiscussionDetails\n    }\n  }\n}\n\nfragment DiscussionDetails on Discussion {\n  __typename\n  number\n  title\n  stateReason\n  isAnswered @include(if: $includeIsAnswered)\n  url\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      ...DiscussionCommentFields\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n}\n\nfragment CommentFields on DiscussionComment {\n  databaseId\n  createdAt\n  author {\n    ...AuthorFields\n  }\n  url\n}\n\nfragment DiscussionCommentFields on DiscussionComment {\n  ...CommentFields\n  replies(last: $lastReplies) {\n    totalCount\n    nodes {\n      ...CommentFields\n    }\n  }\n}": types.FetchDiscussionByNumberDocument,
    "query FetchIssueByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $firstLabels: Int) {\n  repository(owner: $owner, name: $name) {\n    issue(number: $number) {\n      ...IssueDetails\n    }\n  }\n}\n\nfragment IssueDetails on Issue {\n  __typename\n  number\n  title\n  url\n  state\n  stateReason\n  milestone {\n    ...MilestoneFields\n  }\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      url\n      author {\n        ...AuthorFields\n      }\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n}": types.FetchIssueByNumberDocument,
    "query FetchPullRequestByNumber($owner: String!, $name: String!, $number: Int!, $firstLabels: Int, $lastComments: Int, $lastReviews: Int, $firstClosingIssues: Int) {\n  repository(owner: $owner, name: $name) {\n    pullRequest(number: $number) {\n      ...PullRequestDetails\n    }\n  }\n}\n\nfragment PullRequestDetails on PullRequest {\n  __typename\n  number\n  title\n  url\n  state\n  merged\n  isDraft\n  isInMergeQueue\n  milestone {\n    ...MilestoneFields\n  }\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      url\n      author {\n        ...AuthorFields\n      }\n    }\n  }\n  reviews(last: $lastReviews) {\n    totalCount\n    nodes {\n      ...PullRequestReviewFields\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n  closingIssuesReferences(first: $firstClosingIssues) {\n    nodes {\n      number\n    }\n  }\n}\n\nfragment PullRequestReviewFields on PullRequestReview {\n  state\n  author {\n    login\n  }\n}": types.FetchPullRequestByNumberDocument,
    "query FetchAuthenticatedUserDetails {\n  viewer {\n    id\n    name\n    login\n    avatarUrl\n  }\n}": types.FetchAuthenticatedUserDetailsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment AuthorFields on Actor {\n  login\n  html_url: url\n  avatar_url: avatarUrl\n  type: __typename\n}\n\nfragment MilestoneFields on Milestone {\n  state\n  title\n}"): typeof import('./graphql').AuthorFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query FetchDiscussionByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $lastReplies: Int, $firstLabels: Int, $includeIsAnswered: Boolean!) {\n  repository(owner: $owner, name: $name) {\n    discussion(number: $number) {\n      ...DiscussionDetails\n    }\n  }\n}\n\nfragment DiscussionDetails on Discussion {\n  __typename\n  number\n  title\n  stateReason\n  isAnswered @include(if: $includeIsAnswered)\n  url\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      ...DiscussionCommentFields\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n}\n\nfragment CommentFields on DiscussionComment {\n  databaseId\n  createdAt\n  author {\n    ...AuthorFields\n  }\n  url\n}\n\nfragment DiscussionCommentFields on DiscussionComment {\n  ...CommentFields\n  replies(last: $lastReplies) {\n    totalCount\n    nodes {\n      ...CommentFields\n    }\n  }\n}"): typeof import('./graphql').FetchDiscussionByNumberDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query FetchIssueByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $firstLabels: Int) {\n  repository(owner: $owner, name: $name) {\n    issue(number: $number) {\n      ...IssueDetails\n    }\n  }\n}\n\nfragment IssueDetails on Issue {\n  __typename\n  number\n  title\n  url\n  state\n  stateReason\n  milestone {\n    ...MilestoneFields\n  }\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      url\n      author {\n        ...AuthorFields\n      }\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n}"): typeof import('./graphql').FetchIssueByNumberDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query FetchPullRequestByNumber($owner: String!, $name: String!, $number: Int!, $firstLabels: Int, $lastComments: Int, $lastReviews: Int, $firstClosingIssues: Int) {\n  repository(owner: $owner, name: $name) {\n    pullRequest(number: $number) {\n      ...PullRequestDetails\n    }\n  }\n}\n\nfragment PullRequestDetails on PullRequest {\n  __typename\n  number\n  title\n  url\n  state\n  merged\n  isDraft\n  isInMergeQueue\n  milestone {\n    ...MilestoneFields\n  }\n  author {\n    ...AuthorFields\n  }\n  comments(last: $lastComments) {\n    totalCount\n    nodes {\n      url\n      author {\n        ...AuthorFields\n      }\n    }\n  }\n  reviews(last: $lastReviews) {\n    totalCount\n    nodes {\n      ...PullRequestReviewFields\n    }\n  }\n  labels(first: $firstLabels) {\n    nodes {\n      name\n    }\n  }\n  closingIssuesReferences(first: $firstClosingIssues) {\n    nodes {\n      number\n    }\n  }\n}\n\nfragment PullRequestReviewFields on PullRequestReview {\n  state\n  author {\n    login\n  }\n}"): typeof import('./graphql').FetchPullRequestByNumberDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query FetchAuthenticatedUserDetails {\n  viewer {\n    id\n    name\n    login\n    avatarUrl\n  }\n}"): typeof import('./graphql').FetchAuthenticatedUserDetailsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
