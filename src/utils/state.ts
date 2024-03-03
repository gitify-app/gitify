import { formatSearchQueryString } from './helpers';
import {
  CheckSuiteStatus,
  DiscussionStateSearchResultEdge,
  DiscussionStateType,
  GraphQLSearch,
  IssueStateType,
  Notification,
  PullRequestStateType,
  StateType,
} from '../typesGithub';
import { apiRequestAuth } from './api-requests';

export async function getNotificationState(
  notification: Notification,
  token: string,
): Promise<StateType> {
  switch (notification.subject.type) {
    case 'CheckSuite':
      return getCheckSuiteState(notification);
    case 'Discussion':
      return await getDiscussionState(notification, token);
    case 'Issue':
      return await getIssueState(notification, token);
    case 'PullRequest':
      return await getPullRequestState(notification, token);
    default:
      return null;
  }
}

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getCheckSuiteState(
  notification: Notification,
): CheckSuiteStatus | null {
  const lowerTitle = notification.subject.title.toLowerCase();

  if (lowerTitle.includes('cancelled for')) {
    return 'cancelled';
  }

  if (lowerTitle.includes('failed for')) {
    return 'failure';
  }

  if (lowerTitle.includes('skipped for')) {
    return 'skipped';
  }

  if (lowerTitle.includes('succeeded for')) {
    return 'success';
  }

  return null;
}

export async function getDiscussionState(
  notification: Notification,
  token: string,
): Promise<DiscussionStateType> {
  const response: GraphQLSearch<DiscussionStateSearchResultEdge> =
    await apiRequestAuth(`https://api.github.com/graphql`, 'POST', token, {
      query: `{
          search(query:"${formatSearchQueryString(
            notification.repository.full_name,
            notification.subject.title,
            notification.updated_at,
          )}", type: DISCUSSION, first: 10) {
            edges {
              node {
                ... on Discussion {
                  viewerSubscription
                  title
                  stateReason  
                  isAnswered
                }
              }
            }
          }
        }`,
    });

  let edges =
    response?.data?.data?.search?.edges?.filter(
      (edge) => edge.node.title === notification.subject.title,
    ) || [];

  if (edges.length > 1) {
    edges = edges.filter(
      (edge) => edge.node.viewerSubscription === 'SUBSCRIBED',
    );
  }

  if (edges[0]) {
    if (edges[0].node.isAnswered) {
      return 'ANSWERED';
    }

    if (edges[0].node.stateReason) {
      return edges[0].node.stateReason;
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
