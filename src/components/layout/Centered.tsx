import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

interface CenteredProps {
  children: ReactNode;
  fullHeight: boolean;
}

export const Centered: FC<CenteredProps> = (props: CenteredProps) => {
  return (
    <Stack
      align="center"
      className={props.fullHeight ? 'h-screen' : undefined}
      direction="vertical"
      justify="center"
      padding="spacious"
    >
      {props.children}
    </Stack>
  );
};
