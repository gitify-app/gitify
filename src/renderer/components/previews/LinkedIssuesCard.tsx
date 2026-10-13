import type { FC, MouseEvent } from 'react';

import { IssueClosedIcon, IssueOpenedIcon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { type GitifyLinkedIssue, type Link, IconColor, Opacity, Size } from '../../types';

import { formatGitHubNumber } from '../../utils/notifications/formatters';
import { openExternalLink } from '../../utils/system/comms';

/** Maximum number of linked issues listed before the rest are summarised. */
export const MAX_VISIBLE_LINKED_ISSUES = 5;

export interface LinkedIssuesCardProps {
  linkedIssues: GitifyLinkedIssue[];
}

/**
 * Preview listing the issues a pull request closes, each showing its number,
 * title, and state. Long lists are capped with a `+N more` summary.
 */
export const LinkedIssuesCard: FC<LinkedIssuesCardProps> = ({ linkedIssues }) => {
  if (!linkedIssues.length) {
    return null;
  }

  const visible = linkedIssues.slice(0, MAX_VISIBLE_LINKED_ISSUES);
  const hiddenCount = linkedIssues.length - visible.length;

  const handleOpen = (event: MouseEvent<HTMLButtonElement>, url: Link) => {
    // The card is portaled, so React events still bubble through the row.
    event.stopPropagation();
    openExternalLink(url);
  };

  return (
    <Stack data-testid="linked-issues-card" direction="vertical" gap="condensed">
      {visible.map((issue) => {
        const isClosed = issue.state !== 'OPEN';
        const StateIcon = isClosed ? IssueClosedIcon : IssueOpenedIcon;
        const number = formatGitHubNumber(issue.number);

        return (
          <button
            aria-label={`Open issue ${number} ${issue.title}`}
            className="flex items-center gap-1 text-left text-xs hover:underline"
            key={issue.number}
            onClick={(event) => handleOpen(event, issue.url)}
            type="button"
          >
            <StateIcon className={isClosed ? IconColor.RED : IconColor.GREEN} size={Size.XSMALL} />
            <Text className={cn('font-semibold', Opacity.MEDIUM)}>{number}</Text>
            <Text className={cn('truncate', Opacity.HIGH)}>{issue.title}</Text>
          </button>
        );
      })}

      {hiddenCount > 0 ? (
        <Text className={cn('text-xxs', Opacity.MEDIUM)}>{`+${hiddenCount} more`}</Text>
      ) : null}
    </Stack>
  );
};
