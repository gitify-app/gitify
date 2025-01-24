import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

interface IHoverGroup {
  children: ReactNode;
}

export const HoverGroup: FC<IHoverGroup> = ({ children }: IHoverGroup) => {
  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="none"
      className="opacity-0 transition-opacity group-hover:opacity-100 group-hover:bg-gitify-notification-hover absolute right-0 h-full"
    >
      {children}
    </Stack>
  );
};
