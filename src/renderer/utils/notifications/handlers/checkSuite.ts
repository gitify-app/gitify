import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  CheckIcon,
  RocketIcon,
  SkipIcon,
  StopIcon,
  XIcon,
} from '@primer/octicons-react';

import {
  type GitifyCheckSuiteStatus,
  type GitifyNotification,
  type GitifySubject,
  IconColor,
  type Link,
  type SettingsState,
} from '../../../types';
import { actionsURL } from '../../helpers';
import { DefaultHandler, defaultHandler } from './default';

export interface CheckSuiteAttributes {
  workflowName: string;
  attemptNumber?: number;
  statusDisplayName: string;
  status: GitifyCheckSuiteStatus | null;
  branchName: string;
}

class CheckSuiteHandler extends DefaultHandler {
  readonly type = 'CheckSuite';

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject>> {
    const state = getCheckSuiteAttributes(notification)?.status;

    if (state) {
      return {
        state: state,
        user: null,
        htmlUrl: getCheckSuiteUrl(notification),
      };
    }

    return {};
  }

  iconType(subject: GitifySubject): FC<OcticonProps> | null {
    switch (subject.state as GitifyCheckSuiteStatus) {
      case 'CANCELLED':
        return StopIcon;
      case 'FAILURE':
        return XIcon;
      case 'SKIPPED':
        return SkipIcon;
      case 'SUCCESS':
        return CheckIcon;
      default:
        return RocketIcon;
    }
  }

  iconColor(subject: GitifySubject): IconColor {
    switch (subject.state as GitifyCheckSuiteStatus) {
      case 'SUCCESS':
        return IconColor.GREEN;
      case 'FAILURE':
        return IconColor.RED;
      default:
        return defaultHandler.iconColor(subject);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    return getCheckSuiteUrl(notification);
  }
}

export const checkSuiteHandler = new CheckSuiteHandler();

/**
 * Ideally we would be using a GitHub API to fetch the CheckSuite / WorkflowRun state,
 * but there isn't an obvious/clean way to do this currently.
 */
export function getCheckSuiteAttributes(
  notification: GitifyNotification,
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
    attemptNumber: attemptNumber ? Number.parseInt(attemptNumber, 10) : null,
    status: getCheckSuiteStatus(statusDisplayName),
    statusDisplayName,
    branchName,
  };
}

function getCheckSuiteStatus(
  statusDisplayName: string,
): GitifyCheckSuiteStatus {
  switch (statusDisplayName) {
    case 'cancelled':
      return 'CANCELLED';
    case 'failed':
    case 'failed at startup':
      return 'FAILURE';
    case 'skipped':
      return 'SKIPPED';
    case 'succeeded':
      return 'SUCCESS';
    default:
      return null;
  }
}

export function getCheckSuiteUrl(notification: GitifyNotification): Link {
  const filters = [];

  const checkSuiteAttributes = getCheckSuiteAttributes(notification);

  if (checkSuiteAttributes?.workflowName) {
    filters.push(
      `workflow:"${checkSuiteAttributes.workflowName.replaceAll(' ', '+')}"`,
    );
  }

  if (checkSuiteAttributes?.status) {
    filters.push(`is:${checkSuiteAttributes.status}`);
  }

  if (checkSuiteAttributes?.branchName) {
    filters.push(`branch:${checkSuiteAttributes.branchName}`);
  }

  return actionsURL(notification.repository.htmlUrl, filters);
}
