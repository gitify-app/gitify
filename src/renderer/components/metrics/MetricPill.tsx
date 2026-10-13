import type { FC, ReactNode } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Label, Stack, Text, Tooltip } from '@primer/react';

import { cn } from 'cn';

import { PreviewCard } from '../primitives/PreviewCard';

import { type IconColor, Size } from '../../types';

export interface MetricPillProps {
  contents: string | ReactNode;
  metric?: string | number;
  icon?: Icon | FC<{ className?: string; size?: number }>;
  iconElement?: ReactNode;
  color: IconColor;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  metricClassName?: string;
  ariaLabel?: string;
  /** Optional rich hover preview. When provided, it replaces the text tooltip. */
  preview?: ReactNode;
  /** Test id for the rendered preview card. */
  previewTestId?: string;
}

export const MetricPill: FC<MetricPillProps> = (props: MetricPillProps) => {
  const Icon = props.icon;

  const button = (
    <button aria-label={props.ariaLabel} type="button" onClick={props.onClick}>
      <Label
        className="hover:bg-gitify-notification-pill-hover"
        size="small"
        tabIndex={props.onClick ? undefined : 0}
        variant="secondary"
      >
        <Stack align="center" direction="horizontal" gap="none">
          {Icon ? <Icon className={props.color} size={Size.XSMALL} /> : props.iconElement}
          {props.metric ? (
            <Text className={cn('text-xxs px-1', props.metricClassName)}>{props.metric}</Text>
          ) : null}
        </Stack>
      </Label>
    </button>
  );

  if (props.preview) {
    return (
      <PreviewCard ariaLabel={props.ariaLabel} card={props.preview} testId={props.previewTestId}>
        {button}
      </PreviewCard>
    );
  }

  return (
    // @ts-expect-error: We overload text with a ReactNode
    <Tooltip direction="s" text={props.contents}>
      {button}
    </Tooltip>
  );
};
