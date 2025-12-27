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
import {
  type IssueDetailsFragment,
  IssueDetailsFragmentDoc,
  IssueMergeQueryFragmentDoc,
} from '../../api/graphql/generated/graphql';
import { getQueryFragmentBody } from '../../api/graphql/utils';
import { DefaultHandler, defaultHandler } from './default';
import type { GraphQLMergedQueryConfig } from './types';
import { getNotificationAuthor } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  mergeQueryConfig() {
    return {
      queryFragment: getQueryFragmentBody(
        IssueMergeQueryFragmentDoc.toString(),
      ),

      responseFragment: IssueDetailsFragmentDoc.toString(),
      extras: [
        { name: 'lastComments', type: 'Int', defaultValue: 100 },
        { name: 'firstLabels', type: 'Int', defaultValue: 100 },
      ],
      selection: (
        index: number,
      ) => `node${index}: repository(owner: $owner${index}, name: $name${index}) {
          issue(number: $number${index}) {
            ...IssueDetails
          }
        }`,
    } as GraphQLMergedQueryConfig;
  }

  async enrich(
    _notification: Notification,
    _settings: SettingsState,
    fetchedData?: IssueDetailsFragment,
  ): Promise<GitifySubject> {
    const issue = fetchedData;

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
      labels: issue.labels?.nodes.map((label) => label.name),
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

  defaultUrl(notification: Notification): Link {
    const url = new URL(notification.repository.html_url);
    url.pathname += '/issues';
    return url.href as Link;
  }
}

export const issueHandler = new IssueHandler();
