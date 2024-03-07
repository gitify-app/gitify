import { formatSearchQueryString } from './helpers';
import {
  CheckSuiteAttributes,
  CheckSuiteStatus,
  DiscussionStateSearchResultNode,
  DiscussionStateType,
  GraphQLSearch,
  IssueStateType,
  Notification,
  PullRequestStateType,
  StateType,
  WorkflowRunAttributes,
} from '../typesGithub';
import { apiRequestAuth } from './api-requests';

export async function getNotificationState(
  notification: Notification,
  token: string,
): Promise<StateType> {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return getCheckSuiteAttributes(notification)?.status;
    case 'Discussion':
      return await getDiscussionState(notification, token);
    case 'Issue':
      return await getIssueState(notification, token);
    case 'PullRequest':
      return await getPullRequestState(notification, token);
    case 'WorkflowRun':
      return getWorkflowRunAttributes(notification)?.status;
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

export async function getDiscussionState(
  notification: Notification,
  token: string,
): Promise<DiscussionStateType> {
  const response: GraphQLSearch<DiscussionStateSearchResultNode> =
    await apiRequestAuth(`https://api.github.com/graphql`, 'POST', token, {
      query: `{
        search(query:"${formatSearchQueryString(
          notification.repository.full_name,
          notification.subject.title,
          notification.updated_at,
        )}", type: DISCUSSION, first: 10) {
          nodes {
            ... on Discussion {
              viewerSubscription
              title
              stateReason  
              isAnswered
            }
          }
        }
      }`,
    });

  let discussions =
    response?.data?.data?.search?.nodes?.filter(
      (discussion) => discussion.title === notification.subject.title,
    ) || [];

  if (discussions.length > 1) {
    discussions = discussions.filter(
      (discussion) => discussion.viewerSubscription === 'SUBSCRIBED',
    );
  }

  if (discussions[0]) {
    const discussion = discussions[0];
    if (discussion.isAnswered) {
      return 'ANSWERED';
    }

    if (discussion.stateReason) {
      return discussion.stateReason;
    }
  }

  return 'OPEN';
}

export async function getIssueState(
  notification: Notification,
  token: string,
): Promise<IssueStateType> {
  const issue = (await apiRequestAuth(notification.subject.url, 'GET', token))
    .data;

  return issue.state_reason ?? issue.state;
}

export async function getPullRequestState(
  notification: Notification,
  token: string,
): Promise<PullRequestStateType> {
  const pr = (await apiRequestAuth(notification.subject.url, 'GET', token))
    .data;

  if (pr.merged) {
    return 'merged';
  } else if (pr.draft) {
    return 'draft';
  }

  return pr.state;
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
