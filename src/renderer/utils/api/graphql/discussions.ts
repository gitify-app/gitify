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

export const FetchDiscussion = graphql(`
  query fetchDiscussionByNumber(
    $owner: String!
    $name: String!
    $number: Int!
    $lastComments: Int
    $lastReplies: Int
    $firstLabels: Int
    $includeIsAnswered: Boolean!
  ) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        __typename
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
            ...CommentFields
            replies(last: $lastReplies) {
              nodes {
                ...CommentFields
              }
            }
          }
        }
        labels(first: $firstLabels) {
          nodes {
            name
          }
        }
      }
    }
  }
`);
