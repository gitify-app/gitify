import type { FC, MouseEvent } from 'react';

import { cn } from 'cn';

import type { Link } from '../../types';

import { openExternalLink } from '../../utils/system/comms';
import { sanitizeHtml } from '../../utils/ui/sanitize';

export interface MarkdownBodyProps {
  /** GitHub-rendered HTML for the body. */
  html: string;
  /** Test id for the rendered container. */
  testId?: string;
}

/**
 * Renders a GitHub-rendered HTML body with its formatting preserved, using
 * Primer's `.markdown-body` styles. The HTML is sanitised before rendering, and
 * link clicks are intercepted so they open externally without activating the
 * notification row (React events still bubble through the portaled card).
 */
export const MarkdownBody: FC<MarkdownBodyProps> = ({ html, testId = 'markdown-body' }) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    // Never let a click inside the preview activate the notification row.
    event.stopPropagation();

    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');

    if (anchor && href) {
      event.preventDefault();
      openExternalLink(href as Link);
    }
  };

  return (
    <div
      className={cn('gitify-markdown-preview markdown-body text-xs', 'break-words')}
      data-testid={testId}
      onClick={handleClick}
      // Sanitised immediately above; this is the only sanctioned HTML sink.
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
};
