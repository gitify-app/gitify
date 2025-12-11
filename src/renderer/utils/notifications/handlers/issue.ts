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
import { fetchIssueOrPullRequest } from '../../api/client';
import { isStateFilteredOut } from '../filters/filter';
import { DefaultHandler } from './default';
import { extractNumber } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  async enrich(
    notification: Notification,
    settings: SettingsState,
  ): Promise<GitifySubject> {
    const issueNo = extractNumber(notification.subject.url);

    const i = (await fetchIssueOrPullRequest(notification, issueNo)).data.data;

    console.log('ADAM ISSUE JSON', JSON.stringify(i, null, 2));

    const issue = (await fetchIssueOrPullRequest(notification, issueNo)).data
      .data.repository.issueOrPullRequest;
    // .(await getIssue(notification.subject.url, notification.account.token))
    // .data;

    const issueState = issue.stateReason ?? issue.state;

    // Return early if this notification would be hidden by filters
    if (isStateFilteredOut(issueState, settings)) {
      return null;
    }

    // const issueCommentUser: User = issue.comments.nodes[0].author;

    return {
      number: issue.number,
      state: issueState,
      user: null, //getSubjectUser([issueCommentUser, issue.author]),
      comments: null, //issue.comments,
      labels: issue.labels?.nodes.map((label) => label.name) ?? [],
      milestone: null, //issue.milestone,
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
