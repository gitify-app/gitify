import { logError } from '../../shared/logger';
import type { Link } from '../types';
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

export async function getGitifySubjectDetails(
  notification: Notification,
): Promise<GitifySubject> {
  try {
    switch (notification.subject.type) {
      case 'CheckSuite':
        return getGitifySubjectForCheckSuite(notification);
      case 'Commit':
        return getGitifySubjectForCommit(notification);
      case 'Discussion':
        return await getGitifySubjectForDiscussion(notification);
      case 'Issue':
        return await getGitifySubjectForIssue(notification);
      case 'PullRequest':
        return await getGitifySubjectForPullRequest(notification);
      case 'Release':
        return await getGitifySubjectForRelease(notification);
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
): Promise<GitifySubject> {
  let user: User;

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
    state: null,
    user: getSubjectUser([user]),
  };
}

async function getGitifySubjectForDiscussion(
  notification: Notification,
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

  const latestDiscussionComment = getLatestDiscussionComment(
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

export function getLatestDiscussionComment(
  comments: DiscussionComment[],
): DiscussionComment | null {
  if (!comments || comments.length === 0) {
    return null;
  }

  // Return latest reply if available
  if (comments[0].replies.nodes.length === 1) {
    return comments[0].replies.nodes[0];
  }

  // Return latest comment if no replies
  return comments[0];
}

async function getGitifySubjectForIssue(
  notification: Notification,
): Promise<GitifySubject> {
  const issue = (
    await getIssue(notification.subject.url, notification.account.token)
  ).data;

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

  const reviews = await getLatestReviewForReviewers(notification);
  const linkedIssues = parseLinkedIssuesFromPr(pr);

  return {
    number: pr.number,
    state: prState,
    user: getSubjectUser([prCommentUser, pr.user]),
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

  const regexPattern = /\s*#(\d+)\s*/gi;

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
): Promise<GitifySubject> {
  const release = (
    await getRelease(notification.subject.url, notification.account.token)
  ).data;

  return {
    state: null,
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
