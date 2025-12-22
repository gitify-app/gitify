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
  GitifySubject,
  Link,
  SettingsState,
} from '../../../types';
import { IconColor } from '../../../types';
import type { Notification, Subject } from '../../../typesGitHub';
import { fetchIssueByNumber } from '../../api/client';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    const response = await fetchIssueByNumber(notification);
    const issue = response.data.repository?.issue;

    const issueState = issue.stateReason ?? issue.state;

    const issueComment = issue.comments.nodes[0];

    const issueUser = getNotificationAuthor([
      issueComment?.author,
      issue.author,
    ]);

    return {
      number: issue.number,
      state: issueState,
      user: issueUser,
      comments: issue.comments.totalCount,
      labels: issue.labels?.nodes.map((label) => label.name) ?? [],
      milestone: issue.milestone,
      htmlUrl: issueComment?.url ?? issue.url,
    };
  }

  iconType(subject: Subject): FC<OcticonProps> | null {
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

  iconColor(subject: Subject): IconColor {
    switch (subject.state) {
      case 'open':
      case 'reopened':
        return IconColor.GREEN;
      case 'closed':
        return IconColor.RED;
      case 'completed':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(subject);
    }
  }

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/issues';
    return url.href as Link;
  }
}

export const issueHandler = new IssueHandler();
