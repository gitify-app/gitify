import { fetchDiscussion, getLatestDiscussionComment } from './helpers';
import {
  CheckSuiteAttributes,
  CheckSuiteStatus,
  DiscussionStateType,
  GitifySubject,
  Issue,
  IssueComments,
  Notification,
  PullRequest,
  PullRequestStateType,
  WorkflowRunAttributes,
} from '../typesGithub';
import { apiRequestAuth } from './api-requests';

export async function getGitifySubjectDetails(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return getGitifySubjectForCheckSuite(notification);
    case 'Discussion':
      return await getGitifySubjectForDiscussion(notification, token);
    case 'Issue':
      return await getGitifySubjectForIssue(notification, token);
    case 'PullRequest':
      return await getGitifySubjectForPullRequest(notification, token);
    case 'WorkflowRun':
      return getGitifySubjectForWorkflowRun(notification);
    default:
      return null;
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
        ? parseInt(groups.attemptNumber)
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
      return 'failure';
    case 'skipped':
      return 'skipped';
    case 'succeeded':
      return 'success';
    default:
      return null;
  }
}

export function getGitifySubjectForCheckSuite(
  notification: Notification,
): GitifySubject {
  return {
    state: getCheckSuiteAttributes(notification)?.status,
    user: null,
  };
}

export async function getGitifySubjectForDiscussion(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  const discussion = await fetchDiscussion(notification, token);
  let discussionState: DiscussionStateType = 'OPEN';

  if (discussion) {
    if (discussion.isAnswered) {
      discussionState = 'ANSWERED';
    }

    if (discussion.stateReason) {
      discussionState = discussion.stateReason;
    }
  }

  let comments = discussion.comments.nodes;
  let discussionUser = null;

  if (comments?.length) {
    discussionUser = getLatestDiscussionComment(comments)?.author.login;
  }

  return {
    state: discussionState,
    user: discussionUser,
  };
}

export async function getGitifySubjectForIssue(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  const issue: Issue = (
    await apiRequestAuth(notification.subject.url, 'GET', token)
  ).data;

  let issueCommentUser = null;
  if (notification.subject.latest_comment_url) {
    const issueComment: IssueComments = (
      await apiRequestAuth(
        notification.subject.latest_comment_url,
        'GET',
        token,
      )
    ).data;

    issueCommentUser = issueComment.user.login;
  }

  return {
    state: issue.state_reason ?? issue.state,
    user: issueCommentUser,
  };
}

export async function getGitifySubjectForPullRequest(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  const pr: PullRequest = (
    await apiRequestAuth(notification.subject.url, 'GET', token)
  ).data;

  let prCommentUser = null;
  if (notification.subject.latest_comment_url) {
    const prComment: IssueComments = (
      await apiRequestAuth(
        notification.subject.latest_comment_url,
        'GET',
        token,
      )
    ).data;

    prCommentUser = prComment.user.login;
  }

  let prState: PullRequestStateType = pr.state;
  if (pr.merged) {
    prState = 'merged';
  } else if (pr.draft) {
    prState = 'draft';
  }

  return {
    state: prState,
    user: prCommentUser,
  };
}

export function getGitifySubjectForWorkflowRun(
  notification: Notification,
): GitifySubject {
  return {
    state: getWorkflowRunAttributes(notification)?.status,
    user: null,
  };
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
