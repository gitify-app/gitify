import {
  type FetchBatchMergedTemplateIndexedBaseVariables,
  type FetchBatchMergedTemplateNonIndexedVariables,
  MergeQueryBuilder,
} from './MergeQueryBuilder';

describe('renderer/utils/api/graphql/MergeQueryBuilder.ts', () => {
  const sharedVars: FetchBatchMergedTemplateNonIndexedVariables = {
    lastComments: 5,
    lastThreadedComments: 3,
    lastReplies: 2,
    lastReviews: 4,
    firstLabels: 10,
    firstClosingIssues: 8,
    includeIsAnswered: true,
  };

  const nodeVarsA: FetchBatchMergedTemplateIndexedBaseVariables = {
    owner: 'octocat',
    name: 'hello-world',
    number: 123,
    isDiscussionNotification: false,
    isIssueNotification: true,
    isPullRequestNotification: false,
  };

  const nodeVarsB: FetchBatchMergedTemplateIndexedBaseVariables = {
    owner: 'gitify-app',
    name: 'gitify',
    number: 456,
    isDiscussionNotification: true,
    isIssueNotification: false,
    isPullRequestNotification: true,
  };

  it('builds a query with one node and shared variables', () => {
    const builder = new MergeQueryBuilder().setSharedVariables(sharedVars);

    const alias = builder.addNode(nodeVarsA);
    expect(alias).toBe('node0');

    const query = builder.getGraphQLQuery();
    const vars = builder.getGraphQLVariables();

    // Variable definitions should include non-indexed and indexed 0
    expect(query).toContain('query FetchMergedNotifications(');
    expect(query).toContain('$lastComments: Int');
    expect(query).toContain('$lastThreadedComments: Int');
    expect(query).toContain('$lastReplies: Int');
    expect(query).toContain('$lastReviews: Int');
    expect(query).toContain('$firstLabels: Int');
    expect(query).toContain('$firstClosingIssues: Int');
    expect(query).toContain('$includeIsAnswered: Boolean!');

    expect(query).toContain('$owner0: String!');
    expect(query).toContain('$name0: String!');
    expect(query).toContain('$number0: Int!');
    expect(query).toContain('$isDiscussionNotification0: Boolean!');
    expect(query).toContain('$isIssueNotification0: Boolean!');
    expect(query).toContain('$isPullRequestNotification0: Boolean!');

    // Selection should be aliased and have indexed variables applied
    expect(query).toContain('node0: repository');
    expect(query).toContain('discussion(number: $number0)');
    expect(query).toContain('@include(if: $isDiscussionNotification0)');
    expect(query).toContain('issue(number: $number0)');
    expect(query).toContain('@include(if: $isIssueNotification0)');
    expect(query).toContain('pullRequest(number: $number0)');
    expect(query).toContain('@include(if: $isPullRequestNotification0)');

    // Fragments should be appended
    expect(query).toContain('fragment PullRequestDetails');
    expect(query).toContain('fragment IssueDetails');
    expect(query).toContain('fragment DiscussionDetails');

    // Variables should include both shared and indexed 0
    expect(vars).toMatchObject({
      lastComments: 5,
      lastThreadedComments: 3,
      lastReplies: 2,
      lastReviews: 4,
      firstLabels: 10,
      firstClosingIssues: 8,
      includeIsAnswered: true,
      owner0: 'octocat',
      name0: 'hello-world',
      number0: 123,
      isDiscussionNotification0: false,
      isIssueNotification0: true,
      isPullRequestNotification0: false,
    });
  });

  it('builds a query with multiple nodes and increments aliases/definitions', () => {
    const builder = new MergeQueryBuilder().setSharedVariables(sharedVars);

    builder.addNode(nodeVarsA);

    const alias1 = builder.addNode(nodeVarsB);
    expect(alias1).toBe('node1');

    const query = builder.getGraphQLQuery('CustomDoc');
    const vars = builder.getGraphQLVariables();

    // Custom document name
    expect(query).toContain('query CustomDoc(');

    // Both node aliases present
    expect(query).toContain('node0: repository');
    expect(query).toContain('node1: repository');

    // Indexed var definitions for both indices
    expect(query).toContain('$owner0: String!');
    expect(query).toContain('$owner1: String!');
    expect(query).toContain('$number0: Int!');
    expect(query).toContain('$number1: Int!');

    // Variables map contains both sets
    expect(vars).toMatchObject({
      owner0: 'octocat',
      name0: 'hello-world',
      number0: 123,
      isDiscussionNotification0: false,
      isIssueNotification0: true,
      isPullRequestNotification0: false,
      owner1: 'gitify-app',
      name1: 'gitify',
      number1: 456,
      isDiscussionNotification1: true,
      isIssueNotification1: false,
      isPullRequestNotification1: true,
    });
  });
});
