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
    $queryStatement: String!,
    $firstDiscussions: Int,
    $lastComments: Int,
    $firstReplies: Int
  ) {
    search(query:$queryStatement, type: DISCUSSION, first: $firstDiscussions) {
      nodes {
        ... on Discussion {
          viewerSubscription
          title
          stateReason
          isAnswered
          url
          author {
            ...AuthorFields
          }
          comments(last: $lastComments){
            nodes {
              ...CommentFields
              replies(last: $firstReplies) {
                nodes {
                  ...CommentFields
                }
              }
            }
          }
        }
      }
    }
  }

  ${FRAGMENT_AUTHOR}
  ${FRAGMENT_COMMENTS}
`;
