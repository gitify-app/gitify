import {
  BatchMergedDetailsQueryTemplateFragmentDoc,
  FetchBatchMergedTemplateDocument,
  IssueDetailsFragmentDoc,
} from './generated/graphql';
import {
  aliasNodeAndRenameQueryVariables,
  extractIndexedVariableDefinitions,
  extractNonIndexedVariableDefinitions,
  extractNonQueryFragments,
  extractQueryFragments,
} from './utils';

describe('renderer/utils/api/graphql/utils.ts', () => {
  describe('getQueryFragmentBody', () => {
    it('should extract query fragments from operation document', () => {
      const fragments = extractQueryFragments(FetchBatchMergedTemplateDocument);

      expect(fragments).not.toBeNull();
      expect(fragments.length).toBe(1);
      expect(fragments[0].typeCondition).toEqual('Query');
      expect(fragments[0].inner).toContain('repository');
      expect(fragments[0].inner).toContain('$ownerINDEX');
      expect(fragments[0].inner).toContain('$nameINDEX');
    });

    it('should extract query fragments from fragment document', () => {
      const fragments = extractQueryFragments(
        BatchMergedDetailsQueryTemplateFragmentDoc,
      );

      expect(fragments).not.toBeNull();
      expect(fragments.length).toBe(1);
      expect(fragments[0].typeCondition).toEqual('Query');
      expect(fragments[0].inner).toContain('repository');
      expect(fragments[0].inner).toContain('$ownerINDEX');
      expect(fragments[0].inner).toContain('$nameINDEX');
    });

    it('should return null for non-query fragments', () => {
      // IssueDetailsFragmentDoc is a graphql document that does not have a query fragment
      const fragments = extractQueryFragments(IssueDetailsFragmentDoc);
      expect(fragments).toEqual([]);
    });
  });

  describe('extractNonQueryFragments', () => {
    it('should extract non-query fragments from FetchBatchMergedTemplateDocument', () => {
      const fragments = extractNonQueryFragments(
        FetchBatchMergedTemplateDocument,
      );

      expect(fragments).not.toBeNull();
      expect(fragments.length).toBe(8);
      expect(fragments.flatMap((f) => f.typeCondition)).toEqual([
        'Actor',
        'Milestone',
        'Discussion',
        'DiscussionComment',
        'DiscussionComment',
        'Issue',
        'PullRequest',
        'PullRequestReview',
      ]);
    });

    it('should extract non-query fragments from FetchBatchMergedTemplateDocument', () => {
      const fragments = extractNonQueryFragments(
        FetchBatchMergedTemplateDocument,
      );

      expect(fragments).not.toBeNull();
      expect(fragments.length).toBe(8);
      expect(fragments.flatMap((f) => f.typeCondition)).toEqual([
        'Actor',
        'Milestone',
        'Discussion',
        'DiscussionComment',
        'DiscussionComment',
        'Issue',
        'PullRequest',
        'PullRequestReview',
      ]);
    });
  });

  describe('extractIndexedVariableDefinitions', () => {
    it('should extract indexed variable definitions from BatchMergedDetailsQueryTemplateFragmentDoc', () => {
      const varDefs = extractIndexedVariableDefinitions(
        FetchBatchMergedTemplateDocument,
      );

      expect(varDefs).not.toBeNull();
      expect(varDefs.length).toBe(6);
      expect(varDefs.flatMap((v) => v.name)).toEqual([
        'ownerINDEX',
        'nameINDEX',
        'numberINDEX',
        'isDiscussionNotificationINDEX',
        'isIssueNotificationINDEX',
        'isPullRequestNotificationINDEX',
      ]);
    });
  });

  describe('extractNonIndexedVariableDefinitions', () => {
    it('should extract non-indexed variable definitions from extractNonIndexedVariableDefinitions', () => {
      const varDefs = extractNonIndexedVariableDefinitions(
        FetchBatchMergedTemplateDocument,
      );

      expect(varDefs).not.toBeNull();
      expect(varDefs.length).toBe(7);
      expect(varDefs.flatMap((v) => v.name)).toEqual([
        'lastComments',
        'lastThreadedComments',
        'lastReplies',
        'lastReviews',
        'firstLabels',
        'firstClosingIssues',
        'includeIsAnswered',
      ]);
    });
  });

  describe('aliasNodeAndRenameQueryVariables', () => {
    it('should add alias, rename indexed vars and leave non-indexed vars unchanged', () => {
      const input =
        'repository(owner: $ownerINDEX, name: $name) { issue(number: $number) @include(if: $isIssueNotificationINDEX) { title } }';

      const result = aliasNodeAndRenameQueryVariables('node', 0, input);

      expect(result).toContain('node0: repository');
      expect(result).toContain('$owner0');
      expect(result).not.toContain('$ownerINDEX');
      expect(result).toContain('$name');
      expect(result).not.toContain('$name0');
      expect(result).toContain('$number');
      expect(result).not.toContain('$number0');
      expect(result).toContain('$isIssueNotification0');
      expect(result).not.toContain('$isIssueNotificationINDEX');
    });
  });
});
