import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { Portal, useAnchoredPosition } from '@primer/react';

import { cn } from 'cn';

/** Delay before a preview opens, so a cursor merely crossing the anchor does not flash a card. */
export const PREVIEW_OPEN_DELAY_MS = 400;
/** Delay before a preview closes, so moving the pointer onto the card does not dismiss it. */
export const PREVIEW_CLOSE_DELAY_MS = 150;

export interface PreviewCardProps {
  /** The anchor element that reveals the preview on hover/focus. */
  children: ReactNode;
  /** The preview content rendered in the floating card. */
  card: ReactNode;
  /** Accessible label for the anchor. */
  ariaLabel?: string;
  /** Test id for the rendered card, for assertions. */
  testId?: string;
  /** Override the open intent delay (milliseconds). */
  openDelayMs?: number;
  /** Override the close delay (milliseconds). */
  closeDelayMs?: number;
}

/**
 * Finds the nearest scrollable ancestor of an element, if any, falling back to
 * `null` when the element only scrolls with the window.
 */
function findScrollContainer(element: HTMLElement | null): HTMLElement | null {
  let current = element?.parentElement ?? null;

  while (current) {
    const { overflow, overflowY } = window.getComputedStyle(current);
    const isScrollable = /(auto|scroll|overlay)/.test(overflow + overflowY);

    if (isScrollable && current.scrollHeight > current.clientHeight) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

/**
 * A lightweight, hover-triggered preview card anchored to its child.
 *
 * Positioned with Primer's `useAnchoredPosition` and rendered in a portal so it
 * can escape the notification list's clipping and scrolling. It opens after a
 * hover-intent delay, closes shortly after the pointer leaves, and closes when
 * the list scrolls (mirroring the help tooltip). It deliberately performs no
 * focus management - a preview must never trap or steal focus from the list.
 */
export const PreviewCard: FC<PreviewCardProps> = ({
  children,
  card,
  ariaLabel,
  testId = 'preview-card',
  openDelayMs = PREVIEW_OPEN_DELAY_MS,
  closeDelayMs = PREVIEW_CLOSE_DELAY_MS,
}) => {
  const [open, setOpen] = useState(false);

  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { position } = useAnchoredPosition(
    {
      anchorElementRef: anchorRef,
      floatingElementRef: floatingRef,
      enabled: open,
      side: 'outside-bottom',
      align: 'start',
      anchorOffset: 6,
      displayInViewport: true,
    },
    [open],
  );

  const clearTimers = useCallback(() => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimerRef.current = setTimeout(() => setOpen(true), openDelayMs);
  }, [clearTimers, openDelayMs]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), closeDelayMs);
  }, [clearTimers, closeDelayMs]);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  // Close when the notification list scrolls; the anchor may move or unmount.
  useEffect(() => {
    if (!open) {
      return;
    }

    const scrollContainer = findScrollContainer(anchorRef.current);
    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => setOpen(false);
    scrollContainer.addEventListener('scroll', handleScroll);

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [open]);

  // Clear any pending timers when the anchor unmounts (e.g. a virtualized row
  // is recycled), so a stale card never opens after its anchor is gone.
  useEffect(() => clearTimers, [clearTimers]);

  return (
    <>
      <span
        aria-label={ariaLabel}
        className="inline-flex"
        onBlur={scheduleClose}
        onFocus={scheduleOpen}
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        ref={anchorRef}
      >
        {children}
      </span>

      {open && (
        <Portal>
          <div
            className={cn(
              'absolute z-10 w-72 p-2',
              'rounded-sm border border-gray-300 shadow-sm bg-gitify-tooltip-popout',
            )}
            data-testid={testId}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            ref={floatingRef}
            style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
          >
            <div
              className="max-h-[320px] overflow-y-auto"
              data-testid={`${testId}-scroll`}
              // A preview is informational only: it must never take focus.
              tabIndex={-1}
            >
              {card}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
