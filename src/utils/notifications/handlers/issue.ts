import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  IssueClosedIcon,
  IssueOpenedIcon,
  IssueReopenedIcon,
  SkipIcon,
} from '@primer/octicons-react';

import type {
  GitifyIssueState,
  GitifyNotification,
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import { IconColor } from '../../../types';
import { fetchIssueByNumber } from '../../api/client';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
  ): Promise<Partial<GitifySubject> | null> {
    const response = await fetchIssueByNumber(notification);
    const issue = response.data?.repository?.issue;

    if (!issue) {
      return null;
    }

    const issueState = issue.stateReason ?? issue.state;

    const issueComment = issue.comments?.nodes?.[0];

    const issueUser = getNotificationAuthor([
      issueComment?.author ?? undefined,
      issue.author ?? undefined,
    ]);

    return {
      number: issue.number,
      state: issueState,
      user: issueUser,
      comments: issue.comments.totalCount,
      labels: issue.labels?.nodes
        ?.filter((label): label is NonNullable<typeof label> => label != null)
        .map((label) => label.name),
      milestone: issue.milestone ?? undefined,
      htmlUrl: (issueComment?.url ?? issue.url) as Link,
    };
  }

  iconType(subject: GitifySubject): FC<OcticonProps> | null {
    switch (subject.state as GitifyIssueState) {
      case 'CLOSED':
      case 'COMPLETED':
        return IssueClosedIcon;
      case 'DUPLICATE':
      case 'NOT_PLANNED':
        return SkipIcon;
      case 'REOPENED':
        return IssueReopenedIcon;
      default:
        return IssueOpenedIcon;
    }
  }

  iconColor(subject: GitifySubject): IconColor {
    switch (subject.state as GitifyIssueState) {
      case 'OPEN':
      case 'REOPENED':
        return IconColor.GREEN;
      case 'CLOSED':
        return IconColor.RED;
      case 'COMPLETED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(subject);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(notification.repository.htmlUrl);
    url.pathname += '/issues';
    return url.href as Link;
  }
}

export const issueHandler = new IssueHandler();
