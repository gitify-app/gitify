import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

interface ICentered {
  children: ReactNode;
  fullHeight: boolean;
}

export const Centered: FC<ICentered> = (props: ICentered) => {
  return (
    <Stack
      direction="vertical"
      align="center"
      justify="center"
      padding="spacious"
      className={props.fullHeight && 'h-screen'}
    >
      {props.children}
    </Stack>
  );
};
