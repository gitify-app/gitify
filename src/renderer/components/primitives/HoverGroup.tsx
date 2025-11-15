import type { FC, ReactNode } from 'react';

import { Stack } from '@primer/react';

import { cn } from '../../utils/cn';

interface HoverGroupProps {
  children: ReactNode;
  bgColor:
    | 'group-hover:bg-gitify-account-rest'
    | 'group-hover:bg-gitify-repository'
    | 'group-hover:bg-gitify-notification-hover';
}

export const HoverGroup: FC<HoverGroupProps> = ({
  bgColor,
  children,
}: HoverGroupProps) => {
  return (
    <Stack
      align="center"
      className={cn(
        'absolute inset-y-0 right-0 pr-1',
        'opacity-0 transition-opacity group-hover:opacity-100',
        bgColor,
      )}
      direction="horizontal"
      gap="none"
    >
      {children}
    </Stack>
  );
};
