import { type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { KebabHorizontalIcon } from '@primer/octicons-react';
import { AnchoredOverlay } from '@primer/react';

import { cn } from 'cn';

import { IconColor } from '../../types';

import { MetricPillContent } from './MetricPill';

const GAP = 4;
const OVERFLOW_CHIP_ESTIMATE = 44;

interface MetricPillsProps {
  pills: ReactNode[];
}

/**
 * Lays the metric pills out on a single line and collapses any that do not fit
 * into a `+N` catch-all chip. Visible pills stay left-aligned with the rest of
 * the footer text; the catch-all follows them directly.
 *
 * The popover itself is right-aligned to the chip and sized exactly to its
 * pills (no inner padding), in a single compact row. Pills are right-aligned
 * inside it so the overflow stays near the pointer.
 *
 * Hidden pills stay mounted (absolutely positioned, invisible) so their natural
 * widths can be re-measured when the row or window resizes. That lets pills
 * reappear inline as soon as there is room for them again.
 */
export function MetricPills({ pills }: Readonly<MetricPillsProps>) {
  const [visibleCount, setVisibleCount] = useState(pills.length);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Array<HTMLDivElement | null>>([]);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setIsOverflowOpen(false);
    }, 200);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  const count = Math.min(visibleCount, pills.length);
  const hiddenPills = pills.slice(count);

  const measure = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const available = container.clientWidth;

    if (!available) {
      // No layout (SSR/happy-dom): keep every pill inline.
      setVisibleCount(pills.length);
      return;
    }

    const widths = pills.map((_, index) => {
      const element = pillRefs.current[index];
      return element?.getBoundingClientRect().width ?? 0;
    });
    const chipWidth = chipRef.current?.getBoundingClientRect().width ?? OVERFLOW_CHIP_ESTIMATE;

    const next = getVisibleCount(widths, available, chipWidth);
    setVisibleCount((current) => (current === next ? current : next));
    setIsOverflowOpen((open) => (open && next === pills.length ? false : open));
  }, [pills]);

  useLayoutEffect(measure);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined' || !containerRef.current) {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    if (!isOverflowOpen) {
      return;
    }

    // Portaled popovers would otherwise stay pinned in place while the list
    // scrolls underneath them.
    const close = () => setIsOverflowOpen(false);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);

    return () => {
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [isOverflowOpen]);

  return (
    <div
      className="relative flex min-w-0 flex-1 items-center gap-1"
      data-testid="metric-pills"
      ref={containerRef}
    >
      {pills.map((pill, index) => {
        const isHidden = index >= count;

        return (
          <div
            aria-hidden={isHidden || undefined}
            className={cn(
              'flex shrink-0',
              isHidden && 'pointer-events-none invisible absolute left-0 top-0 w-max',
            )}
            inert={isHidden || undefined}
            key={index}
            ref={(element) => {
              pillRefs.current[index] = element;
            }}
          >
            {pill}
          </div>
        );
      })}

      {hiddenPills.length > 0 && (
        <div className="flex shrink-0" ref={chipRef}>
          <AnchoredOverlay
            align="end"
            anchorOffset={8}
            focusTrapSettings={{ disabled: true }}
            focusZoneSettings={{ disabled: true }}
            onClose={() => setIsOverflowOpen(false)}
            onOpen={() => setIsOverflowOpen(true)}
            open={isOverflowOpen}
            overlayProps={{
              preventFocusOnClose: true,
              preventFocusOnOpen: true,
              style: {
                background: 'transparent',
                borderRadius: 0,
                boxShadow: 'none',
                border: 'none',
                overflow: 'visible',
                padding: 0,
              },
            }}
            renderAnchor={(anchorProps) => (
              <button
                {...anchorProps}
                aria-label={`Show ${hiddenPills.length} more metrics`}
                className="shrink-0"
                data-testid="metric-overflow"
                onClick={(event) => {
                  // Never open the notification when toggling the overflow list.
                  event.stopPropagation();
                  setIsOverflowOpen(true);
                }}
                onMouseEnter={() => {
                  cancelClose();
                  setIsOverflowOpen(true);
                }}
                onMouseLeave={scheduleClose}
                title={`Show ${hiddenPills.length} more metrics`}
                type="button"
              >
                <MetricPillContent
                  color={IconColor.GRAY}
                  icon={KebabHorizontalIcon}
                  metric={hiddenPills.length}
                />
              </button>
            )}
            side="outside-bottom"
          >
            <div
              className={cn(
                'relative z-10 ml-auto flex w-max max-w-[calc(100vw-1rem)] flex-nowrap items-center justify-end gap-1 px-1 py-0.75',
                'rounded-gitify-sm border border-gitify-notification-border bg-gitify-tooltip-popout shadow-gitify-sm',
              )}
              data-testid="metric-overflow-popover"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <span
                aria-hidden="true"
                className="absolute -top-[5px] right-3 h-2.5 w-2.5 rotate-45 border-l border-t border-gitify-notification-border bg-gitify-tooltip-popout"
                data-testid="metric-overflow-caret"
              />
              {hiddenPills.map((pill, index) => (
                <div className="flex shrink-0" key={index}>
                  {pill}
                </div>
              ))}
            </div>
          </AnchoredOverlay>
        </div>
      )}
    </div>
  );
}

function getVisibleCount(widths: number[], available: number, chipWidth: number): number {
  const total = widths.reduce((sum, width, index) => sum + width + (index > 0 ? GAP : 0), 0);

  if (total <= available) {
    return widths.length;
  }

  const reserve = chipWidth + GAP;
  let used = 0;

  for (let index = 0; index < widths.length; index += 1) {
    const next = used + (index > 0 ? GAP : 0) + widths[index];

    if (next + reserve > available) {
      return index;
    }

    used = next;
  }

  return widths.length;
}
