import { type ReactNode, useEffect, useRef, useState } from 'react';

import { QuestionIcon } from '@primer/octicons-react';
import { AnchoredOverlay, IconButton } from '@primer/react';

import { cn } from 'cn';

import i18n from '../../i18n';

export interface HelpPopoverProps {
  name: string;
  /** Accessible name for the help button, e.g. the label of the control it explains. */
  label: string;
  content: ReactNode | string;
}

export function HelpPopover(props: Readonly<HelpPopoverProps>) {
  const [shouldShowContents, setShouldShowContents] = useState(false);

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldShowContents) {
      return;
    }

    const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
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

    const anchor = document.getElementById(props.name);
    scrollContainerRef.current = findScrollContainer(anchor);

    const handleScroll = () => {
      setShouldShowContents(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        !anchor?.contains(event.target as Node)
      ) {
        setShouldShowContents(false);
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
  }, [shouldShowContents, props.name]);

  return (
    <AnchoredOverlay
      align="start"
      open={shouldShowContents}
      renderAnchor={(anchorProps) => (
        <IconButton
          {...anchorProps}
          aria-label={i18n.t('help.button_label', 'Help: {{label}}', { label: props.label })}
          className="text-gitify-tooltip-icon!"
          data-testid={`tooltip-icon-${props.name}`}
          icon={QuestionIcon}
          id={props.name}
          onClick={() => setShouldShowContents(!shouldShowContents)}
          size="small"
          unsafeDisableTooltip={true}
          variant="invisible"
        />
      )}
      side="outside-bottom"
    >
      <div
        className={cn(
          'z-10 w-60 p-2',
          'text-left text-xs text-gitify-font',
          'rounded-gitify-sm border border-gitify-notification-border bg-gitify-tooltip-popout shadow-gitify-sm',
        )}
        data-testid={`tooltip-content-${props.name}`}
        ref={overlayRef}
        role="tooltip"
      >
        {props.content}
      </div>
    </AnchoredOverlay>
  );
}
