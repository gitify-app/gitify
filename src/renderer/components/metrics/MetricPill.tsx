import type { FC, ReactNode } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Label, Stack, Text, Tooltip } from '@primer/react';

import { type IconColor, Size } from '../../types';

export interface MetricPillProps {
  contents: string | ReactNode;
  metric?: number;
  icon: Icon;
  color: IconColor;
}

export const MetricPill: FC<MetricPillProps> = (props: MetricPillProps) => {
  const Icon = props.icon;

  return (
    // @ts-expect-error: We overload text with a ReactNode
    <Tooltip direction="s" text={props.contents}>
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
      </button>
    </Tooltip>
  );
};
