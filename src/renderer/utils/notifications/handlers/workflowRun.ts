import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { RocketIcon } from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  CheckSuiteStatus,
  GitifySubject,
  Notification,
  Subject,
  WorkflowRunAttributes,
} from '../../../typesGitHub';
import type { NotificationTypeHandler } from './types';

class WorkflowRunHandler implements NotificationTypeHandler {
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
      };
    }

    return null;
  }

  getIcon(_subject: Subject): FC<OcticonProps> | null {
    return RocketIcon;
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
