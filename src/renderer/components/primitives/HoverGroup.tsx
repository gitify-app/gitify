import type { ReactNode } from 'react';

import { Stack } from '@primer/react';

import { cn } from 'cn';

interface HoverGroupProps {
  children: ReactNode;
  bgColor:
    | 'group-hover:bg-gitify-account-rest'
    | 'group-hover:bg-gitify-account-error'
    | 'group-hover:bg-gitify-repository'
    | 'group-hover:bg-gitify-notification-hover';
  /**
   * Stretch the buttons to the group's full height. Used by the notification
   * row, where the actions form a full-height rail so the hit zone is
   * consistent regardless of the row's content height.
   */
  fullHeight?: boolean;
}

/**
 * Action cluster revealed on row/header hover.
 *
 * Spans the full height of its host (`inset-y-0`) and carries its own backdrop
 * (the `bgColor` fill plus the Glass treatment in `App.css`). In the
 * notification row it is hosted by the footer band, so it never overlaps the
 * title line or the issue number, and the footer reserves its width so the
 * pills wrap clear of the buttons.
 */
export function HoverGroup({ bgColor, children, fullHeight = false }: HoverGroupProps) {
  return (
    <Stack
      align={fullHeight ? 'stretch' : 'center'}
      className={cn(
        'gitify-hover-actions',
        fullHeight && 'gitify-hover-actions-full',
        'absolute inset-y-0 right-0 pr-1',
        'opacity-0 transition-opacity group-hover:opacity-100',
        bgColor,
      )}
      direction="horizontal"
      gap="none"
    >
      {children}
    </Stack>
  );
}
