import gql from 'graphql-tag';

export const QUERY_CHECK_MERGE_QUEUE_FOR_PR = gql`
  query checkMergeQueueForPR(
    $owner: String!
    $repository: String!
    $prNumber: Int!
  ) {
    repository(owner: $owner, name: $repository) {
      pullRequest(number: $prNumber) {
        mergeQueueEntry {
          state
          position
        }
      }
    }
  }
`;

const FRAGMENT_ISSUE_FIELDS = gql`
  fragment issueFields on Issue {
      number
      title
      url
      milestone {
          description
      }
      labels {
        nodes {
            name
        }
      }
      author {
        login
        type: __typename
        avatarUrl
        htmlUrl: url
      }
      state
      stateReason
      comments(last: 1) {
          totalCount
          nodes {
              createdAt
              author {
                  login
              }
          }
      }
    }
  `;

const FRAGMENT_PR_FIELDS = gql`
  fragment prFields on PullRequest {
      number
      title
      url
      milestone {
          description
      }
      labels {
        nodes {
            name
        }
      }
      author {
        login
        type: __typename
        avatarUrl
        htmlUrl: url
      }
      merged
      isDraft
      isInMergeQueue
      state
      comments(last: 1) {
          totalCount
          nodes {
              createdAt
              author {
                  login
              }
          }
      }
      reviews(last: 1) {
          totalCount
          nodes {
              createdAt
              author {
                  login
              }
          }
          
      }
  }
`;

export const QUERY_ISSUE_OR_PULL_REQUEST = gql`
  query fetchIssueOrPullRequest($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
          issueOrPullRequest(number: $number)  {
              __typename
              ... on PullRequest {
                  ...prFields
              }
              ... on Issue {
                  ...issueFields
              }
          }        
      }
  }

  ${FRAGMENT_ISSUE_FIELDS}
  ${FRAGMENT_PR_FIELDS}
`;
