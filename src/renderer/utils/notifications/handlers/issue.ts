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
import type { IssueDetailsFragment } from '../../api/graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor } from './utils';

class IssueHandler extends DefaultHandler {
  readonly type = 'Issue';

  readonly supportsMergedQueryEnrichment = true;

  async enrich(
    notification: GitifyNotification,
    _settings: SettingsState,
    fetchedData?: IssueDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    const issue =
      fetchedData ?? (await fetchIssueByNumber(notification)).repository?.issue;

    const issueState = issue.stateReason ?? issue.state;

    const issueComment = issue.comments?.nodes?.[0];

    const issueUser = getNotificationAuthor([
      issueComment?.author,
      issue.author,
    ]);

    const issueReactionCount =
      issueComment?.reactions.totalCount ?? issue.reactions.totalCount;
    const issueReactionGroup =
      issueComment?.reactionGroups ?? issue.reactionGroups;

    return {
      number: issue.number,
      state: issueState,
      user: issueUser,
      commentCount: issue.comments.totalCount,
      labels:
        issue.labels?.nodes.map((label) => ({
          name: label.name,
          color: label.color,
        })) ?? [],
      milestone: issue.milestone ?? undefined,
      htmlUrl: issueComment?.url ?? issue.url,
      reactionsCount: issueReactionCount,
      reactionGroups: issueReactionGroup,
    };
  }

  iconType(notification: GitifyNotification): FC<OcticonProps> {
    switch (notification.subject.state as GitifyIssueState) {
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

  iconColor(notification: GitifyNotification): IconColor {
    switch (notification.subject.state as GitifyIssueState) {
      case 'OPEN':
      case 'REOPENED':
        return IconColor.GREEN;
      case 'CLOSED':
        return IconColor.RED;
      case 'COMPLETED':
        return IconColor.PURPLE;
      default:
        return defaultHandler.iconColor(notification);
    }
  }

  defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/issues';
    return url.href as Link;
  }
}

export const issueHandler = new IssueHandler();
