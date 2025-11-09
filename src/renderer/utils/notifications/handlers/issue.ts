import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  IssueClosedIcon,
  IssueDraftIcon,
  IssueOpenedIcon,
  IssueReopenedIcon,
  SkipIcon,
} from '@primer/octicons-react';

import type { SettingsState } from '../../../types';
import type { GitifySubject, Notification, User } from '../../../typesGitHub';
import { getIssue, getIssueOrPullRequestComment } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import type { NotificationTypeHandler } from './types';
import { getSubjectUser } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  async enrich(settings: SettingsState): Promise<GitifySubject> {
    const issue = (
      await getIssue(
        this.notification.subject.url,
        this.notification.account.token,
      )
    ).data;

    const issueState = issue.state_reason ?? issue.state;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(issueState, settings)) {
      return null;
    }

    let issueCommentUser: User;

    if (this.notification.subject.latest_comment_url) {
      const issueComment = (
        await getIssueOrPullRequestComment(
          this.notification.subject.latest_comment_url,
          this.notification.account.token,
        )
      ).data;
      issueCommentUser = issueComment.user;
    }

    return {
      number: issue.number,
      state: issue.state_reason ?? issue.state,
      user: getSubjectUser([issueCommentUser, issue.user]),
      comments: issue.comments,
      labels: issue.labels?.map((label) => label.name) ?? [],
      milestone: issue.milestone,
    };
  }

  iconType(): FC<OcticonProps> | null {
    switch (this.notification.subject.state) {
      case 'draft':
        return IssueDraftIcon;
      case 'closed':
      case 'completed':
        return IssueClosedIcon;
      case 'not_planned':
        return SkipIcon;
      case 'reopened':
        return IssueReopenedIcon;
      default:
        return IssueOpenedIcon;
    }
  }
}

export function createIssueHandler(
  notification: Notification,
): NotificationTypeHandler {
  return new IssueHandler(notification);
}
