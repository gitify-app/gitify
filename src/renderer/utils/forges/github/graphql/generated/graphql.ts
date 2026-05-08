/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { Link } from '../../../../../types';
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** The possible state reasons of a discussion. */
export type DiscussionStateReason =
  /** The discussion is a duplicate of another */
  | 'DUPLICATE'
  /** The discussion is no longer relevant */
  | 'OUTDATED'
  /** The discussion was reopened */
  | 'REOPENED'
  /** The discussion has been resolved */
  | 'RESOLVED';

/** The possible states of an issue. */
export type IssueState =
  /** An issue that has been closed */
  | 'CLOSED'
  /** An issue that is still open */
  | 'OPEN';

/** The possible state reasons of an issue. */
export type IssueStateReason =
  /** An issue that has been closed as completed */
  | 'COMPLETED'
  /** An issue that has been closed as a duplicate. */
  | 'DUPLICATE'
  /** An issue that has been closed as not planned */
  | 'NOT_PLANNED'
  /** An issue that has been reopened */
  | 'REOPENED';

/** The possible states of a milestone. */
export type MilestoneState =
  /** A milestone that has been closed. */
  | 'CLOSED'
  /** A milestone that is still open. */
  | 'OPEN';

/** The possible states of a pull request review. */
export type PullRequestReviewState =
  /** A review allowing the pull request to merge. */
  | 'APPROVED'
  /** A review blocking the pull request from merging. */
  | 'CHANGES_REQUESTED'
  /** An informational review. */
  | 'COMMENTED'
  /** A review that has been dismissed. */
  | 'DISMISSED'
  /** A review that has not yet been submitted. */
  | 'PENDING';

/** The possible states of a pull request. */
export type PullRequestState =
  /** A pull request that has been closed without being merged. */
  | 'CLOSED'
  /** A pull request that has been closed by being merged. */
  | 'MERGED'
  /** A pull request that is still open. */
  | 'OPEN';

/** Emojis that can be attached to Issues, Pull Requests and Comments. */
export type ReactionContent =
  /** Represents the `:confused:` emoji. */
  | 'CONFUSED'
  /** Represents the `:eyes:` emoji. */
  | 'EYES'
  /** Represents the `:heart:` emoji. */
  | 'HEART'
  /** Represents the `:hooray:` emoji. */
  | 'HOORAY'
  /** Represents the `:laugh:` emoji. */
  | 'LAUGH'
  /** Represents the `:rocket:` emoji. */
  | 'ROCKET'
  /** Represents the `:-1:` emoji. */
  | 'THUMBS_DOWN'
  /** Represents the `:+1:` emoji. */
  | 'THUMBS_UP';

type AuthorFields_Bot_Fragment = { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' };

type AuthorFields_EnterpriseUserAccount_Fragment = { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' };

type AuthorFields_Mannequin_Fragment = { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' };

type AuthorFields_Organization_Fragment = { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' };

type AuthorFields_User_Fragment = { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' };

export type AuthorFieldsFragment =
  | AuthorFields_Bot_Fragment
  | AuthorFields_EnterpriseUserAccount_Fragment
  | AuthorFields_Mannequin_Fragment
  | AuthorFields_Organization_Fragment
  | AuthorFields_User_Fragment
;

export type MilestoneFieldsFragment = { state: MilestoneState, title: string };

export type ReactionGroupFieldsFragment = { content: ReactionContent, reactors: { totalCount: number } };

export type LabelFieldsFragment = { name: string, color: string };

export type FetchDiscussionByNumberQueryVariables = Exact<{
  owner: string;
  name: string;
  number: number;
  lastThreadedComments?: number | null | undefined;
  lastReplies?: number | null | undefined;
  firstLabels?: number | null | undefined;
  includeIsAnswered: boolean;
}>;


export type FetchDiscussionByNumberQuery = { repository: { discussion: { __typename: 'Discussion', number: number, title: string, stateReason: DiscussionStateReason | null, isAnswered?: boolean | null, url: Link, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, replies: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, author:
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
               | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null } | null };

export type DiscussionDetailsFragment = { __typename: 'Discussion', number: number, title: string, stateReason: DiscussionStateReason | null, isAnswered?: boolean | null, url: Link, author:
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
   | null, comments: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, replies: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null };

export type CommentFieldsFragment = { createdAt: string, url: Link, author:
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
   | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null };

export type DiscussionCommentFieldsFragment = { createdAt: string, url: Link, replies: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, author:
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
   | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null };

export type FetchIssueByNumberQueryVariables = Exact<{
  owner: string;
  name: string;
  number: number;
  lastComments?: number | null | undefined;
  firstLabels?: number | null | undefined;
}>;


export type FetchIssueByNumberQuery = { repository: { issue: { __typename: 'Issue', number: number, title: string, url: Link, state: IssueState, stateReason: IssueStateReason | null, milestone: { state: MilestoneState, title: string } | null, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null } | null };

export type IssueDetailsFragment = { __typename: 'Issue', number: number, title: string, url: Link, state: IssueState, stateReason: IssueStateReason | null, milestone: { state: MilestoneState, title: string } | null, author:
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
   | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null };

export type FetchMergedDetailsTemplateQueryVariables = Exact<{
  ownerINDEX: string;
  nameINDEX: string;
  numberINDEX: number;
  isDiscussionNotificationINDEX: boolean;
  isIssueNotificationINDEX: boolean;
  isPullRequestNotificationINDEX: boolean;
  lastComments?: number | null | undefined;
  lastThreadedComments?: number | null | undefined;
  lastReplies?: number | null | undefined;
  lastReviews?: number | null | undefined;
  firstLabels?: number | null | undefined;
  firstClosingIssues?: number | null | undefined;
  includeIsAnswered: boolean;
}>;


export type FetchMergedDetailsTemplateQuery = { repository: { discussion?: { __typename: 'Discussion', number: number, title: string, stateReason: DiscussionStateReason | null, isAnswered?: boolean | null, url: Link, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, replies: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, author:
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
               | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null, issue?: { __typename: 'Issue', number: number, title: string, url: Link, state: IssueState, stateReason: IssueStateReason | null, milestone: { state: MilestoneState, title: string } | null, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null, pullRequest?: { __typename: 'PullRequest', number: number, title: string, url: Link, state: PullRequestState, merged: boolean, isDraft: boolean, isInMergeQueue: boolean, milestone: { state: MilestoneState, title: string } | null, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, reviews: { totalCount: number, nodes: Array<{ state: PullRequestReviewState, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, closingIssuesReferences: { nodes: Array<{ number: number } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null } | null };

export type MergedDetailsQueryTemplateFragment = { repository: { discussion?: { __typename: 'Discussion', number: number, title: string, stateReason: DiscussionStateReason | null, isAnswered?: boolean | null, url: Link, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, replies: { totalCount: number, nodes: Array<{ createdAt: string, url: Link, author:
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
                | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
               | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null, issue?: { __typename: 'Issue', number: number, title: string, url: Link, state: IssueState, stateReason: IssueStateReason | null, milestone: { state: MilestoneState, title: string } | null, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null, pullRequest?: { __typename: 'PullRequest', number: number, title: string, url: Link, state: PullRequestState, merged: boolean, isDraft: boolean, isInMergeQueue: boolean, milestone: { state: MilestoneState, title: string } | null, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, reviews: { totalCount: number, nodes: Array<{ state: PullRequestReviewState, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, closingIssuesReferences: { nodes: Array<{ number: number } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null } | null };

export type FetchPullRequestByNumberQueryVariables = Exact<{
  owner: string;
  name: string;
  number: number;
  firstLabels?: number | null | undefined;
  lastComments?: number | null | undefined;
  lastReviews?: number | null | undefined;
  firstClosingIssues?: number | null | undefined;
}>;


export type FetchPullRequestByNumberQuery = { repository: { pullRequest: { __typename: 'PullRequest', number: number, title: string, url: Link, state: PullRequestState, merged: boolean, isDraft: boolean, isInMergeQueue: boolean, milestone: { state: MilestoneState, title: string } | null, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
            | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
           | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, reviews: { totalCount: number, nodes: Array<{ state: PullRequestReviewState, author:
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
            | { login: string }
           | null } | null> | null } | null, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, closingIssuesReferences: { nodes: Array<{ number: number } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null } | null };

export type PullRequestDetailsFragment = { __typename: 'PullRequest', number: number, title: string, url: Link, state: PullRequestState, merged: boolean, isDraft: boolean, isInMergeQueue: boolean, milestone: { state: MilestoneState, title: string } | null, author:
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
    | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
   | null, comments: { totalCount: number, nodes: Array<{ url: Link, author:
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Bot' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'EnterpriseUserAccount' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Mannequin' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'Organization' }
        | { login: string, htmlUrl: Link, avatarUrl: Link, type: 'User' }
       | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null } | null> | null }, reviews: { totalCount: number, nodes: Array<{ state: PullRequestReviewState, author:
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
        | { login: string }
       | null } | null> | null } | null, labels: { nodes: Array<{ name: string, color: string } | null> | null } | null, closingIssuesReferences: { nodes: Array<{ number: number } | null> | null } | null, reactions: { totalCount: number }, reactionGroups: Array<{ content: ReactionContent, reactors: { totalCount: number } }> | null };

export type PullRequestReviewFieldsFragment = { state: PullRequestReviewState, author:
    | { login: string }
    | { login: string }
    | { login: string }
    | { login: string }
    | { login: string }
   | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const AuthorFieldsFragmentDoc = new TypedDocumentString(`
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
    `, {"fragmentName":"AuthorFields"}) as unknown as TypedDocumentString<AuthorFieldsFragment, unknown>;
export const ReactionGroupFieldsFragmentDoc = new TypedDocumentString(`
    fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
    `, {"fragmentName":"ReactionGroupFields"}) as unknown as TypedDocumentString<ReactionGroupFieldsFragment, unknown>;
export const CommentFieldsFragmentDoc = new TypedDocumentString(`
    fragment CommentFields on DiscussionComment {
  createdAt
  author {
    ...AuthorFields
  }
  url
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}`, {"fragmentName":"CommentFields"}) as unknown as TypedDocumentString<CommentFieldsFragment, unknown>;
export const DiscussionCommentFieldsFragmentDoc = new TypedDocumentString(`
    fragment DiscussionCommentFields on DiscussionComment {
  ...CommentFields
  replies(last: $lastReplies) {
    totalCount
    nodes {
      ...CommentFields
    }
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment CommentFields on DiscussionComment {
  createdAt
  author {
    ...AuthorFields
  }
  url
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}`, {"fragmentName":"DiscussionCommentFields"}) as unknown as TypedDocumentString<DiscussionCommentFieldsFragment, unknown>;
export const LabelFieldsFragmentDoc = new TypedDocumentString(`
    fragment LabelFields on Label {
  name
  color
}
    `, {"fragmentName":"LabelFields"}) as unknown as TypedDocumentString<LabelFieldsFragment, unknown>;
export const DiscussionDetailsFragmentDoc = new TypedDocumentString(`
    fragment DiscussionDetails on Discussion {
  __typename
  number
  title
  stateReason
  isAnswered @include(if: $includeIsAnswered)
  url
  author {
    ...AuthorFields
  }
  comments(last: $lastThreadedComments) {
    totalCount
    nodes {
      ...DiscussionCommentFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment CommentFields on DiscussionComment {
  createdAt
  author {
    ...AuthorFields
  }
  url
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment DiscussionCommentFields on DiscussionComment {
  ...CommentFields
  replies(last: $lastReplies) {
    totalCount
    nodes {
      ...CommentFields
    }
  }
}`, {"fragmentName":"DiscussionDetails"}) as unknown as TypedDocumentString<DiscussionDetailsFragment, unknown>;
export const MilestoneFieldsFragmentDoc = new TypedDocumentString(`
    fragment MilestoneFields on Milestone {
  state
  title
}
    `, {"fragmentName":"MilestoneFields"}) as unknown as TypedDocumentString<MilestoneFieldsFragment, unknown>;
export const IssueDetailsFragmentDoc = new TypedDocumentString(`
    fragment IssueDetails on Issue {
  __typename
  number
  title
  url
  state
  stateReason
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment MilestoneFields on Milestone {
  state
  title
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}`, {"fragmentName":"IssueDetails"}) as unknown as TypedDocumentString<IssueDetailsFragment, unknown>;
export const PullRequestReviewFieldsFragmentDoc = new TypedDocumentString(`
    fragment PullRequestReviewFields on PullRequestReview {
  state
  author {
    login
  }
}
    `, {"fragmentName":"PullRequestReviewFields"}) as unknown as TypedDocumentString<PullRequestReviewFieldsFragment, unknown>;
export const PullRequestDetailsFragmentDoc = new TypedDocumentString(`
    fragment PullRequestDetails on PullRequest {
  __typename
  number
  title
  url
  state
  merged
  isDraft
  isInMergeQueue
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  reviews(last: $lastReviews) {
    totalCount
    nodes {
      ...PullRequestReviewFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  closingIssuesReferences(first: $firstClosingIssues) {
    nodes {
      number
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment MilestoneFields on Milestone {
  state
  title
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment PullRequestReviewFields on PullRequestReview {
  state
  author {
    login
  }
}`, {"fragmentName":"PullRequestDetails"}) as unknown as TypedDocumentString<PullRequestDetailsFragment, unknown>;
export const MergedDetailsQueryTemplateFragmentDoc = new TypedDocumentString(`
    fragment MergedDetailsQueryTemplate on Query {
  repository(owner: $ownerINDEX, name: $nameINDEX) {
    discussion(number: $numberINDEX) @include(if: $isDiscussionNotificationINDEX) {
      ...DiscussionDetails
    }
    issue(number: $numberINDEX) @include(if: $isIssueNotificationINDEX) {
      ...IssueDetails
    }
    pullRequest(number: $numberINDEX) @include(if: $isPullRequestNotificationINDEX) {
      ...PullRequestDetails
    }
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment MilestoneFields on Milestone {
  state
  title
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment DiscussionDetails on Discussion {
  __typename
  number
  title
  stateReason
  isAnswered @include(if: $includeIsAnswered)
  url
  author {
    ...AuthorFields
  }
  comments(last: $lastThreadedComments) {
    totalCount
    nodes {
      ...DiscussionCommentFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment CommentFields on DiscussionComment {
  createdAt
  author {
    ...AuthorFields
  }
  url
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment DiscussionCommentFields on DiscussionComment {
  ...CommentFields
  replies(last: $lastReplies) {
    totalCount
    nodes {
      ...CommentFields
    }
  }
}
fragment IssueDetails on Issue {
  __typename
  number
  title
  url
  state
  stateReason
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment PullRequestDetails on PullRequest {
  __typename
  number
  title
  url
  state
  merged
  isDraft
  isInMergeQueue
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  reviews(last: $lastReviews) {
    totalCount
    nodes {
      ...PullRequestReviewFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  closingIssuesReferences(first: $firstClosingIssues) {
    nodes {
      number
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment PullRequestReviewFields on PullRequestReview {
  state
  author {
    login
  }
}`, {"fragmentName":"MergedDetailsQueryTemplate"}) as unknown as TypedDocumentString<MergedDetailsQueryTemplateFragment, unknown>;
export const FetchDiscussionByNumberDocument = new TypedDocumentString(`
    query FetchDiscussionByNumber($owner: String!, $name: String!, $number: Int!, $lastThreadedComments: Int, $lastReplies: Int, $firstLabels: Int, $includeIsAnswered: Boolean!) {
  repository(owner: $owner, name: $name) {
    discussion(number: $number) {
      ...DiscussionDetails
    }
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment DiscussionDetails on Discussion {
  __typename
  number
  title
  stateReason
  isAnswered @include(if: $includeIsAnswered)
  url
  author {
    ...AuthorFields
  }
  comments(last: $lastThreadedComments) {
    totalCount
    nodes {
      ...DiscussionCommentFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment CommentFields on DiscussionComment {
  createdAt
  author {
    ...AuthorFields
  }
  url
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment DiscussionCommentFields on DiscussionComment {
  ...CommentFields
  replies(last: $lastReplies) {
    totalCount
    nodes {
      ...CommentFields
    }
  }
}`) as unknown as TypedDocumentString<FetchDiscussionByNumberQuery, FetchDiscussionByNumberQueryVariables>;
export const FetchIssueByNumberDocument = new TypedDocumentString(`
    query FetchIssueByNumber($owner: String!, $name: String!, $number: Int!, $lastComments: Int, $firstLabels: Int) {
  repository(owner: $owner, name: $name) {
    issue(number: $number) {
      ...IssueDetails
    }
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment MilestoneFields on Milestone {
  state
  title
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment IssueDetails on Issue {
  __typename
  number
  title
  url
  state
  stateReason
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}`) as unknown as TypedDocumentString<FetchIssueByNumberQuery, FetchIssueByNumberQueryVariables>;
export const FetchMergedDetailsTemplateDocument = new TypedDocumentString(`
    query FetchMergedDetailsTemplate($ownerINDEX: String!, $nameINDEX: String!, $numberINDEX: Int!, $isDiscussionNotificationINDEX: Boolean!, $isIssueNotificationINDEX: Boolean!, $isPullRequestNotificationINDEX: Boolean!, $lastComments: Int, $lastThreadedComments: Int, $lastReplies: Int, $lastReviews: Int, $firstLabels: Int, $firstClosingIssues: Int, $includeIsAnswered: Boolean!) {
  ...MergedDetailsQueryTemplate
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment MilestoneFields on Milestone {
  state
  title
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment DiscussionDetails on Discussion {
  __typename
  number
  title
  stateReason
  isAnswered @include(if: $includeIsAnswered)
  url
  author {
    ...AuthorFields
  }
  comments(last: $lastThreadedComments) {
    totalCount
    nodes {
      ...DiscussionCommentFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment CommentFields on DiscussionComment {
  createdAt
  author {
    ...AuthorFields
  }
  url
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment DiscussionCommentFields on DiscussionComment {
  ...CommentFields
  replies(last: $lastReplies) {
    totalCount
    nodes {
      ...CommentFields
    }
  }
}
fragment IssueDetails on Issue {
  __typename
  number
  title
  url
  state
  stateReason
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment MergedDetailsQueryTemplate on Query {
  repository(owner: $ownerINDEX, name: $nameINDEX) {
    discussion(number: $numberINDEX) @include(if: $isDiscussionNotificationINDEX) {
      ...DiscussionDetails
    }
    issue(number: $numberINDEX) @include(if: $isIssueNotificationINDEX) {
      ...IssueDetails
    }
    pullRequest(number: $numberINDEX) @include(if: $isPullRequestNotificationINDEX) {
      ...PullRequestDetails
    }
  }
}
fragment PullRequestDetails on PullRequest {
  __typename
  number
  title
  url
  state
  merged
  isDraft
  isInMergeQueue
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  reviews(last: $lastReviews) {
    totalCount
    nodes {
      ...PullRequestReviewFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  closingIssuesReferences(first: $firstClosingIssues) {
    nodes {
      number
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment PullRequestReviewFields on PullRequestReview {
  state
  author {
    login
  }
}`) as unknown as TypedDocumentString<FetchMergedDetailsTemplateQuery, FetchMergedDetailsTemplateQueryVariables>;
export const FetchPullRequestByNumberDocument = new TypedDocumentString(`
    query FetchPullRequestByNumber($owner: String!, $name: String!, $number: Int!, $firstLabels: Int, $lastComments: Int, $lastReviews: Int, $firstClosingIssues: Int) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      ...PullRequestDetails
    }
  }
}
    fragment AuthorFields on Actor {
  login
  htmlUrl: url
  avatarUrl: avatarUrl
  type: __typename
}
fragment MilestoneFields on Milestone {
  state
  title
}
fragment ReactionGroupFields on ReactionGroup {
  content
  reactors {
    totalCount
  }
}
fragment LabelFields on Label {
  name
  color
}
fragment PullRequestDetails on PullRequest {
  __typename
  number
  title
  url
  state
  merged
  isDraft
  isInMergeQueue
  milestone {
    ...MilestoneFields
  }
  author {
    ...AuthorFields
  }
  comments(last: $lastComments) {
    totalCount
    nodes {
      url
      author {
        ...AuthorFields
      }
      reactions {
        totalCount
      }
      reactionGroups {
        ...ReactionGroupFields
      }
    }
  }
  reviews(last: $lastReviews) {
    totalCount
    nodes {
      ...PullRequestReviewFields
    }
  }
  labels(first: $firstLabels) {
    nodes {
      ...LabelFields
    }
  }
  closingIssuesReferences(first: $firstClosingIssues) {
    nodes {
      number
    }
  }
  reactions {
    totalCount
  }
  reactionGroups {
    ...ReactionGroupFields
  }
}
fragment PullRequestReviewFields on PullRequestReview {
  state
  author {
    login
  }
}`) as unknown as TypedDocumentString<FetchPullRequestByNumberQuery, FetchPullRequestByNumberQueryVariables>;