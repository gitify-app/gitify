import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  CheckIcon,
  RocketIcon,
  SkipIcon,
  StopIcon,
  XIcon,
} from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type {
  CheckSuiteAttributes,
  CheckSuiteStatus,
  GitifySubject,
  Notification,
  Subject,
} from '../../../typesGitHub';
import { DefaultHandler } from './default';

class CheckSuiteHandler extends DefaultHandler {
  readonly type = 'CheckSuite';

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    const state = getCheckSuiteAttributes(notification)?.status;

    if (state) {
      return {
        state: state,
        user: null,
      };
    }

    return null;
  }

  iconType(subject: Subject): FC<OcticonProps> | null {
    switch (subject.state) {
      case 'cancelled':
        return StopIcon;
      case 'failure':
        return XIcon;
      case 'skipped':
        return SkipIcon;
      case 'success':
        return CheckIcon;
      default:
        return RocketIcon;
    }
  }
}

export const checkSuiteHandler = new CheckSuiteHandler();

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getCheckSuiteAttributes(
  notification: Notification,
): CheckSuiteAttributes | null {
  const regex =
    /^(?<workflowName>.*?) workflow run(, Attempt #(?<attemptNumber>\d+))? (?<statusDisplayName>.*?) for (?<branchName>.*?) branch$/;

  const match = regex.exec(notification.subject.title);

  if (!match?.groups) {
    return null;
  }

  const { workflowName, attemptNumber, statusDisplayName, branchName } =
    match.groups;

  return {
    workflowName,
    attemptNumber: attemptNumber ? Number.parseInt(attemptNumber) : null,
    status: getCheckSuiteStatus(statusDisplayName),
    statusDisplayName,
    branchName,
  };
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
