import type { FC } from 'react';

import type { Icon } from '@primer/octicons-react';
import { Box, Heading, Stack } from '@primer/react';

interface ITitle {
  icon: Icon;
  children: string;
  size?: number;
}

export const Title: FC<ITitle> = ({ size = 2, ...props }) => {
  return (
    <legend>
      <Box className="mb-2">
        <Stack
          align="center"
          direction="horizontal"
          gap="condensed"
          id={props.children.toLowerCase().replace(' ', '-')}
        >
          <props.icon size="small" />
          <Heading sx={{ fontSize: size }}>{props.children}</Heading>
        </Stack>
      </Box>
    </legend>
  );
};
