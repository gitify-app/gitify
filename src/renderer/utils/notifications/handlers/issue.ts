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
} from '../../../typesGitHub';
import { fetchIssueByNumber } from '../../api/client';
import { DefaultHandler } from './default';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  async enrich(
    notification: Notification,
    _settings: SettingsState,
  ): Promise<GitifySubject> {
    const response = await fetchIssueByNumber(notification);
    const issue = response.data.repository?.issue;

    // const issueState = issue.stateReason ?? issue.state;

    // Return early if this notification would be hidden by filters
    // if (isStateFilteredOut(issueState, settings)) {
    // return null;
    // }

    // const issueCommentUser = issue.comments.nodes[0]?.author;

    return {
      number: issue.number,
      // state: issueState
      state: null,
      user: null, //getSubjectUser([issueCommentUser, issue.author]),
      comments: issue.comments.totalCount,
      labels: issue.labels.nodes?.map((label) => label.name) ?? [],
      milestone: issue.milestone,
    };
  }

  iconType(subject: Subject): FC<OcticonProps> | null {
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
