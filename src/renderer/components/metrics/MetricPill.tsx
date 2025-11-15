import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Label, Stack, Text } from '@primer/react';

import { type IconColor, Size } from '../../types';

export interface MetricPillProps {
  title: string;
  metric?: number;
  icon: Icon;
  color: IconColor;
}

export const MetricPill: FC<MetricPillProps> = (props: MetricPillProps) => {
  const Icon = props.icon;

  return (
    <Label
      className="hover:bg-gitify-notification-pill-hover"
      size="small"
      title={props.title}
      variant="secondary"
    >
      <Stack align="center" direction="horizontal" gap="none">
        <Icon className={props.color} size={Size.XSMALL} />
        {props.metric ? (
          <Text className="text-xxs px-1">{props.metric}</Text>
        ) : null}
      </Stack>
    </Label>
  );
};
