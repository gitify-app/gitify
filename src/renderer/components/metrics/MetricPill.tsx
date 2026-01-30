import type { FC, ReactNode } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Label, Stack, Text, Tooltip } from '@primer/react';

import { type IconColor, Size } from '../../types';

export interface MetricPillProps {
  title: string;
  metric?: number;
  icon: Icon;
  color: IconColor;
  content?: ReactNode;
}

export const MetricPill: FC<MetricPillProps> = (props: MetricPillProps) => {
  const Icon = props.icon;

  return (
    <Tooltip direction="s" text={props.title}>
      <button type="button">
        <Label
          className="hover:bg-gitify-notification-pill-hover"
          size="small"
          tabIndex={0}
          variant="secondary"
        >
          <Stack align="center" direction="horizontal" gap="none">
            <Icon className={props.color} size={Size.XSMALL} />
            {props.metric ? (
              <Text className="text-xxs px-1">{props.metric}</Text>
            ) : null}
          </Stack>
        </Label>
        {props.content}
      </button>
    </Tooltip>
  );
};
