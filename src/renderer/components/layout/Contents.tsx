import { Box } from '@primer/react';
import type { FC, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface IContents {
  children: ReactNode;
  padding?: boolean;
}

/**
 * Contents component holds the main content of a page.
 * It provides proper padding and handles scrolling.
 */
export const Contents: FC<IContents> = ({ children, padding = true }) => {
  return (
    <Box className={cn('grow overflow-y-auto mb-4', padding && 'px-8')}>
      {children}
    </Box>
  );
};
