import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';
import { AnchoredOverlay } from '@primer/react';

import { cn } from '../../utils/cn';

export interface TooltipProps {
  name: string;
  tooltip: ReactNode | string;
}

export const Tooltip: FC<TooltipProps> = (props: TooltipProps) => {
  const [shouldShowTooltipContents, setShouldShowTooltipContents] =
    useState(false);

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldShowTooltipContents) {
      return;
    }

    // Find the scrollable parent container
    const findScrollContainer = (
      element: HTMLElement | null,
    ): HTMLElement | null => {
      if (!element) {
        return null;
      }

      const { overflow, overflowY } = window.getComputedStyle(element);
      const isScrollable = /(auto|scroll)/.test(overflow + overflowY);

      if (isScrollable && element.scrollHeight > element.clientHeight) {
        return element;
      }

      return findScrollContainer(element.parentElement);
    };

    const tooltipButton = document.getElementById(props.name);
    scrollContainerRef.current = findScrollContainer(tooltipButton);

    const handleScroll = () => {
      setShouldShowTooltipContents(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        !tooltipButton?.contains(event.target as Node)
      ) {
        setShouldShowTooltipContents(false);
      }
    };

    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', handleScroll);
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [shouldShowTooltipContents, props.name]);

  return (
    <AnchoredOverlay
      align="center"
      open={shouldShowTooltipContents}
      renderAnchor={(anchorProps) => (
        <button
          {...anchorProps}
          aria-label={props.name}
          data-testid={`tooltip-icon-${props.name}`}
          id={props.name}
          onClick={() =>
            setShouldShowTooltipContents(!shouldShowTooltipContents)
          }
          type="button"
        >
          <QuestionIcon className="text-gitify-tooltip-icon" />
        </button>
      )}
      side="outside-bottom"
    >
      <div
        className={cn(
          'z-10 w-60 p-2',
          'text-left text-xs text-gitify-font',
          'rounded-sm border border-gray-300 shadow-sm bg-gitify-tooltip-popout',
        )}
        data-testid={`tooltip-content-${props.name}`}
        ref={overlayRef}
        role="tooltip"
      >
        {props.tooltip}
      </div>
    </AnchoredOverlay>
  );
};
