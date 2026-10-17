import type { ReactNode } from 'react';

import { Stack } from '@primer/react';

interface CenteredProps {
  children: ReactNode;
  fullHeight: boolean;
}

export function Centered(props: Readonly<CenteredProps>) {
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
}
