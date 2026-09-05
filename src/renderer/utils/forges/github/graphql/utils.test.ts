import {
  FetchIssueByNumberDocument,
  FetchMergedDetailsTemplateDocument,
  FetchPullRequestByNumberDocument,
  IssueDetailsFragmentDoc,
  MergedDetailsQueryTemplateFragmentDoc,
} from './generated/graphql';
import {
  aliasFieldAndSubstituteIndexedVars,
  extractIndexedVariableDefinitions,
  extractNonIndexedVariableDefinitions,
  extractNonQueryFragments,
  extractQueryFragments,
  stripGatedSelections,
} from './utils';

describe('renderer/utils/forges/github/graphql/utils.ts', () => {
  describe('getQueryFragmentBody', () => {
    it('should extract query fragments from operation document', () => {
      const fragments = extractQueryFragments(FetchMergedDetailsTemplateDocument as any);

      expect(fragments).not.toBeNull();
      expect(fragments.length).toBe(1);
      expect(fragments[0].typeCondition).toEqual('Query');
      expect(fragments[0].inner).toContain('repository');
      expect(fragments[0].inner).toContain('$ownerINDEX');
      expect(fragments[0].inner).toContain('$nameINDEX');
    });

    it('should extract query fragments from fragment document', () => {
      const fragments = extractQueryFragments(MergedDetailsQueryTemplateFragmentDoc as any);

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
      const fragments = extractNonQueryFragments(FetchMergedDetailsTemplateDocument as any);

      expect(fragments).not.toBeNull();
      expect(fragments.length).toBe(11);
      expect(fragments.flatMap((f) => f.typeCondition).toSorted()).toEqual([
        'Actor',
        'Discussion',
        'DiscussionComment',
        'DiscussionComment',
        'Issue',
        'Label',
        'Milestone',
        'PullRequest',
        'PullRequestReview',
        'PullRequestReviewThreadConnection',
        'ReactionGroup',
      ]);
    });
  });

  describe('extractIndexedVariableDefinitions', () => {
    it('should extract indexed variable definitions from BatchMergedDetailsQueryTemplateFragmentDoc', () => {
      const varDefs = extractIndexedVariableDefinitions(FetchMergedDetailsTemplateDocument as any);

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
        FetchMergedDetailsTemplateDocument as any,
      );

      expect(varDefs).not.toBeNull();
      expect(varDefs.length).toBe(7);
      expect(varDefs.flatMap((v) => v.name)).toEqual([
        'lastComments',
        'lastThreadedComments',
        'lastReplies',
        'lastReviews',
        'firstReviewThreads',
        'firstLabels',
        'firstClosingIssues',
      ]);
    });
  });

  describe('aliasNodeAndRenameQueryVariables', () => {
    it('should add alias, rename indexed vars and leave non-indexed vars unchanged', () => {
      const input =
        'repository(owner: $ownerINDEX, name: $name) { issue(number: $number) @include(if: $isIssueNotificationINDEX) { title } }';

      const result = aliasFieldAndSubstituteIndexedVars('someAlias', 0, input);

      expect(result).toContain('someAlias: repository');
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

  describe('stripGatedSelections', () => {
    const allCapabilities = {
      stackedPullRequests: true,
      answeredDiscussion: true,
      subIssues: true,
    };

    it('strips @gated directives but keeps gated fields when supported', () => {
      const result = stripGatedSelections(
        FetchPullRequestByNumberDocument.toString(),
        allCapabilities,
      );

      expect(result).not.toContain('@gated');
      expect(result).not.toContain('gated');
      expect(result).toContain('stackEntry');
      expect(result).toContain('query FetchPullRequestByNumber');
    });

    it('removes gated fields when their capability is unsupported', () => {
      const result = stripGatedSelections(FetchPullRequestByNumberDocument.toString(), {
        ...allCapabilities,
        stackedPullRequests: false,
      });

      expect(result).not.toContain('stackEntry');
      expect(result).not.toContain('@gated');
      expect(result).toContain('query FetchPullRequestByNumber');
      expect(result).toContain('repository');
    });

    it('strips @gated directives and keeps sub-issue fields on FetchIssueByNumberDocument when supported', () => {
      const result = stripGatedSelections(FetchIssueByNumberDocument.toString(), allCapabilities);

      expect(result).not.toContain('@gated');
      expect(result).toContain('parent');
      expect(result).toContain('subIssuesSummary');
      expect(result).toContain('query FetchIssueByNumber');
    });

    it('removes sub-issue fields from FetchIssueByNumberDocument when unsupported', () => {
      const result = stripGatedSelections(FetchIssueByNumberDocument.toString(), {
        ...allCapabilities,
        subIssues: false,
      });

      expect(result).not.toContain('parent');
      expect(result).not.toContain('subIssuesSummary');
      expect(result).not.toContain('@gated');
      expect(result).toContain('query FetchIssueByNumber');
      expect(result).toContain('IssueDetails');
    });

    it('strips @gated directives from the merged template when supported', () => {
      const result = stripGatedSelections(
        FetchMergedDetailsTemplateDocument.toString(),
        allCapabilities,
      );

      expect(result).not.toContain('@gated');
      expect(result).toContain('stackEntry');
      expect(result).toContain('isAnswered');
      expect(result).toContain('parent');
      expect(result).toContain('subIssuesSummary');
      expect(result).toContain('query FetchMergedDetailsTemplate');
    });

    it('removes gated fields from the merged template when unsupported', () => {
      const result = stripGatedSelections(FetchMergedDetailsTemplateDocument.toString(), {
        stackedPullRequests: false,
        answeredDiscussion: false,
        subIssues: false,
      });

      expect(result).not.toContain('stackEntry');
      expect(result).not.toContain('isAnswered');
      expect(result).not.toContain('parent');
      expect(result).not.toContain('subIssuesSummary');
      expect(result).not.toContain('@gated');
      expect(result).toContain('query FetchMergedDetailsTemplate');
      expect(result).toContain('PullRequestDetails');
    });
  });
});
