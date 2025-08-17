import { differenceInMilliseconds } from 'date-fns';

import { logError } from '../../shared/logger';
import type { Link, SettingsState } from '../types';
import type {
  CheckSuiteAttributes,
  CheckSuiteStatus,
  DiscussionComment,
  DiscussionStateType,
  GitifyPullRequestReview,
  GitifySubject,
  Notification,
  PullRequest,
  PullRequestReview,
  PullRequestStateType,
  StateType,
  SubjectUser,
  User,
  WorkflowRunAttributes,
} from '../typesGitHub';
import {
  getCommit,
  getCommitComment,
  getIssue,
  getIssueOrPullRequestComment,
  getLatestDiscussion,
  getPullRequest,
  getPullRequestReviews,
  getRelease,
} from './api/client';
import {
  isStateFilteredOut,
  isUserFilteredOut,
} from './notifications/filters/filter';

export async function getGitifySubjectDetails(
  notification: Notification,
  settings: SettingsState,
): Promise<GitifySubject> {
  try {
    switch (notification.subject.type) {
      case 'CheckSuite':
        return getGitifySubjectForCheckSuite(notification);
      case 'Commit':
        return getGitifySubjectForCommit(notification, settings);
      case 'Discussion':
        return await getGitifySubjectForDiscussion(notification, settings);
      case 'Issue':
        return await getGitifySubjectForIssue(notification, settings);
      case 'PullRequest':
        return await getGitifySubjectForPullRequest(notification, settings);
      case 'Release':
        return await getGitifySubjectForRelease(notification, settings);
      case 'WorkflowRun':
        return getGitifySubjectForWorkflowRun(notification);
      default:
        return null;
    }
  } catch (err) {
    logError(
      'getGitifySubjectDetails',
      'failed to fetch details for notification for',
      err,
      notification,
    );
  }
}

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getCheckSuiteAttributes(
  notification: Notification,
): CheckSuiteAttributes | null {
  const regexPattern =
    /^(?<workflowName>.*?) workflow run(, Attempt #(?<attemptNumber>\d+))? (?<statusDisplayName>.*?) for (?<branchName>.*?) branch$/;

  const matches = regexPattern.exec(notification.subject.title);

  if (matches) {
    const { groups } = matches;

    return {
      workflowName: groups.workflowName,
      attemptNumber: groups.attemptNumber
        ? Number.parseInt(groups.attemptNumber)
        : null,
      status: getCheckSuiteStatus(groups.statusDisplayName),
      statusDisplayName: groups.statusDisplayName,
      branchName: groups.branchName,
    };
  }

  return null;
}

function getCheckSuiteStatus(statusDisplayName: string): CheckSuiteStatus {
  switch (statusDisplayName) {
    case 'cancelled':
      return 'cancelled';
    case 'failed':
    case 'failed at startup':
      return 'failure';
    case 'skipped':
      return 'skipped';
    case 'succeeded':
      return 'success';
    default:
      return null;
  }
}

function getGitifySubjectForCheckSuite(
  notification: Notification,
): GitifySubject {
  const state = getCheckSuiteAttributes(notification)?.status;

  if (state) {
    return {
      state: state,
      user: null,
    };
  }

  return null;
}

async function getGitifySubjectForCommit(
  notification: Notification,
  settings: SettingsState,
): Promise<GitifySubject> {
  let user: User;
  const commitState: StateType = null; // Commit notifications are stateless

  // Return early if this notification would be hidden by filters
  if (isStateFilteredOut(commitState, settings)) {
    return null;
  }

  if (notification.subject.latest_comment_url) {
    const commitComment = (
      await getCommitComment(
        notification.subject.latest_comment_url,
        notification.account.token,
      )
    ).data;

    user = commitComment.user;
  } else {
    const commit = (
      await getCommit(notification.subject.url, notification.account.token)
    ).data;

    user = commit.author;
  }

  return {
    state: commitState,
    user: getSubjectUser([user]),
  };
}

async function getGitifySubjectForDiscussion(
  notification: Notification,
  settings: SettingsState,
): Promise<GitifySubject> {
  const discussion = await getLatestDiscussion(notification);
  let discussionState: DiscussionStateType = 'OPEN';

  if (discussion) {
    if (discussion.isAnswered) {
      discussionState = 'ANSWERED';
    }

    if (discussion.stateReason) {
      discussionState = discussion.stateReason;
    }
  }

  // Return early if this notification would be hidden by filters
  if (isStateFilteredOut(discussionState, settings)) {
    return null;
  }

  // Return early if this notification would be hidden by filters
  if (isStateFilteredOut(discussionState, settings)) {
    return null;
  }

  const latestDiscussionComment = getClosestDiscussionCommentOrReply(
    notification,
    discussion.comments.nodes,
  );

  let discussionUser: SubjectUser = {
    login: discussion.author.login,
    html_url: discussion.author.url,
    avatar_url: discussion.author.avatar_url,
    type: discussion.author.type,
  };
  if (latestDiscussionComment) {
    discussionUser = {
      login: latestDiscussionComment.author.login,
      html_url: latestDiscussionComment.author.url,
      avatar_url: latestDiscussionComment.author.avatar_url,
      type: latestDiscussionComment.author.type,
    };
  }

  return {
    number: discussion.number,
    state: discussionState,
    user: discussionUser,
    comments: discussion.comments.totalCount,
    labels: discussion.labels?.nodes.map((label) => label.name) ?? [],
  };
}

export function getClosestDiscussionCommentOrReply(
  notification: Notification,
  comments: DiscussionComment[],
): DiscussionComment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  const targetTimestamp = notification.updated_at;

  const allCommentsAndReplies = comments.flatMap((comment) => [
    comment,
    ...comment.replies.nodes,
  ]);

  // Find the closest match using the target timestamp
  const closestComment = allCommentsAndReplies.reduce((prev, curr) => {
    const prevDiff = Math.abs(
      differenceInMilliseconds(prev.createdAt, targetTimestamp),
    );
    const currDiff = Math.abs(
      differenceInMilliseconds(curr.createdAt, targetTimestamp),
    );
    return currDiff < prevDiff ? curr : prev;
  }, allCommentsAndReplies[0]);

  return closestComment;
}

async function getGitifySubjectForIssue(
  notification: Notification,
  settings: SettingsState,
): Promise<GitifySubject> {
  const issue = (
    await getIssue(notification.subject.url, notification.account.token)
  ).data;

  const issueState = issue.state_reason ?? issue.state;

  // Return early if this notification would be hidden by filters
  if (isStateFilteredOut(issueState, settings)) {
    return null;
  }

  let issueCommentUser: User;

  if (notification.subject.latest_comment_url) {
    const issueComment = (
      await getIssueOrPullRequestComment(
        notification.subject.latest_comment_url,
        notification.account.token,
      )
    ).data;
    issueCommentUser = issueComment.user;
  }

  return {
    number: issue.number,
    state: issue.state_reason ?? issue.state,
    user: getSubjectUser([issueCommentUser, issue.user]),
    comments: issue.comments,
    labels: issue.labels?.map((label) => label.name) ?? [],
    milestone: issue.milestone,
  };
}

async function getGitifySubjectForPullRequest(
  notification: Notification,
  settings: SettingsState,
): Promise<GitifySubject> {
  const pr = (
    await getPullRequest(notification.subject.url, notification.account.token)
  ).data;

  let prState: PullRequestStateType = pr.state;
  if (pr.merged) {
    prState = 'merged';
  } else if (pr.draft) {
    prState = 'draft';
  }

  // Return early if this notification would be hidden by state filters
  if (isStateFilteredOut(prState, settings)) {
    return null;
  }

  let prCommentUser: User;
  if (
    notification.subject.latest_comment_url &&
    notification.subject.latest_comment_url !== notification.subject.url
  ) {
    const prComment = (
      await getIssueOrPullRequestComment(
        notification.subject.latest_comment_url,
        notification.account.token,
      )
    ).data;
    prCommentUser = prComment.user;
  }

  const prUser = getSubjectUser([prCommentUser, pr.user]);

  // Return early if this notification would be hidden by user filters
  if (isUserFilteredOut(prUser, settings)) {
    return null;
  }

  const reviews = await getLatestReviewForReviewers(notification);
  const linkedIssues = parseLinkedIssuesFromPr(pr);

  return {
    number: pr.number,
    state: prState,
    user: prUser,
    reviews: reviews,
    comments: pr.comments,
    labels: pr.labels?.map((label) => label.name) ?? [],
    linkedIssues: linkedIssues,
    milestone: pr.milestone,
  };
}

export async function getLatestReviewForReviewers(
  notification: Notification,
): Promise<GitifyPullRequestReview[]> | null {
  if (notification.subject.type !== 'PullRequest') {
    return null;
  }

  const prReviews = await getPullRequestReviews(
    `${notification.subject.url}/reviews` as Link,
    notification.account.token,
  );

  if (!prReviews.data.length) {
    return null;
  }

  // Find the most recent review for each reviewer
  const latestReviews: PullRequestReview[] = [];
  const sortedReviews = prReviews.data.reverse();
  for (const prReview of sortedReviews) {
    const reviewerFound = latestReviews.find(
      (review) => review.user.login === prReview.user.login,
    );

    if (!reviewerFound) {
      latestReviews.push(prReview);
    }
  }

  // Group by the review state
  const reviewers: GitifyPullRequestReview[] = [];
  for (const prReview of latestReviews) {
    const reviewerFound = reviewers.find(
      (review) => review.state === prReview.state,
    );

    if (!reviewerFound) {
      reviewers.push({
        state: prReview.state,
        users: [prReview.user.login],
      });
    } else {
      reviewerFound.users.push(prReview.user.login);
    }
  }

  // Sort reviews by state for consistent order when rendering
  return reviewers.sort((a, b) => {
    return a.state.localeCompare(b.state);
  });
}

export function parseLinkedIssuesFromPr(pr: PullRequest): string[] {
  const linkedIssues: string[] = [];

  if (!pr.body || pr.user.type !== 'User') {
    return linkedIssues;
  }

  const regexPattern = /\s?#(\d+)\s?/gi;
  const matches = pr.body.matchAll(regexPattern);

  for (const match of matches) {
    if (match[0]) {
      linkedIssues.push(match[0].trim());
    }
  }

  return linkedIssues;
}

async function getGitifySubjectForRelease(
  notification: Notification,
  settings: SettingsState,
): Promise<GitifySubject> {
  const releaseState: StateType = null; // Release notifications are stateless

  // Return early if this notification would be hidden by filters
  if (isStateFilteredOut(releaseState, settings)) {
    return null;
  }

  const release = (
    await getRelease(notification.subject.url, notification.account.token)
  ).data;

  return {
    state: releaseState,
    user: getSubjectUser([release.author]),
  };
}

function getGitifySubjectForWorkflowRun(
  notification: Notification,
): GitifySubject {
  const state = getWorkflowRunAttributes(notification)?.status;

  if (state) {
    return {
      state: state,
      user: null,
    };
  }

  return null;
}

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getWorkflowRunAttributes(
  notification: Notification,
): WorkflowRunAttributes | null {
  const regexPattern =
    /^(?<user>.*?) requested your (?<statusDisplayName>.*?) to deploy to an environment$/;

  const matches = regexPattern.exec(notification.subject.title);

  if (matches) {
    const { groups } = matches;

    return {
      user: groups.user,
      status: getWorkflowRunStatus(groups.statusDisplayName),
      statusDisplayName: groups.statusDisplayName,
    };
  }

  return null;
}

function getWorkflowRunStatus(statusDisplayName: string): CheckSuiteStatus {
  switch (statusDisplayName) {
    case 'review':
      return 'waiting';
    default:
      return null;
  }
}

/**
 * Construct the notification subject user based on an order prioritized list of users
 * @param users array of users in order or priority
 * @returns the subject user
 */
export function getSubjectUser(users: User[]): SubjectUser {
  let subjectUser: SubjectUser = null;

  for (const user of users) {
    if (user) {
      subjectUser = {
        login: user.login,
        html_url: user.html_url,
        avatar_url: user.avatar_url,
        type: user.type,
      };

      return subjectUser;
    }
  }

  return subjectUser;
}
