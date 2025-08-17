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
import type {
  GitifySubject,
  Notification,
  Subject,
  User,
} from '../../../typesGitHub';
import { getIssue, getIssueOrPullRequestComment } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import type { NotificationTypeHandler } from './types';
import { getSubjectUser } from './utils';

class IssueHandler implements NotificationTypeHandler {
  readonly type = 'Issue';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const issue = (
      await getIssue(notification.subject.url, notification.account.token)
    ).data;

    const issueState = issue.state_reason ?? issue.state;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(issueState, settings)) {
      return null;
    }

    let issueCommentUser: User;

    if (notification.subject.latest_comment_url) {
      const issueComment = (
        await getIssueOrPullRequestComment(
          notification.subject.latest_comment_url,
          notification.account.token,
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

  getIcon(subject: Subject): FC<OcticonProps> | null {
    switch (subject.state) {
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

export const issueHandler = new IssueHandler();
