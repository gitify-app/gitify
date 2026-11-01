import type { ReactNode } from 'react';

import { cn } from 'cn';

export interface ExitCollapseProps {
  isExiting: boolean;
  children: ReactNode;
}

/**
 * Two-layer exit animation for a notification row or repository header.
 *
 * The outer layer slides and fades the content out over 350ms. Tailwind v4
 * emits `translate-x-full` as the `translate` property, so the transition list
 * must include `translate` as well as `transform`; transitioning only
 * `transform` makes the row jump right instead of sliding. The inner grid
 * layer then snaps the layout closed when the slide finishes, so a slow or
 * hanging request cannot leave an invisible row holding its height. The fixed
 * budget is the 350ms slide.
 *
 * `grid-cols-1` is load-bearing: a single implicit auto column would size to
 * the row's max-content width, so a long, unwrapped notification title would
 * widen the row past the list viewport and drag the absolutely positioned
 * action rail off with it. The explicit `minmax(0, 1fr)` track keeps the row at
 * the list width so the title truncates/wraps and the rail stays put.
 *
 * The transition classes stay mounted so a failed action can slide back in
 * smoothly, while the collapse transition only exists while exiting so the
 * layout snaps back as soon as the row is restored. Reduced-motion users skip
 * both transitions and collapse immediately.
 */
export function ExitCollapse({ isExiting, children }: Readonly<ExitCollapseProps>) {
  return (
    <div
      className={cn(
        'transition-[transform,translate,opacity] duration-350 ease-in-out motion-reduce:transition-none',
        isExiting && 'translate-x-full opacity-0 overflow-hidden',
      )}
      data-exit-motion={isExiting || undefined}
    >
      <div
        className={cn(
          'grid grid-cols-1',
          isExiting
            ? 'grid-rows-[0fr] transition-[grid-template-rows] duration-0 delay-350 motion-reduce:transition-none'
            : 'grid-rows-[1fr]',
        )}
        data-exit-collapse={isExiting || undefined}
      >
        <div className={cn('min-h-0 min-w-0', isExiting && 'overflow-hidden')}>{children}</div>
      </div>
    </div>
  );
}
