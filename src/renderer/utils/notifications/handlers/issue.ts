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
import type { Notification, Subject } from '../../../typesGitHub';
import { fetchIssueByNumber } from '../../api/client';
import { isStateFilteredOut, isUserFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const response = await fetchIssueByNumber(notification);
    const issue = response.data.repository?.issue;

    const issueState = issue.stateReason ?? issue.state;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(issueState, settings)) {
      return null;
    }

    const issueCommentUser = issue.comments.nodes[0].author;

    const issueUser = getNotificationAuthor([issueCommentUser, issue.author]);

    // Return early if this notification would be hidden by user filters
    if (isUserFilteredOut(issueUser, settings)) {
      return null;
    }

    return {
      number: issue.number,
      state: issueState,
      user: issueUser,
      comments: issue.comments.totalCount,
      labels: issue.labels.nodes?.map((label) => label.name) ?? [],
      milestone: issue.milestone,
      htmlUrl: issue.comments.nodes[0]?.url ?? issue.url,
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

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/issues';
    return url.href as Link;
  }
}

export const issueHandler = new IssueHandler();
