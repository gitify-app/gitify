import { graphql } from './generated/gql';

export const AuthorFieldsFragment = graphql(`
  fragment AuthorFields on Actor {
    login
    url
    avatar_url: avatarUrl
    type: __typename
  }
`);

export const CommentFieldsFragment = graphql(`
  fragment CommentFields on DiscussionComment {
    databaseId
    createdAt
    author {
      ...AuthorFields
    }
  }
`);

export const DiscussionCommentFragment = graphql(`
  fragment DiscussionCommentFields on DiscussionComment {
    ...CommentFields
    replies(last: $lastReplies) {
      nodes {
        ...CommentFields
      }
    }
  }`);

export const DiscussionFieldsFragment = graphql(`
  fragment DiscussionFields on Discussion {
    number
    title
    stateReason
    isAnswered @include(if: $includeIsAnswered)
    url
    author {
      ...AuthorFields
    }
    comments(last: $lastComments) {
      totalCount
      nodes {
        ...DiscussionCommentFields
      }
    }
    labels(first: $firstLabels) {
      nodes {
        name
      }
    }
  }
`);

export const FetchDiscussions = graphql(`
  query fetchDiscussions(
    $queryStatement: String!
    $firstDiscussions: Int
    $lastComments: Int
    $lastReplies: Int
    $firstLabels: Int
    $includeIsAnswered: Boolean!
  ) {
    search(query: $queryStatement, type: DISCUSSION, first: $firstDiscussions) {
      nodes {
        ... on Discussion {
          ...DiscussionFields
        }
      }
    }
  }
`);
