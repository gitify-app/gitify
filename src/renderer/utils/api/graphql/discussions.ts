import gql from 'graphql-tag';

const FRAGMENT_AUTHOR = gql`
  fragment AuthorFields on Actor {
    login
    url
    avatar_url: avatarUrl
    type: __typename
  }
`;

const FRAGMENT_COMMENTS = gql`
  fragment CommentFields on DiscussionComment {
    databaseId
    createdAt
    author {
      ...AuthorFields
    }
  }

  ${FRAGMENT_AUTHOR}
`;

export const QUERY_SEARCH_DISCUSSIONS = gql`
  query fetchDiscussions(
    $queryStatement: String!
    $firstDiscussions: Int
    $lastComments: Int
    $lastReplies: Int
    $includeIsAnswered: Boolean!
  ) {
    search(query: $queryStatement, type: DISCUSSION, first: $firstDiscussions) {
      nodes {
        ... on Discussion {
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
          labels {
            nodes {
              name
            }
          }
        }
      }
    }
  }

  ${FRAGMENT_AUTHOR}
  ${FRAGMENT_COMMENTS}
`;
