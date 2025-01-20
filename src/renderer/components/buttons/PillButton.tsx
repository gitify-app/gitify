import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Octicon, Stack, Text } from '@primer/react';

import { type IconColor, Size } from '../../types';

export interface IPillButton {
  key?: string;
  title: string;
  metric?: number;
  icon: Icon;
  color: IconColor;
}

export const PillButton: FC<IPillButton> = (props: IPillButton) => {
  return (
    <button
      title={props.title}
      type="button"
      className="flex gap-1 items-center text-xxs px-1 m-0.5 rounded-full bg-gitify-pill-rest hover:bg-gitify-pill-hover"
    >
      <Stack direction="horizontal" align="center" gap="condensed">
        <Octicon icon={props.icon} size={Size.XSMALL} className={props.color} />
        {props.metric && <Text>{props.metric}</Text>}
      </Stack>
    </button>
  );
};
