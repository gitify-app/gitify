import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Heading, Stack } from '@primer/react';

interface ITitle {
  icon: Icon;
  children: string;
  size?: number;
}

export const Title: FC<ITitle> = ({ size = 2, ...props }) => {
  return (
    <legend>
      <Stack
        direction="horizontal"
        align="center"
        gap="condensed"
        id={props.children.toLowerCase().replace(' ', '-')}
      >
        <props.icon size="small" />
        <Heading sx={{ fontSize: size }}>{props.children}</Heading>
      </Stack>
    </legend>
  );
};
