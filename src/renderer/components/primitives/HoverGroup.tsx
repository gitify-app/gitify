import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';
import { cn } from '../../utils/cn';

interface IHoverGroup {
  bgColor: string;
  children: ReactNode;
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
        `group-hover:${bgColor}`,
      )}
    >
      {children}
    </Stack>
  );
};
