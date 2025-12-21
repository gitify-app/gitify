import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { RocketIcon } from '@primer/octicons-react';

import type { Link, SettingsState } from '../../../types';
import type {
  CheckSuiteStatus,
  GitifySubject,
  Notification,
  Subject,
  WorkflowRunAttributes,
} from '../../../typesGitHub';
import { actionsURL } from '../../helpers';
import { DefaultHandler } from './default';

class WorkflowRunHandler extends DefaultHandler {
  readonly type = 'WorkflowRun';

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    const state = getWorkflowRunAttributes(notification)?.status;

    if (state) {
      return {
        state: state,
        user: null,
        htmlUrl: getWorkflowRunUrl(notification),
      };
    }

    return null;
  }

  iconType(_subject: Subject): FC<OcticonProps> | null {
    return RocketIcon;
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/actions';
    return url.href as Link;
  }
}

export const workflowRunHandler = new WorkflowRunHandler();

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getWorkflowRunAttributes(
  notification: Notification,
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

function getWorkflowRunStatus(statusDisplayName: string): CheckSuiteStatus {
  switch (statusDisplayName) {
    case 'review':
      return 'waiting';
    default:
      return null;
  }
}

export function getWorkflowRunUrl(notification: Notification): Link {
  const filters = [];

  const workflowRunAttributes = getWorkflowRunAttributes(notification);

  if (workflowRunAttributes?.status) {
    filters.push(`is:${workflowRunAttributes.status}`);
  }

  return actionsURL(notification.repository.html_url, filters);
}
