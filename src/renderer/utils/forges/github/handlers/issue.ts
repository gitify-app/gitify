import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import {
  IssueClosedIcon,
  IssueOpenedIcon,
  IssueReopenedIcon,
  SkipIcon,
} from '@primer/octicons-react';

import type {
  GitifyIssueField,
  GitifyIssueState,
  GitifyNotification,
  GitifySubject,
  Link,
} from '../../../../types';
import { IconColor } from '../../../../types';

import { fetchIssueByNumber } from '../client';
import type { IssueDetailsFragment } from '../graphql/generated/graphql';
import { DefaultHandler, defaultHandler } from './default';
import { getNotificationAuthor, mapIssueFieldColorToHex, mapIssueTypeColor } from './utils';

/**
 * A single node in the `issueFieldValues` GraphQL connection.
 */
type IssueFieldValueNode = NonNullable<
  NonNullable<IssueDetailsFragment['issueFieldValues']>['nodes']
>[number];

/**
 * Map a GitHub issue field value node to a normalized {@link GitifyIssueField}.
 *
 * Only nodes that carry a value and a resolvable field name are returned;
 * otherwise `undefined` so callers can filter out unset fields.
 */
function mapIssueFieldValue(node: IssueFieldValueNode): GitifyIssueField | undefined {
  if (!node) {
    return undefined;
  }

  switch (node.__typename) {
    case 'IssueFieldSingleSelectValue': {
      const fieldName = node.field && 'name' in node.field ? node.field.name : undefined;
      if (!fieldName || !node.name) {
        return undefined;
      }
      return {
        name: fieldName,
        value: node.name,
        color: mapIssueFieldColorToHex(node.color),
      };
    }
    case 'IssueFieldMultiSelectValue': {
      const fieldName = node.field && 'name' in node.field ? node.field.name : undefined;
      const optionNames = node.options.map((option) => option.name);
      if (!fieldName || optionNames.length === 0) {
        return undefined;
      }
      const coloredOption = node.options.find((option) => option.color);
      return {
        name: fieldName,
        value: optionNames.join(', '),
        ...(coloredOption ? { color: mapIssueFieldColorToHex(coloredOption.color) } : {}),
      };
    }
    case 'IssueFieldTextValue': {
      const fieldName = node.field && 'name' in node.field ? node.field.name : undefined;
      if (!fieldName || !node.textValue) {
        return undefined;
      }
      return { name: fieldName, value: node.textValue };
    }
    case 'IssueFieldDateValue': {
      const fieldName = node.field && 'name' in node.field ? node.field.name : undefined;
      if (!fieldName || !node.dateValue) {
        return undefined;
      }
      return { name: fieldName, value: node.dateValue };
    }
    case 'IssueFieldNumberValue': {
      const fieldName = node.field && 'name' in node.field ? node.field.name : undefined;
      if (!fieldName || node.numberValue === null || node.numberValue === undefined) {
        return undefined;
      }
      return { name: fieldName, value: String(node.numberValue) };
    }
    default:
      return undefined;
  }
}

class IssueHandler extends DefaultHandler {
  override readonly supportsMergedQueryEnrichment = true;

  override async enrich(
    notification: GitifyNotification,
    fetchedData?: IssueDetailsFragment,
  ): Promise<Partial<GitifySubject>> {
    const issue = fetchedData ?? (await fetchIssueByNumber(notification)).repository?.issue;

    if (!issue) {
      return {};
    }

    const issueState = issue.stateReason ?? issue.state;

    const issueComment = issue.comments?.nodes?.[0];

    const author = getNotificationAuthor([issue.author]);
    const commenter = getNotificationAuthor([issueComment?.author]);
    const issueUser = commenter ?? author;

    const issueReactionCount = issueComment?.reactions.totalCount ?? issue.reactions.totalCount;
    const issueReactionGroup = issueComment?.reactionGroups ?? issue.reactionGroups;

    return {
      number: issue.number,
      state: issueState,
      user: issueUser,
      author: author,
      commenter: commenter,
      commentCount: issue.comments.totalCount,
      labels:
        issue.labels?.nodes?.filter(Boolean).map((label) => ({
          name: label!.name,
          color: label!.color,
        })) ?? [],
      issueType: issue.issueType
        ? { name: issue.issueType.name, color: mapIssueTypeColor(issue.issueType.color) }
        : undefined,
      issueFields:
        (issue.issueFieldValues?.nodes ?? [])
          .map((node) => mapIssueFieldValue(node))
          .filter((field): field is GitifyIssueField => field !== undefined) ?? [],
      milestone: issue.milestone ?? undefined,
      htmlUrl: issueComment?.url ?? issue.url,
      reactionsCount: issueReactionCount,
      reactionGroups: issueReactionGroup ?? undefined,
    };
  }

  override iconType(notification: GitifyNotification): FC<OcticonProps> {
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

  override iconColor(notification: GitifyNotification): IconColor {
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

  override defaultUrl(notification: GitifyNotification): Link {
    const url = new URL(defaultHandler.defaultUrl(notification));
    url.pathname += '/issues';
    return url.href as Link;
  }
}

export const issueHandler = new IssueHandler();
