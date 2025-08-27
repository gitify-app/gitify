import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

interface ICentered {
  children: ReactNode;
  fullHeight: boolean;
}

export const Centered: FC<ICentered> = (props: ICentered) => {
  return (
    <Stack
      align="center"
      className={props.fullHeight && 'h-screen'}
      direction="vertical"
      justify="center"
      padding="spacious"
    >
      {props.children}
    </Stack>
  );
};
