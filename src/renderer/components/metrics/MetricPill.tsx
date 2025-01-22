import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Label, Stack, Text } from '@primer/react';

import { type IconColor, Size } from '../../types';

export interface IMetricPill {
  key?: string;
  title: string;
  metric?: number;
  icon: Icon;
  color: IconColor;
}

export const MetricPill: FC<IMetricPill> = (props: IMetricPill) => {
  return (
    <Label
      variant="secondary"
      size="small"
      title={props.title}
      className="hover:bg-gitify-notification-pill-hover"
    >
      <Stack direction="horizontal" align="center" gap="none">
        <props.icon size={Size.XSMALL} className={props.color} />
        {props.metric && <Text className="text-xxs px-1">{props.metric}</Text>}
      </Stack>
    </Label>
  );
};
