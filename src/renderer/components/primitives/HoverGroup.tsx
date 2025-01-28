import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';
import { cn } from '../../utils/cn';

interface IHoverGroup {
  children: ReactNode;
  bgColor:
    | 'group-hover:bg-gitify-account-rest'
    | 'group-hover:bg-gitify-repository'
    | 'group-hover:bg-gitify-notification-hover';
}

export const HoverGroup: FC<IHoverGroup> = ({
  bgColor,
  children,
}: IHoverGroup) => {
  return (
    <Stack
      direction="horizontal"
      align="center"
      gap="none"
      className={cn(
        'absolute right-0 h-full',
        'opacity-0 transition-opacity group-hover:opacity-100',
        bgColor,
      )}
    >
      {children}
    </Stack>
  );
};
