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

export function MetricPill(props: Readonly<MetricPillProps>) {
  const Icon = props.icon;

  return (
    // @ts-expect-error: We overload text with a ReactNode
    <Tooltip direction="s" text={props.contents}>
      <button aria-label={props.ariaLabel} type="button" onClick={props.onClick}>
        <Label className="hover:bg-gitify-notification-pill-hover" size="small" variant="secondary">
          <Stack align="center" direction="horizontal" gap="none">
            {Icon ? <Icon className={props.color} size={Size.XSMALL} /> : props.iconElement}
            {props.metric ? (
              <Text className={cn('text-xxs px-1', props.metricClassName)}>{props.metric}</Text>
            ) : null}
          </Stack>
        </Label>
      </button>
    </Tooltip>
  );
}
