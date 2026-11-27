import type { FC } from 'react';

import type { OcticonProps } from '@primer/octicons-react';
import { IssueClosedIcon, IssueOpenedIcon, SkipIcon } from '@primer/octicons-react';

import type { GitifyIssueStatusKind } from '../types';

const STATUS_RING = 'M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0';

/**
 * Render a status icon SVG using the same shape and accessibility defaults as
 * the Primer Octicons.
 */
function StatusSvg({
  className,
  fill = 'currentColor',
  paths,
  size = 16,
  ...props
}: Readonly<OcticonProps & { paths: string[] }>) {
  return (
    <svg
      aria-hidden={props['aria-label'] ? undefined : true}
      className={className}
      fill={fill}
      height={size}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {paths.map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}

/**
 * Issue status: Todo. Uses GitHub's ring with a quarter arc.
 */
export function IssueTodoIcon(props: Readonly<OcticonProps>) {
  return (
    <StatusSvg
      {...props}
      paths={[
        STATUS_RING,
        'M8 3a5 5 0 0 1 5 5 .75.75 0 0 1-1.5 0A3.5 3.5 0 0 0 8 4.5.75.75 0 0 1 8 3',
      ]}
    />
  );
}

/**
 * Issue status: In progress. Uses GitHub's ring with a half arc.
 */
export function IssueInProgressIcon(props: Readonly<OcticonProps>) {
  return (
    <StatusSvg
      {...props}
      paths={[
        STATUS_RING,
        'M8 3a5 5 0 0 1 0 10 .75.75 0 0 1 0-1.5 3.5 3.5 0 0 0 0-7A.75.75 0 0 1 8 3',
      ]}
    />
  );
}

/**
 * Issue status: In review. Uses GitHub's ring with a three-quarter arc.
 */
export function IssueInReviewIcon(props: Readonly<OcticonProps>) {
  return (
    <StatusSvg
      {...props}
      paths={[
        STATUS_RING,
        'M8 3a5 5 0 1 1-5 5 .75.75 0 0 1 1.5 0A3.5 3.5 0 1 0 8 4.5.75.75 0 0 1 8 3',
      ]}
    />
  );
}

/**
 * Resolve the row and pill glyph for a normalized issue status kind.
 *
 * Unknown kinds use the open issue glyph; callers that need a state-based
 * fallback should check the kind before using this helper.
 */
export function getIssueStatusIcon(kind: GitifyIssueStatusKind): FC<OcticonProps> {
  switch (kind) {
    case 'todo':
      return IssueTodoIcon;
    case 'in_progress':
      return IssueInProgressIcon;
    case 'in_review':
      return IssueInReviewIcon;
    case 'done':
      return IssueClosedIcon;
    case 'not_planned':
    case 'duplicate':
      return SkipIcon;
    default:
      return IssueOpenedIcon;
  }
}
