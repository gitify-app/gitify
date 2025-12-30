import {
  BatchMergedDetailsQueryFragmentDoc,
  IssueDetailsFragmentDoc,
  PullRequestDetailsFragmentDoc,
} from './generated/graphql';
import {
  aliasRootAndKeyVariables,
  composeMergedQuery,
  extractFragments,
  extractFragmentsAll,
  getQueryFragmentBody,
} from './utils';

describe('renderer/utils/api/graphql/utils.ts', () => {
  describe('getQueryFragmentBody', () => {
    it('should extract query fragment body from BatchMergedDetailsQueryFragmentDoc', () => {
      const body = getQueryFragmentBody(BatchMergedDetailsQueryFragmentDoc);

      expect(body).not.toBeNull();
      expect(body).toContain('repository');
      expect(body).toContain('$ownerINDEX');
      expect(body).toContain('$nameINDEX');
    });

    it('should return null for non-Query fragments', () => {
      // IssueDetailsFragmentDoc is a fragment on Issue, not Query
      const body = getQueryFragmentBody(IssueDetailsFragmentDoc);

      expect(body).toBeNull();
    });
  });

  describe('extractFragments', () => {
    it('should extract fragment definitions from IssueDetailsFragmentDoc', () => {
      const fragments = extractFragments(IssueDetailsFragmentDoc);

      expect(fragments.size).toBeGreaterThan(0);
      expect(fragments.has('IssueDetails')).toBe(true);
      // IssueDetails uses AuthorFields and MilestoneFields
      expect(fragments.has('AuthorFields')).toBe(true);
      expect(fragments.has('MilestoneFields')).toBe(true);
    });

    it('should extract fragment definitions from PullRequestDetailsFragmentDoc', () => {
      const fragments = extractFragments(PullRequestDetailsFragmentDoc);

      expect(fragments.size).toBeGreaterThan(0);
      expect(fragments.has('PullRequestDetails')).toBe(true);
      expect(fragments.has('PullRequestReviewFields')).toBe(true);
    });
  });

  describe('extractFragmentsAll', () => {
    it('should merge fragments from multiple documents without duplicates', () => {
      const fragments = extractFragmentsAll([
        IssueDetailsFragmentDoc,
        PullRequestDetailsFragmentDoc,
      ]);

      expect(fragments.has('IssueDetails')).toBe(true);
      expect(fragments.has('PullRequestDetails')).toBe(true);
      // Shared fragments should only appear once
      expect(fragments.has('AuthorFields')).toBe(true);
      expect(fragments.has('MilestoneFields')).toBe(true);
    });

    it('should handle empty array', () => {
      const fragments = extractFragmentsAll([]);

      expect(fragments.size).toBe(0);
    });
  });

  describe('composeMergedQuery', () => {
    it('should compose a valid merged query string', () => {
      const selections = [
        'node0: repository(owner: $owner0, name: $name0) { issue(number: $number0) { title } }',
        'node1: repository(owner: $owner1, name: $name1) { pullRequest(number: $number1) { title } }',
      ];
      const fragmentMap = new Map<string, string>();
      fragmentMap.set('TestFragment', 'fragment TestFragment on Issue { id }');
      const variableDefinitions = [
        '$owner0: String!',
        '$name0: String!',
        '$number0: Int!',
        '$owner1: String!',
        '$name1: String!',
        '$number1: Int!',
      ];

      const query = composeMergedQuery(
        selections,
        fragmentMap,
        variableDefinitions,
      );

      expect(query).toContain('query FetchMergedNotifications');
      expect(query).toContain('$owner0: String!');
      expect(query).toContain('node0: repository');
      expect(query).toContain('node1: repository');
      expect(query).toContain('fragment TestFragment on Issue');
    });

    it('should handle empty fragments map', () => {
      const selections = ['node0: repository { id }'];
      const fragmentMap = new Map<string, string>();
      const variableDefinitions = ['$id: ID!'];

      const query = composeMergedQuery(
        selections,
        fragmentMap,
        variableDefinitions,
      );

      expect(query).toContain('query FetchMergedNotifications($id: ID!)');
      expect(query).toContain('node0: repository { id }');
    });
  });

  describe('aliasRootAndKeyVariables', () => {
    it('should add alias and index suffix to variables', () => {
      const input =
        'repository(owner: $owner, name: $name) { issue(number: $number) { title } }';

      const result = aliasRootAndKeyVariables(input, 0);

      expect(result).toContain('node0: repository');
      expect(result).toContain('$owner0');
      expect(result).toContain('$name0');
      expect(result).toContain('$number0');
    });

    it('should handle boolean condition variables', () => {
      const input =
        'repository(owner: $owner, name: $name) { issue(number: $number) @include(if: $isIssueNotification) { title } }';

      const result = aliasRootAndKeyVariables(input, 1);

      expect(result).toContain('node1: repository');
      expect(result).toContain('$owner1');
      expect(result).toContain('$isIssueNotification1');
    });

    it('should handle all notification type condition variables', () => {
      const input =
        'repository(owner: $owner, name: $name) { discussion @include(if: $isDiscussionNotification) { id } issue @include(if: $isIssueNotification) { id } pullRequest @include(if: $isPullRequestNotification) { id } }';

      const result = aliasRootAndKeyVariables(input, 2);

      expect(result).toContain('$isDiscussionNotification2');
      expect(result).toContain('$isIssueNotification2');
      expect(result).toContain('$isPullRequestNotification2');
    });

    it('should work with string index', () => {
      const input = 'repository(owner: $owner, name: $name) { id }';

      const result = aliasRootAndKeyVariables(input, '5');

      expect(result).toContain('node5: repository');
      expect(result).toContain('$owner5');
      expect(result).toContain('$name5');
    });

    it('should not modify non-key variables', () => {
      const input =
        'repository(owner: $owner) { issues(first: $firstLabels) { nodes { title } } }';

      const result = aliasRootAndKeyVariables(input, 0);

      expect(result).toContain('$owner0');
      // $firstLabels should remain unchanged (not a key variable)
      expect(result).toContain('$firstLabels');
      expect(result).not.toContain('$firstLabels0');
    });
  });
});
