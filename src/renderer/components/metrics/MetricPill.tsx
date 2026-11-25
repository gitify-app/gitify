import type { FC, ReactNode } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Label, Stack, Text, Tooltip } from '@primer/react';

import { cn } from 'cn';

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
}

export interface MetricPillContentProps {
  metric?: string | number;
  icon?: Icon | FC<{ className?: string; size?: number }>;
  iconElement?: ReactNode;
  color: IconColor;
  metricClassName?: string;
}

/**
 * The visual body of a metric pill (icon + metric). Shared with the overflow
 * catch-all so it uses exactly the same padding and alignment as every other
 * metric pill.
 */
export function MetricPillContent(props: Readonly<MetricPillContentProps>) {
  const Icon = props.icon;

  return (
    <Label className="hover:bg-gitify-notification-pill-hover" size="small" variant="secondary">
      <Stack align="center" direction="horizontal" gap="none">
        {Icon ? <Icon className={props.color} size={Size.XSMALL} /> : props.iconElement}
        {props.metric ? (
          <Text className={cn('text-xxs pl-1', props.metricClassName)}>{props.metric}</Text>
        ) : null}
      </Stack>
    </Label>
  );
}

export function MetricPill(props: Readonly<MetricPillProps>) {
  return (
    // @ts-expect-error: We overload text with a ReactNode
    <Tooltip direction="s" text={props.contents}>
      <button aria-label={props.ariaLabel} type="button" onClick={props.onClick}>
        <MetricPillContent
          color={props.color}
          icon={props.icon}
          iconElement={props.iconElement}
          metric={props.metric}
          metricClassName={props.metricClassName}
        />
      </button>
    </Tooltip>
  );
}
