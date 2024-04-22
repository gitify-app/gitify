import type {
  CheckSuiteAttributes,
  CheckSuiteStatus,
  Commit,
  DiscussionStateType,
  GitifySubject,
  Issue,
  IssueComments,
  Notification,
  PullRequest,
  PullRequestStateType,
  ReleaseComments,
  SubjectUser,
  User,
  WorkflowRunAttributes,
} from '../typesGitHub';
import { apiRequestAuth } from './api-requests';
import { fetchDiscussion, getLatestDiscussionComment } from './helpers';

export async function getGitifySubjectDetails(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return getGitifySubjectForCheckSuite(notification);
    case 'Commit':
      return getGitifySubjectForCommit(notification, token);
    case 'Discussion':
      return await getGitifySubjectForDiscussion(notification, token);
    case 'Issue':
      return await getGitifySubjectForIssue(notification, token);
    case 'PullRequest':
      return await getGitifySubjectForPullRequest(notification, token);
    case 'Release':
      return await getGitifySubjectForRelease(notification, token);
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
  token: string,
): Promise<GitifySubject> {
  try {
    const commit: Commit = (
      await apiRequestAuth(notification.subject.url, 'GET', token)
    ).data;

    const commitCommentUser = await getLatestCommentUser(notification, token);

    return {
      state: null,
      user: {
        login: commitCommentUser?.login ?? commit.author.login,
        html_url: commitCommentUser?.html_url ?? commit.author.html_url,
        avatar_url: commitCommentUser?.avatar_url ?? commit.author.avatar_url,
        type: commitCommentUser?.type ?? commit.author.type,
      },
    };
  } catch (err) {
    console.error('Issue subject retrieval failed');
  }
}

async function getGitifySubjectForDiscussion(
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
    state: discussionState,
    user: discussionUser,
  };
}

async function getGitifySubjectForIssue(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  try {
    const issue: Issue = (
      await apiRequestAuth(notification.subject.url, 'GET', token)
    ).data;

    const issueCommentUser = await getLatestCommentUser(notification, token);

    return {
      state: issue.state_reason ?? issue.state,
      user: {
        login: issueCommentUser?.login ?? issue.user.login,
        html_url: issueCommentUser?.html_url ?? issue.user.html_url,
        avatar_url: issueCommentUser?.avatar_url ?? issue.user.avatar_url,
        type: issueCommentUser?.type ?? issue.user.type,
      },
    };
  } catch (err) {
    console.error('Issue subject retrieval failed');
  }
}

async function getGitifySubjectForPullRequest(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  try {
    const pr: PullRequest = (
      await apiRequestAuth(notification.subject.url, 'GET', token)
    ).data;

    let prState: PullRequestStateType = pr.state;
    if (pr.merged) {
      prState = 'merged';
    } else if (pr.draft) {
      prState = 'draft';
    }

    const prCommentUser = await getLatestCommentUser(notification, token);

    return {
      state: prState,
      user: {
        login: prCommentUser?.login ?? pr.user.login,
        html_url: prCommentUser?.html_url ?? pr.user.html_url,
        avatar_url: prCommentUser?.avatar_url ?? pr.user.avatar_url,
        type: prCommentUser?.type ?? pr.user.type,
      },
    };
  } catch (err) {
    console.error('Pull Request subject retrieval failed');
  }
}

async function getGitifySubjectForRelease(
  notification: Notification,
  token: string,
): Promise<GitifySubject> {
  const releaseCommentUser = await getLatestCommentUser(notification, token);

  return {
    state: null,
    user: {
      login: releaseCommentUser.login,
      html_url: releaseCommentUser.html_url,
      avatar_url: releaseCommentUser.avatar_url,
      type: releaseCommentUser.type,
    },
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

async function getLatestCommentUser(
  notification: Notification,
  token: string,
): Promise<User> | null {
  if (!notification.subject.latest_comment_url) {
    return null;
  }

  try {
    const response: IssueComments | ReleaseComments = (
      await apiRequestAuth(
        notification.subject.latest_comment_url,
        'GET',
        token,
      )
    )?.data;

    return (
      (response as IssueComments)?.user ?? (response as ReleaseComments).author
    );
  } catch (err) {
    console.error('Discussion latest comment retrieval failed');
  }
}
