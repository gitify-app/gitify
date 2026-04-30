import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { RocketIcon } from '@primer/octicons-react';

import type {
  GitifyCheckSuiteStatus,
  GitifyNotification,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';

import { DefaultHandler } from './default';
import { actionsURL } from './utils';

export interface WorkflowRunAttributes {
  user: string;
  statusDisplayName: string;
  status?: GitifyCheckSuiteStatus;
}

class WorkflowRunHandler extends DefaultHandler {
  override async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    const state = getWorkflowRunAttributes(notification)?.status;

    if (state) {
      return {
        state: state,
        user: undefined,
        htmlUrl: getWorkflowRunUrl(notification),
      };
    }

    return {};
  }

  override iconType(_notification: GitifyNotification): FC<OcticonProps> {
    return RocketIcon;
  }

  override defaultUrl(notification: GitifyNotification): Link {
    return getWorkflowRunUrl(notification);
  }
}

export const workflowRunHandler = new WorkflowRunHandler();

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getWorkflowRunAttributes(
  notification: GitifyNotification,
): WorkflowRunAttributes | null {
  const regex =
    /^(?<user>.*?) requested your (?<statusDisplayName>.*?) to deploy to an environment$/;

  const match = regex.exec(notification.subject.title);

  if (!match?.groups) {
    return null;
  }

  const { user, statusDisplayName } = match.groups;

  return {
    user: user,
    status: getWorkflowRunStatus(statusDisplayName),
    statusDisplayName: statusDisplayName,
  };
}

function getWorkflowRunStatus(
  statusDisplayName: string,
): GitifyCheckSuiteStatus | undefined {
  switch (statusDisplayName) {
    case 'review':
      return 'WAITING';
    default:
      return undefined;
  }
}

function getWorkflowRunUrl(notification: GitifyNotification): Link {
  const filters = [];

  const workflowRunAttributes = getWorkflowRunAttributes(notification);

  if (workflowRunAttributes?.status) {
    filters.push(`is:${workflowRunAttributes.status.toLowerCase()}`);
  }

  return actionsURL(notification.repository.htmlUrl, filters);
}
