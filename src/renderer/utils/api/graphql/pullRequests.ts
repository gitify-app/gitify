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
