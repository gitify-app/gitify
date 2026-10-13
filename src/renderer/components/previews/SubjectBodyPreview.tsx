import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Stack, Text } from '@primer/react';

import { cn } from 'cn';

import { type IconColor, Opacity, Size } from '../../types';

import { MarkdownBody } from './MarkdownBody';

export interface SubjectBodyPreviewProps {
  /** GitHub-rendered HTML body of the issue, pull request, or discussion. */
  bodyHtml: string;
  /** Subject title, shown in the card header. */
  title?: string;
  /** Formatted subject number (e.g. `#123`). */
  number?: string;
  /** Formatted subject type label (e.g. `Open Issue`). */
  typeLabel?: string;
  /** Subject type icon. */
  icon?: Icon;
  /** Subject type icon colour. */
  iconColor?: IconColor;
}

/**
 * Preview of a notification subject's body, with a GitHub-style header (type
 * icon, type label, number, title) so the card also conveys what the
 * notification is - and the body rendered with its formatting preserved and
 * sanitised. The card scroll-caps long bodies.
 */
export const SubjectBodyPreview: FC<SubjectBodyPreviewProps> = ({
  bodyHtml,
  title,
  number,
  typeLabel,
  icon: Icon,
  iconColor,
}) => {
  const hasHeader = Boolean(title || typeLabel || Icon);

  return (
    <Stack data-testid="subject-preview" direction="vertical" gap="condensed">
      {hasHeader ? (
        <Stack align="center" direction="horizontal" gap="condensed">
          {Icon ? <Icon className={iconColor} size={Size.SMALL} /> : null}
          {typeLabel ? <Text className={cn('text-xxs', Opacity.MEDIUM)}>{typeLabel}</Text> : null}
          {number ? <Text className={cn('ml-auto text-xxs', Opacity.MEDIUM)}>{number}</Text> : null}
        </Stack>
      ) : null}

      {title ? <Text className="text-xs font-semibold">{title}</Text> : null}

      <MarkdownBody html={bodyHtml} testId="subject-body-preview" />
    </Stack>
  );
};
