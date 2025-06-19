import type { FC, ReactNode } from 'react';

import { Box } from '@primer/react';

import { cn } from '../../utils/cn';

interface IContents {
  children: ReactNode;
  paddingHorizontal?: boolean;
  paddingBottom?: boolean;
}

/**
 * Contents component holds the main content of a page.
 * It provides proper padding and handles scrolling.
 */
export const Contents: FC<IContents> = ({
  children,
  paddingHorizontal = true,
  paddingBottom = false,
}) => {
  return (
    <Box
      className={cn(
        'grow overflow-x-hidden overflow-y-auto',
        paddingHorizontal && 'px-8',
        paddingBottom && 'pb-4',
      )}
    >
      {children}
    </Box>
  );
};
